import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Rol } from '../../../enums/rol.enum';
import { AsignacionTurno } from '../../../models/asignacion-turno.model';
import { SessionService } from '../../../services/session.service';
import { TurnoService } from '../../../services/turno.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-turno-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turno-formulario.html',
  styleUrl: './turno-formulario.scss'
})
export class TurnoFormularioComponent implements OnChanges {
  @Input() asignacionEditar: AsignacionTurno | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private turnoService = inject(TurnoService);
  private usuarioService = inject(UsuarioService);
  private sessionService = inject(SessionService);

  mensaje = '';
  error = '';

  readonly usuarioActual = computed(() => this.sessionService.usuarioActual());
  readonly operadores = computed(() => this.usuarioService.operadores());
  readonly supervisores = computed(() =>
    this.usuarioService.usuarios().filter(
      usuario => usuario.rol === Rol.ADMIN || usuario.rol === Rol.SUPERVISOR
    )
  );
  readonly turnos = computed(() => this.turnoService.turnos());

  form = this.fb.nonNullable.group({
    empleadoId: [0, [Validators.required, Validators.min(1)]],
    supervisorId: [0, [Validators.required, Validators.min(1)]],
    fechaAsignada: ['', [Validators.required]],
    turnoId: [0, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    void this.usuarioService.loadUsuarios();
    void this.turnoService.loadTurnos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['asignacionEditar']) {
      if (this.asignacionEditar) {
        this.form.patchValue({
          empleadoId: this.asignacionEditar.empleado.id,
          supervisorId: this.asignacionEditar.supervisor.id,
          fechaAsignada: this.asignacionEditar.fechaAsignada,
          turnoId: this.asignacionEditar.turno.id
        });
      } else {
        this.limpiarFormulario();
      }
    }
  }

  get modoEdicion(): boolean {
    return !!this.asignacionEditar;
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const usuarioSesion = this.usuarioActual();

    if (!usuarioSesion) {
      this.error = 'No existe una sesión activa';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { empleadoId, supervisorId, fechaAsignada, turnoId } =
      this.form.getRawValue();

    const empleado = this.usuarioService.getById(Number(empleadoId));
    const supervisorSeleccionado = this.usuarioService.getById(Number(supervisorId));

    if (!empleado) {
      this.error = 'Debe seleccionar un operador válido';
      return;
    }

    if (!supervisorSeleccionado) {
      this.error = 'Debe seleccionar un supervisor válido';
      return;
    }

    if (this.modoEdicion && this.asignacionEditar) {
      const resultado = await this.turnoService.actualizarAsignacion(
        this.asignacionEditar.id,
        {
          supervisor: supervisorSeleccionado,
          empleado,
          turnoId: Number(turnoId),
          fechaAsignada
        }
      );

      if (!resultado.ok) {
        this.error = resultado.message;
        return;
      }

      this.mensaje = resultado.message;
      this.guardado.emit();
      this.limpiarFormulario();
      return;
    }

    const resultado = await this.turnoService.asignarTurno({
      supervisor: supervisorSeleccionado,
      empleado,
      turnoId: Number(turnoId),
      fechaAsignada
    });

    if (!resultado.ok) {
      this.error = resultado.message;
      return;
    }

    this.mensaje = resultado.message;
    this.guardado.emit();
    this.limpiarFormulario();
  }

  cancelarEdicion(): void {
    this.asignacionEditar = null;
    this.limpiarFormulario();
    this.cancelado.emit();
  }

  private limpiarFormulario(): void {
    this.form.reset({
      empleadoId: 0,
      supervisorId: 0,
      fechaAsignada: '',
      turnoId: 0
    });
  }
}
