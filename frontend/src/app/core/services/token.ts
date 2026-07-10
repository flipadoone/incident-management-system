import { Injectable } from '@angular/core';
import { UserResponse } from '../models/user-response';

/**
 * Serviço responsável por armazenar e recuperar os dados
 * da sessão autenticada no navegador.
 */
@Injectable({
  providedIn: 'root'
})
export class Token {
  private readonly tokenKey = 'viaappia_access_token';
  private readonly userKey = 'viaappia_authenticated_user';

  /**
   * Salva o JWT recebido após o login.
   *
   * @param token token de autenticação JWT
   */
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Recupera o token salvo.
   *
   * @returns token JWT ou null quando não existe uma sessão
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Salva os dados públicos do usuário autenticado.
   *
   * @param user usuário retornado pela API
   */
  saveUser(user: UserResponse): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Recupera o usuário autenticado.
   *
   * @returns usuário salvo ou null
   */
  getUser(): UserResponse | null {
    const storedUser = localStorage.getItem(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as UserResponse;
    } catch {
      this.removeSession();
      return null;
    }
  }

  /**
   * Informa se existe um token salvo.
   *
   * A validade real do token continuará sendo verificada pelo backend.
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Remove todos os dados da sessão atual.
   */
  removeSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}