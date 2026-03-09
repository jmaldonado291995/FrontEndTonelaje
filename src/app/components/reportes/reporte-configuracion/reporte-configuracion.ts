 import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ReporteConfig } from '../../../models/reporte-config.model';
import { ReporteConfigService } from '../../../services/reporte-config.service';

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

  readonly configuraciones = computed(() => this.reporteConfigService.configuraciones());

  mensaje = '';
  error = '';
  modoEdicion = signal(false);
  idEditando = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required]],
    horaEjecucion: ['', [Validators.required]],
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    destinatariosTexto: ['', [Validators.required]]
  });

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { codigo, horaEjecucion, fechaInicio, fechaFin, destinatariosTexto } =
      this.form.getRawValue();

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

    const payload: Omit<ReporteConfig, 'id'> = {
      codigo,
      horaEjecucion,
      fechaInicio,
      fechaFin,
      destinatarios
    };

    if (this.modoEdicion() && this.idEditando()) {
      const resultado = this.reporteConfigService.actualizar(
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

    const resultado = this.reporteConfigService.crear(payload);

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
      codigo: config.codigo,
      horaEjecucion: config.horaEjecucion,
      fechaInicio: config.fechaInicio,
      fechaFin: config.fechaFin,
      destinatariosTexto: config.destinatarios.join(', ')
    });
  }

  eliminar(id: number): void {
    this.mensaje = '';
    this.error = '';

    const resultado = this.reporteConfigService.eliminar(id);

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
      codigo: '',
      horaEjecucion: '',
      fechaInicio: '',
      fechaFin: '',
      destinatariosTexto: ''
    });
  }
}