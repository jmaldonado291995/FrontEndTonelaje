import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RoleDisableDirective } from '../../../directives/role-disable.directive';
import { Rol } from '../../../enums/rol.enum';
import { Usuario } from '../../../models/usuario.model';
import { SessionService } from '../../../services/session.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioFormularioComponent } from '../usuario-formulario/usuario-formulario';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [
    CommonModule,
    UsuarioFormularioComponent,
    RoleDisableDirective
  ],
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

  puedeGestionarUsuarios(): boolean {
    const usuario = this.usuarioActual();
    return !!usuario && (usuario.rol === Rol.ADMIN || usuario.rol === Rol.SUPERVISOR);
  }

  editarUsuario(usuario: Usuario): void {
    this.mensaje = '';
    this.error = '';
    this.usuarioEditando.set(usuario);
  }

  alGuardarFormulario(): void {
    this.usuarioEditando.set(null);
    this.mensaje = 'Operación realizada correctamente';
  }

  alCancelarFormulario(): void {
    this.usuarioEditando.set(null);
  }

  eliminarUsuario(id: number): void {
    this.mensaje = '';
    this.error = '';

    if (!this.puedeGestionarUsuarios()) {
      this.error = 'No tiene permisos para eliminar usuarios';
      return;
    }

    const resultado = this.usuarioService.eliminar(id);

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