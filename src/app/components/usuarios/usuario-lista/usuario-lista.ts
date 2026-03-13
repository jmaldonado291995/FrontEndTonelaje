import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Rol } from '../../../enums/rol.enum';
import { Usuario } from '../../../models/usuario.model';
import { SessionService } from '../../../services/session.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioFormularioComponent } from '../usuario-formulario/usuario-formulario';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, UsuarioFormularioComponent],
  templateUrl: './usuario-lista.html',
  styleUrl: './usuario-lista.scss'
})
export class UsuarioListaComponent {
  private usuarioService = inject(UsuarioService);
  private sessionService = inject(SessionService);

  readonly Rol = Rol;
  readonly usuarios = computed(() => this.usuarioService.usuarios());
  readonly usuarioActual = computed(() => this.sessionService.usuarioActual());

  usuarioEditando = signal<Usuario | null>(null);

  mensaje = '';
  error = '';

  constructor() {
    void this.usuarioService.loadUsuarios();
  }

  puedeCrearUsuarios(): boolean {
    const usuario = this.usuarioActual();
    return !!usuario && (usuario.rol === Rol.ADMIN || usuario.rol === Rol.SUPERVISOR);
  }

  puedeMostrarFormulario(): boolean {
    return this.puedeCrearUsuarios() || !!this.usuarioEditando();
  }

  puedeVerAcciones(): boolean {
    return this.puedeCrearUsuarios();
  }

  puedeGestionarUsuario(usuarioObjetivo: Usuario): boolean {
    const usuarioSesion = this.usuarioActual();
    return this.usuarioService.puedeGestionarUsuario(usuarioSesion?.rol, usuarioObjetivo);
  }

  editarUsuario(usuario: Usuario): void {
    this.mensaje = '';
    this.error = '';

    if (!this.puedeGestionarUsuario(usuario)) {
      this.error = 'No tiene permisos para editar este usuario';
      return;
    }

    this.usuarioEditando.set(usuario);
  }

  alGuardarFormulario(): void {
    this.usuarioEditando.set(null);
    this.mensaje = 'Operación realizada correctamente';
  }

  alCancelarFormulario(): void {
    this.usuarioEditando.set(null);
  }

  async eliminarUsuario(id: number): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const usuarioObjetivo = this.usuarioService.getById(id);

    if (!usuarioObjetivo) {
      this.error = 'Usuario no encontrado';
      return;
    }

    if (!this.puedeGestionarUsuario(usuarioObjetivo)) {
      this.error = 'No tiene permisos para eliminar este usuario';
      return;
    }

    const resultado = await this.usuarioService.eliminar(id);

    if (!resultado.ok) {
      this.error = resultado.message;
      return;
    }

    this.mensaje = resultado.message;

    if (this.usuarioEditando()?.id === id) {
      this.usuarioEditando.set(null);
    }
  }

  getNombreRol(rol: Rol): string {
    switch (rol) {
      case Rol.ADMIN:
        return 'Administrador';
      case Rol.SUPERVISOR:
        return 'Supervisor';
      case Rol.OPERADOR:
        return 'Operador';
      default:
        return rol;
    }
  }
}
