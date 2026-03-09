import { Injectable, computed, signal } from '@angular/core';
import { Sesion } from '../models/sesion.model';
import { Usuario } from '../models/usuario.model';
import { StorageService } from './storage.service';

const SESSION_KEY = 'proyecto-tonelaje-session';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly _sesion = signal<Sesion>({
    autenticado: false,
    usuario: null
  });

  readonly sesion = computed(() => this._sesion());
  readonly usuarioActual = computed(() => this._sesion().usuario);
  readonly estaAutenticado = computed(() => this._sesion().autenticado);

  constructor(private storageService: StorageService) {
    const sesionGuardada = this.storageService.getItem<Sesion>(SESSION_KEY);
    if (sesionGuardada) {
      this._sesion.set(sesionGuardada);
    }
  }

  setSesion(usuario: Usuario): void {
    const sesion: Sesion = {
      autenticado: true,
      usuario
    };

    this._sesion.set(sesion);
    this.storageService.setItem(SESSION_KEY, sesion);
  }

  clearSesion(): void {
    const sesionVacia: Sesion = {
      autenticado: false,
      usuario: null
    };

    this._sesion.set(sesionVacia);
    this.storageService.removeItem(SESSION_KEY);
  }
}