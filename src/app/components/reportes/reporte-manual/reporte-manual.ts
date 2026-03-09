import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ReporteManual } from '../../../models/reporte-manual.model';
import { ReporteService } from '../../../services/reporte.service';

@Component({
  selector: 'app-reporte-manual',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reporte-manual.html',
  styleUrl: './reporte-manual.scss'
})
export class ReporteManualComponent {
  private fb = inject(FormBuilder);
  private reporteService = inject(ReporteService);

  resultados = signal<ReporteManual[]>([]);
  mensaje = '';
  error = '';
  consultaRealizada = signal(false);

  readonly sedes = this.reporteService.obtenerSedes();

  form = this.fb.nonNullable.group({
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    sede: ['Todos', [Validators.required]]
  });

  buscar(): void {
    this.mensaje = '';
    this.error = '';
    this.consultaRealizada.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fechaInicio, fechaFin, sede } = this.form.getRawValue();

    const resultado = this.reporteService.consultarReporteManual({
      fechaInicio,
      fechaFin,
      sede
    });

    if (!resultado.ok) {
      this.error = resultado.message;
      this.resultados.set([]);
      return;
    }

    this.resultados.set(resultado.data);
    this.mensaje = resultado.message;
    this.consultaRealizada.set(true);
  }

  exportarExcel(): void {
    this.mensaje = '';
    this.error = '';

    const { fechaInicio, fechaFin, sede } = this.form.getRawValue();

    const resultado = this.reporteService.exportarReporteManualExcel(
      this.resultados(),
      {
        fechaInicio,
        fechaFin,
        sede
      }
    );

    if (!resultado.ok) {
      this.error = resultado.message;
      return;
    }

    this.mensaje = resultado.message;
  }

  limpiar(): void {
    this.form.reset({
      fechaInicio: '',
      fechaFin: '',
      sede: 'Todos'
    });

    this.resultados.set([]);
    this.mensaje = '';
    this.error = '';
    this.consultaRealizada.set(false);
  }
}