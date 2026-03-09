import { Injectable, computed, signal } from '@angular/core';
import { Rol } from '../enums/rol.enum';
import { Usuario } from '../models/usuario.model';
import { StorageService } from './storage.service';

const USERS_KEY = 'proyecto-tonelaje-users';

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

  constructor(private storageService: StorageService) {
    const usuariosGuardados = this.storageService.getItem<Usuario[]>(USERS_KEY);

    if (usuariosGuardados && usuariosGuardados.length > 0) {
      this._usuarios.set(usuariosGuardados);
    } else {
      const usuariosIniciales: Usuario[] = [
        {
          id: 1,
          username: 'Admin',
          password: '123456',
          rol: Rol.ADMIN
        }
      ];

      this._usuarios.set(usuariosIniciales);
      this.persistirUsuarios();
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

  crear(usuario: Omit<Usuario, 'id'>): { ok: boolean; message: string } {
    if (this.existeUsername(usuario.username)) {
      return {
        ok: false,
        message: 'El nombre de usuario ya existe'
      };
    }

    const nuevoUsuario: Usuario = {
      ...usuario,
      id: this.generarId()
    };

    this._usuarios.update(usuarios => [...usuarios, nuevoUsuario]);
    this.persistirUsuarios();

    return {
      ok: true,
      message: 'Usuario registrado correctamente'
    };
  }

  actualizar(
    id: number,
    cambios: Partial<Omit<Usuario, 'id'>>
  ): { ok: boolean; message: string } {
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

    const usuariosActualizados = [...usuarios];
    usuariosActualizados[index] = {
      ...usuariosActualizados[index],
      ...cambios
    };

    this._usuarios.set(usuariosActualizados);
    this.persistirUsuarios();

    return {
      ok: true,
      message: 'Usuario actualizado correctamente'
    };
  }

  eliminar(id: number): { ok: boolean; message: string } {
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

    this._usuarios.update(usuarios => usuarios.filter(item => item.id !== id));
    this.persistirUsuarios();

    return {
      ok: true,
      message: 'Usuario eliminado correctamente'
    };
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

  private persistirUsuarios(): void {
    this.storageService.setItem(USERS_KEY, this._usuarios());
  }

  private generarId(): number {
    const ids = this._usuarios().map(usuario => usuario.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }
}