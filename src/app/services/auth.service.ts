import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { SessionService } from './session.service';
import { API_BASE_URL } from '../config/api.config';
import { mapApiRoleToFront } from '../utils/api-mappers';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) {}

  async login(
    username: string,
    password: string
  ): Promise<{ ok: boolean; message: string; usuario?: Usuario }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          ok: boolean;
          message: string;
          token?: string;
          usuario?: {
            id: number;
            username: string;
            role: string;
          };
        }>(`${API_BASE_URL}/auth/login`, { username, password })
      );

      if (!response.ok || !response.usuario || !response.token) {
        return {
          ok: false,
          message: response.message || 'No se pudo iniciar sesión'
        };
      }

      const usuario: Usuario = {
        id: response.usuario.id,
        username: response.usuario.username,
        password: '',
        rol: mapApiRoleToFront(response.usuario.role)
      };

      this.sessionService.setSesion(usuario, response.token);

      return {
        ok: true,
        message: response.message || 'Inicio de sesión correcto',
        usuario
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo iniciar sesión. Verifique sus credenciales o conexión.'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${API_BASE_URL}/auth/logout`, {}));
    } catch {
      // Si falla logout remoto, igual se limpia sesión local.
    }

    this.sessionService.clearSesion();
  }
}
