import { Injectable } from '@angular/core';
import { DashboardDia } from '../models/dashboard-dia.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly dataMock: DashboardDia[] = [
    {
      fecha: '2026-02-27',
      tonelajeEntrante: 50,
      tonelajeSaliente: 70,
      frecuenciaBombaAgua: 60,
      amperajeBomba: 11.5,
      presionHidrociclones: 2.5,
      graficaTonelaje: [
        { label: 'Planta A', value: 100 },
        { label: 'Planta B', value: 70 },
        { label: 'Planta C', value: 140 }
      ]
    },
    {
      fecha: '2026-02-28',
      tonelajeEntrante: 55,
      tonelajeSaliente: 68,
      frecuenciaBombaAgua: 59,
      amperajeBomba: 11.2,
      presionHidrociclones: 2.3,
      graficaTonelaje: [
        { label: 'Planta A', value: 120 },
        { label: 'Planta B', value: 90 },
        { label: 'Planta C', value: 110 }
      ]
    }
  ];

  obtenerDashboardPorFecha(fecha: string): DashboardDia | null {
    return this.dataMock.find(item => item.fecha === fecha) ?? null;
  }
}