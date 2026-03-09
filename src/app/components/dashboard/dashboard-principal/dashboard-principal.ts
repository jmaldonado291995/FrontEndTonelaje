import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DashboardDia } from '../../../models/dashboard-dia.model';
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

  fechaSeleccionada = signal('2026-02-27');
  dashboardData = signal<DashboardDia | null>(null);

  readonly hayDatos = computed(() => this.dashboardData() !== null);

  constructor() {
    this.buscarPorFecha();
  }

  onFechaChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechaSeleccionada.set(value);
    this.buscarPorFecha();
  }

  buscarPorFecha(): void {
    const resultado = this.dashboardService.obtenerDashboardPorFecha(
      this.fechaSeleccionada()
    );
    this.dashboardData.set(resultado);
  }

  getAlturaBarra(valor: number): number {
    const grafica = this.dashboardData()?.graficaTonelaje ?? [];
    const maximo = Math.max(...grafica.map(item => item.value), 1);
    return Math.round((valor / maximo) * 180);
  }
}