import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Rol } from '../enums/rol.enum';
import { Usuario } from '../models/usuario.model';
import { API_BASE_URL } from '../config/api.config';
import { mapApiRoleToFront, mapFrontRoleToApi } from '../utils/api-mappers';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly _usuarios = signal<Usuario[]>([]);

  readonly usuarios = computed(() => this._usuarios());
  readonly supervisores = computed(() =>
    this._usuarios().filter(usuario => usuario.rol === Rol.SUPERVISOR)
  );
  readonly operadores = computed(() =>
    this._usuarios().filter(usuario => usuario.rol === Rol.OPERADOR)
  );

  constructor(private http: HttpClient) {
    this.loadUsuarios();
  }

  async loadUsuarios(): Promise<void> {
    try {
      const users = await firstValueFrom(
        this.http.get<Array<{ id: number; username: string; role: string }>>(`${API_BASE_URL}/users`)
      );

      this._usuarios.set(
        users.map(user => ({
          id: user.id,
          username: user.username,
          password: '',
          rol: mapApiRoleToFront(user.role)
        }))
      );
    } catch {
      this._usuarios.set([]);
    }
  }

  getAll(): Usuario[] {
    return this._usuarios();
  }

  getById(id: number): Usuario | undefined {
    return this._usuarios().find(usuario => usuario.id === id);
  }

  getByUsername(username: string): Usuario | undefined {
    return this._usuarios().find(
      usuario => usuario.username.toLowerCase() === username.toLowerCase()
    );
  }

  existeUsername(username: string): boolean {
    return this._usuarios().some(
      usuario => usuario.username.toLowerCase() === username.toLowerCase()
    );
  }

  async crear(usuario: Omit<Usuario, 'id'>): Promise<{ ok: boolean; message: string }> {
    if (this.existeUsername(usuario.username)) {
      return {
        ok: false,
        message: 'El nombre de usuario ya existe'
      };
    }

    try {
      const nuevo = await firstValueFrom(
        this.http.post<{ id: number; username: string; role: string }>(`${API_BASE_URL}/users`, {
          username: usuario.username,
          password: usuario.password,
          role: mapFrontRoleToApi(usuario.rol)
        })
      );

      this._usuarios.update(usuarios => [
        ...usuarios,
        {
          id: nuevo.id,
          username: nuevo.username,
          password: '',
          rol: mapApiRoleToFront(nuevo.role)
        }
      ]);

      return {
        ok: true,
        message: 'Usuario registrado correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo registrar el usuario'
      };
    }
  }

  async actualizar(
    id: number,
    cambios: Partial<Omit<Usuario, 'id'>>
  ): Promise<{ ok: boolean; message: string }> {
    const usuarios = this._usuarios();
    const index = usuarios.findIndex(usuario => usuario.id === id);

    if (index === -1) {
      return {
        ok: false,
        message: 'Usuario no encontrado'
      };
    }

    if (
      cambios.username &&
      usuarios.some(
        usuario =>
          usuario.id !== id &&
          usuario.username.toLowerCase() === cambios.username!.toLowerCase()
      )
    ) {
      return {
        ok: false,
        message: 'El nombre de usuario ya existe'
      };
    }

    const usuarioActual = usuarios[index];

    try {
      const actualizado = await firstValueFrom(
        this.http.put<{ id: number; username: string; role: string }>(`${API_BASE_URL}/users/${id}`, {
          username: cambios.username ?? usuarioActual.username,
          password: cambios.password ?? '',
          role: mapFrontRoleToApi((cambios.rol ?? usuarioActual.rol) as Rol)
        })
      );

      const usuariosActualizados = [...usuarios];
      usuariosActualizados[index] = {
        ...usuariosActualizados[index],
        username: actualizado.username,
        rol: mapApiRoleToFront(actualizado.role),
        password: ''
      };

      this._usuarios.set(usuariosActualizados);

      return {
        ok: true,
        message: 'Usuario actualizado correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo actualizar el usuario'
      };
    }
  }

  async eliminar(id: number): Promise<{ ok: boolean; message: string }> {
    const usuario = this.getById(id);

    if (!usuario) {
      return {
        ok: false,
        message: 'Usuario no encontrado'
      };
    }

    if (usuario.rol === Rol.ADMIN) {
      return {
        ok: false,
        message: 'No se puede eliminar al administrador principal'
      };
    }

    try {
      await firstValueFrom(this.http.delete(`${API_BASE_URL}/users/${id}`));

      this._usuarios.update(usuarios => usuarios.filter(item => item.id !== id));

      return {
        ok: true,
        message: 'Usuario eliminado correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo eliminar el usuario'
      };
    }
  }

  puedeCrearRol(rolActual: Rol, rolObjetivo: Rol): boolean {
    if (rolActual === Rol.ADMIN) {
      return rolObjetivo === Rol.SUPERVISOR || rolObjetivo === Rol.OPERADOR;
    }

    if (rolActual === Rol.SUPERVISOR) {
      return rolObjetivo === Rol.OPERADOR;
    }

    return false;
  }
}
