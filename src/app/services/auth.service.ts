import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { SessionService } from './session.service';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private sessionService: SessionService
  ) {}

  login(username: string, password: string): { ok: boolean; message: string; usuario?: Usuario } {
    const usuario = this.usuarioService.getByUsername(username);

    if (!usuario) {
      return {
        ok: false,
        message: 'El usuario es inválido'
      };
    }

    if (usuario.password !== password) {
      return {
        ok: false,
        message: 'La contraseña es incorrecta'
      };
    }

    this.sessionService.setSesion(usuario);

    return {
      ok: true,
      message: 'Inicio de sesión correcto',
      usuario
    };
  }

  logout(): void {
    this.sessionService.clearSesion();
  }
}