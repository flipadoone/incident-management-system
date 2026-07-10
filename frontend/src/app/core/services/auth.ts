import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiResponse } from '../models/api-response';
import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';
import { Token } from './token';

/**
 * Serviço responsável pelos casos de uso de autenticação.
 */
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly apiUrl = 'http://localhost:8080/api/v1/auth';

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: Token
  ) {}

  /**
   * Autentica o usuário na API.
   *
   * Quando o backend responde com sucesso, o JWT e os dados
   * públicos do usuário são armazenados no navegador.
   *
   * @param request e-mail e senha informados no formulário
   */
  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          this.tokenService.saveToken(response.data.token);
          this.tokenService.saveUser(response.data.user);
        })
      );
  }

  /**
   * Finaliza a sessão local do usuário.
   */
  logout(): void {
    this.tokenService.removeSession();
  }

  /**
   * Verifica se existe uma sessão armazenada.
   */
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }
}