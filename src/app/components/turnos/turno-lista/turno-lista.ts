import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Rol } from '../../../enums/rol.enum';
import { AsignacionTurno } from '../../../models/asignacion-turno.model';
import { SessionService } from '../../../services/session.service';
import { TurnoService } from '../../../services/turno.service';
import { TurnoFormularioComponent } from '../turno-formulario/turno-formulario';

@Component({
  selector: 'app-turno-lista',
  standalone: true,
  imports: [CommonModule, TurnoFormularioComponent],
  templateUrl: './turno-lista.html',
  styleUrl: './turno-lista.scss'
})
export class TurnoListaComponent {
  private turnoService = inject(TurnoService);
  private sessionService = inject(SessionService);

  readonly asignaciones = computed(() => this.turnoService.asignaciones());
  readonly usuarioActual = computed(() => this.sessionService.usuarioActual());

  asignacionEditando = signal<AsignacionTurno | null>(null);

  mensaje = '';
  error = '';

  constructor() {
    void this.turnoService.loadTurnos();
    void this.turnoService.loadAsignaciones();
  }

  puedeGestionarTurnos(): boolean {
    const usuario = this.usuarioActual();
    return !!usuario && (usuario.rol === Rol.ADMIN || usuario.rol === Rol.SUPERVISOR);
  }

  editarAsignacion(asignacion: AsignacionTurno): void {
    this.mensaje = '';
    this.error = '';
    this.asignacionEditando.set(asignacion);
  }

  alGuardarFormulario(): void {
    this.asignacionEditando.set(null);
    this.mensaje = 'Operación realizada correctamente';
  }

  alCancelarFormulario(): void {
    this.asignacionEditando.set(null);
  }

  async eliminarAsignacion(id: number): Promise<void> {
    this.mensaje = '';
    this.error = '';

    if (!this.puedeGestionarTurnos()) {
      this.error = 'No tiene permisos para eliminar asignaciones';
      return;
    }

    const resultado = await this.turnoService.eliminarAsignacion(id);

    if (!resultado.ok) {
      this.error = resultado.message;
      return;
    }

    this.mensaje = resultado.message;

    if (this.asignacionEditando()?.id === id) {
      this.asignacionEditando.set(null);
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
