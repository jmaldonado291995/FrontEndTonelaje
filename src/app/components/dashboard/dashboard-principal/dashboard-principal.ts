import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DashboardDia, DashboardVariableResumen } from '../../../models/dashboard-dia.model';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card';

@Component({
  selector: 'app-dashboard-principal',
  standalone: true,
  imports: [CommonModule, DashboardCardComponent],
  templateUrl: './dashboard-principal.html',
  styleUrl: './dashboard-principal.scss'
})
export class DashboardPrincipalComponent {
  private dashboardService = inject(DashboardService);

  fechaInicio = signal(this.obtenerFechaInicial());
  fechaFin = signal(this.obtenerFechaActual());
  dashboardData = signal<DashboardDia | null>(null);
  variableSeleccionadaId = signal<number | null>(null);

  readonly hayDatos = computed(() => this.dashboardData() !== null);
  readonly variableSeleccionada = computed(() => {
    const data = this.dashboardData();
    const variableId = this.variableSeleccionadaId();

    if (!data || data.variables.length === 0) {
      return null;
    }

    return data.variables.find(variable => variable.variableId === variableId) ?? data.variables[0];
  });
  readonly graficaActual = computed(() => {
    const data = this.dashboardData();
    const variable = this.variableSeleccionada();

    if (!data || !variable) {
      return [];
    }

    return data.graficaPorVariable[variable.variableId] ?? [];
  });

  constructor() {
    void this.buscarPorRango();
  }

  async onFechaInicioChange(event: Event): Promise<void> {
    const value = (event.target as HTMLInputElement).value;
    this.fechaInicio.set(value);
    await this.buscarPorRango();
  }

  async onFechaFinChange(event: Event): Promise<void> {
    const value = (event.target as HTMLInputElement).value;
    this.fechaFin.set(value);
    await this.buscarPorRango();
  }

  private formatearFechaLocal(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private obtenerFechaActual(): string {
    return this.formatearFechaLocal(new Date());
  }

  private obtenerFechaInicial(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30);
    return this.formatearFechaLocal(fecha);
  }

  async buscarPorRango(): Promise<void> {
    if (this.fechaInicio() > this.fechaFin()) {
      this.dashboardData.set(null);
      this.variableSeleccionadaId.set(null);
      return;
    }

    const resultado = await this.dashboardService.obtenerDashboardPorRango(
      this.fechaInicio(),
      this.fechaFin()
    );
    this.dashboardData.set(resultado);

    if (!resultado || resultado.variables.length === 0) {
      this.variableSeleccionadaId.set(null);
      return;
    }

    const variableActual = resultado.variables.find(
      variable => variable.variableId === this.variableSeleccionadaId()
    );

    this.variableSeleccionadaId.set(variableActual?.variableId ?? resultado.variables[0].variableId);
  }

  get rangoInvalido(): boolean {
    return this.fechaInicio() > this.fechaFin();
  }

  get subtituloRango(): string {
    return `${this.fechaInicio()} al ${this.fechaFin()}`;
  }

  getDescripcionVariable(variable: DashboardVariableResumen): string {
    const partes = [variable.descripcion, variable.fuente];

    if (variable.sitios.length > 0) {
      partes.push(`Sitios: ${variable.sitios.join(', ')}`);
    }

    return partes.filter(Boolean).join(' • ');
  }

  getValorVariable(variable: DashboardVariableResumen): string {
    if (!variable.unidad) {
      return String(variable.valorPromedio);
    }

    return `${variable.valorPromedio} ${variable.unidad}`;
  }

  seleccionarVariable(variableId: number): void {
    this.variableSeleccionadaId.set(variableId);
  }

  esVariableSeleccionada(variableId: number): boolean {
    return this.variableSeleccionada()?.variableId === variableId;
  }

  get tituloGrafica(): string {
    const variable = this.variableSeleccionada();

    if (!variable) {
      return 'Promedio por sede';
    }

    return `${variable.nombre} promedio por sede`;
  }

  get etiquetasEjeY(): number[] {
    const grafica = this.graficaActual();
    const maximo = Math.max(...grafica.map(item => item.value), 1);
    const paso = maximo / 3;

    return [3, 2, 1, 0].map(indice => Number((paso * indice).toFixed(2)));
  }

  getAlturaBarra(valor: number): number {
    const grafica = this.graficaActual();
    const maximo = Math.max(...grafica.map(item => item.value), 1);
    return Math.round((valor / maximo) * 180);
  }
}
