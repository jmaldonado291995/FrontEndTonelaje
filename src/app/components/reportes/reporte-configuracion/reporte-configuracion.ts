import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ReporteConfig } from '../../../models/reporte-config.model';
import { ReporteConfigService } from '../../../services/reporte-config.service';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-reporte-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reporte-configuracion.html',
  styleUrl: './reporte-configuracion.scss'
})
export class ReporteConfiguracionComponent {
  private fb = inject(FormBuilder);
  private reporteConfigService = inject(ReporteConfigService);
  private sessionService = inject(SessionService);

  readonly configuraciones = computed(() => this.reporteConfigService.configuraciones());

  mensaje = '';
  error = '';
  modoEdicion = signal(false);
  idEditando = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    sendTime: ['', [Validators.required]],
    active: [true, [Validators.required]],
    format: ['XLSX', [Validators.required]],
    destinatariosTexto: ['', [Validators.required]]
  });

  constructor() {
    void this.reporteConfigService.loadConfiguraciones();
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { sendTime, active, format, destinatariosTexto } = this.form.getRawValue();

    const destinatarios = destinatariosTexto
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (destinatarios.length === 0) {
      this.error = 'Debe ingresar al menos un destinatario';
      return;
    }

    const correosInvalidos = destinatarios.filter(
      correo => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    );

    if (correosInvalidos.length > 0) {
      this.error = 'Uno o más correos no tienen un formato válido';
      return;
    }

    const usuario = this.sessionService.usuarioActual();

    if (!usuario) {
      this.error = 'No existe una sesión activa';
      return;
    }

    const payload: Omit<ReporteConfig, 'id'> = {
      sendTime,
      active,
      format,
      createdById: usuario.id,
      createdByUsername: usuario.username,
      destinatarios
    };

    if (this.modoEdicion() && this.idEditando()) {
      const resultado = await this.reporteConfigService.actualizar(
        this.idEditando()!,
        payload
      );

      if (!resultado.ok) {
        this.error = resultado.message;
        return;
      }

      this.mensaje = resultado.message;
      this.cancelarEdicion();
      return;
    }

    const resultado = await this.reporteConfigService.crear(payload);

    if (!resultado.ok) {
      this.error = resultado.message;
      return;
    }

    this.mensaje = resultado.message;
    this.limpiarFormulario();
  }

  editar(config: ReporteConfig): void {
    this.mensaje = '';
    this.error = '';
    this.modoEdicion.set(true);
    this.idEditando.set(config.id);

    this.form.patchValue({
      sendTime: config.sendTime,
      active: config.active,
      format: config.format,
      destinatariosTexto: config.destinatarios.join(', ')
    });
  }

  async eliminar(id: number): Promise<void> {
    this.mensaje = '';
    this.error = '';

    const resultado = await this.reporteConfigService.eliminar(id);

    if (!resultado.ok) {
      this.error = resultado.message;
      return;
    }

    this.mensaje = resultado.message;

    if (this.idEditando() === id) {
      this.cancelarEdicion();
    }
  }

  cancelarEdicion(): void {
    this.modoEdicion.set(false);
    this.idEditando.set(null);
    this.limpiarFormulario();
  }

  private limpiarFormulario(): void {
    this.form.reset({
      sendTime: '',
      active: true,
      format: 'XLSX',
      destinatariosTexto: ''
    });
  }
}
