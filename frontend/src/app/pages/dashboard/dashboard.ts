import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { CreateIncidentRequest } from '../../core/models/create-incident-request';
import {
  Incident,
  IncidentCategory,
  IncidentPriority,
  IncidentStatus
} from '../../core/models/incident';
import { UpdateIncidentRequest } from '../../core/models/update-incident-request';
import { UserResponse } from '../../core/models/user-response';
import { Auth } from '../../core/services/auth';
import {
  IncidentFilters,
  IncidentService
} from '../../core/services/incident';
import { Token } from '../../core/services/token';

/**
 * Página principal para consulta e gerenciamento das demandas.
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  readonly user: UserResponse | null;

  incidents: Incident[] = [];

  loading = false;
  saving = false;
  modalOpen = false;

  /**
   * Guarda o ID da demanda que está sendo atualizada.
   *
   * Isso evita cliques duplicados somente no cartaz em processamento.
   */
  actionInProgressId: string | null = null;

  errorMessage = '';
  successMessage = '';

  readonly filterForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true
    }),

    status: new FormControl<IncidentStatus | ''>('', {
      nonNullable: true
    }),

    priority: new FormControl<IncidentPriority | ''>('', {
      nonNullable: true
    }),

    category: new FormControl<IncidentCategory | ''>('', {
      nonNullable: true
    })
  });

  readonly createForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(120)
      ]
    }),

    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(5)
      ]
    }),

    priority: new FormControl<IncidentPriority>('MEDIUM', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    category: new FormControl<IncidentCategory>('HARDWARE', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    location: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(150)
      ]
    })
  });

  constructor(
    private readonly authService: Auth,
    private readonly tokenService: Token,
    private readonly incidentService: IncidentService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.user = this.tokenService.getUser();
  }

  /**
   * Carrega as demandas assim que o dashboard é aberto.
   */
  ngOnInit(): void {
    this.loadIncidents();
  }

  /**
   * Busca as demandas aplicando os filtros informados.
   */
  loadIncidents(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters: IncidentFilters = {
      ...this.filterForm.getRawValue(),
      page: 0,
      size: 20
    };

    this.incidentService
      .findAll(filters)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          this.incidents = response.data.content;
          this.changeDetectorRef.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'Não foi possível carregar as demandas.'
          );

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  /**
   * Remove os filtros e recarrega o mural.
   */
  clearFilters(): void {
    this.filterForm.reset({
      title: '',
      status: '',
      priority: '',
      category: ''
    });

    this.loadIncidents();
  }

  /**
   * Abre o formulário de criação com valores iniciais seguros.
   */
  openCreateModal(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.createForm.reset({
      title: '',
      description: '',
      priority: 'MEDIUM',
      category: 'HARDWARE',
      location: ''
    });

    this.modalOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Fecha o formulário, exceto enquanto uma requisição estiver em andamento.
   */
  closeCreateModal(): void {
    if (this.saving) {
      return;
    }

    this.modalOpen = false;
    this.errorMessage = '';
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Registra uma nova demanda no backend.
   */
  createIncident(): void {
    if (this.createForm.invalid || this.saving) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const request: CreateIncidentRequest =
      this.createForm.getRawValue();

    this.incidentService
      .create(request)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          this.modalOpen = false;

          this.successMessage =
            `Demanda "${response.data.title}" criada com sucesso.`;

          this.loadIncidents();
          this.changeDetectorRef.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'Não foi possível criar a demanda.'
          );

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  /**
   * Inicia o atendimento de uma demanda aberta.
   */
  startIncident(incident: Incident): void {
    this.changeIncidentStatus(
      incident,
      'IN_PROGRESS',
      'iniciar o atendimento desta demanda'
    );
  }

  /**
   * Marca uma demanda em andamento como resolvida.
   */
  resolveIncident(incident: Incident): void {
    this.changeIncidentStatus(
      incident,
      'RESOLVED',
      'concluir esta demanda'
    );
  }

  /**
   * Reabre uma demanda anteriormente resolvida.
   */
  reopenIncident(incident: Incident): void {
    this.changeIncidentStatus(
      incident,
      'OPEN',
      'reabrir esta demanda'
    );
  }

  /**
   * Informa se determinada demanda está sendo atualizada.
   */
  isProcessing(incident: Incident): boolean {
    return this.actionInProgressId === incident.id;
  }

  /**
   * Encerra a sessão local e retorna para o login.
   */
  logout(): void {
    this.authService.logout();

    void this.router.navigate(['/login'], {
      replaceUrl: true
    });
  }

  priorityLabel(priority: IncidentPriority): string {
    const labels: Record<IncidentPriority, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      CRITICAL: 'Crítica'
    };

    return labels[priority];
  }

  statusLabel(status: IncidentStatus): string {
    const labels: Record<IncidentStatus, string> = {
      OPEN: 'Aberta',
      IN_PROGRESS: 'Em andamento',
      RESOLVED: 'Resolvida',
      CLOSED: 'Fechada'
    };

    return labels[status];
  }

  categoryLabel(category: IncidentCategory): string {
    const labels: Record<IncidentCategory, string> = {
      HARDWARE: 'Hardware',
      SOFTWARE: 'Software',
      NETWORK: 'Rede',
      SECURITY: 'Segurança',
      OTHER: 'Outro'
    };

    return labels[category];
  }

  trackById(_index: number, incident: Incident): string {
    return incident.id;
  }

  /**
   * Atualiza somente o status, preservando todos os demais dados.
   *
   * A interface só será atualizada depois da confirmação do backend.
   */
  private changeIncidentStatus(
    incident: Incident,
    newStatus: IncidentStatus,
    confirmationAction: string
  ): void {
    if (this.actionInProgressId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja realmente ${confirmationAction}?`
    );

    if (!confirmed) {
      return;
    }

    this.actionInProgressId = incident.id;
    this.errorMessage = '';
    this.successMessage = '';

    const request: UpdateIncidentRequest = {
      title: incident.title,
      description: incident.description,
      status: newStatus,
      priority: incident.priority,
      category: incident.category,
      location: incident.location
    };

    this.incidentService
      .update(incident.id, request)
      .pipe(
        finalize(() => {
          this.actionInProgressId = null;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          this.successMessage =
            `Demanda "${response.data.title}" atualizada para ` +
            `"${this.statusLabel(response.data.status)}".`;

          /*
           * Substitui no mural somente o registro confirmado pelo backend.
           */
          this.incidents = this.incidents.map(currentIncident =>
            currentIncident.id === response.data.id
              ? response.data
              : currentIncident
          );

          this.changeDetectorRef.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'Não foi possível atualizar o status da demanda.'
          );

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  /**
   * Traduz erros HTTP em mensagens amigáveis.
   */
  private getErrorMessage(
    error: HttpErrorResponse,
    fallbackMessage: string
  ): string {
    if (error.status === 0) {
      return 'Não foi possível conectar ao backend.';
    }

    if (error.status === 400) {
      return error.error?.message ??
        'Revise os dados informados.';
    }

    if (error.status === 401) {
      return 'Sua sessão expirou. Faça login novamente.';
    }

    if (error.status === 403) {
      return 'Você não possui permissão para esta operação.';
    }

    if (error.status === 404) {
      return 'A demanda não foi encontrada.';
    }

    return error.error?.message ?? fallbackMessage;
  }
}