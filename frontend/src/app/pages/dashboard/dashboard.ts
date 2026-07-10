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
import { UserResponse } from '../../core/models/user-response';
import { Auth } from '../../core/services/auth';
import {
  IncidentFilters,
  IncidentService
} from '../../core/services/incident';
import { Token } from '../../core/services/token';

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
        Validators.maxLength(150)
      ]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(2000)
      ]
    }),
    status: new FormControl<IncidentStatus>('OPEN', {
      nonNullable: true,
      validators: [Validators.required]
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
        Validators.required,
        Validators.maxLength(200)
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

  ngOnInit(): void {
    this.loadIncidents();
  }

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

  clearFilters(): void {
    this.filterForm.reset({
      title: '',
      status: '',
      priority: '',
      category: ''
    });

    this.loadIncidents();
  }

  openCreateModal(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.createForm.reset({
      title: '',
      description: '',
      status: 'OPEN',
      priority: 'MEDIUM',
      category: 'HARDWARE',
      location: ''
    });

    this.modalOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  closeCreateModal(): void {
    if (this.saving) {
      return;
    }

    this.modalOpen = false;
    this.errorMessage = '';
    this.changeDetectorRef.markForCheck();
  }

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
      ACCESS: 'Acesso',
      OTHER: 'Outro'
    };

    return labels[category];
  }

  trackById(_index: number, incident: Incident): string {
    return incident.id;
  }

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

    return error.error?.message ?? fallbackMessage;
  }
}