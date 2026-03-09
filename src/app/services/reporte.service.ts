import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ReporteManual } from '../models/reporte-manual.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly dataMock: ReporteManual[] = [
    {
      id: 1,
      sede: 'Planta A',
      fechaRegistro: '2026-01-01',
      tonelajeEntrante: 50,
      tonelajeSaliente: 120,
      amperajeBomba: 60,
      frecuenciaBombaAgua: 11.5,
      presionHidrociclones: 2.5
    },
    {
      id: 2,
      sede: 'Planta B',
      fechaRegistro: '2026-01-01',
      tonelajeEntrante: 60,
      tonelajeSaliente: 110,
      amperajeBomba: 70,
      frecuenciaBombaAgua: 10,
      presionHidrociclones: 3.5
    },
    {
      id: 3,
      sede: 'Planta C',
      fechaRegistro: '2026-01-02',
      tonelajeEntrante: 70,
      tonelajeSaliente: 90,
      amperajeBomba: 80,
      frecuenciaBombaAgua: 9.5,
      presionHidrociclones: 5.5
    },
    {
      id: 4,
      sede: 'Planta A',
      fechaRegistro: '2026-02-02',
      tonelajeEntrante: 50,
      tonelajeSaliente: 120,
      amperajeBomba: 60,
      frecuenciaBombaAgua: 11.5,
      presionHidrociclones: 2.5
    },
    {
      id: 5,
      sede: 'Planta A',
      fechaRegistro: '2026-02-27',
      tonelajeEntrante: 50,
      tonelajeSaliente: 70,
      amperajeBomba: 11.5,
      frecuenciaBombaAgua: 60,
      presionHidrociclones: 2.5
    },
    {
      id: 6,
      sede: 'Planta B',
      fechaRegistro: '2026-02-28',
      tonelajeEntrante: 55,
      tonelajeSaliente: 68,
      amperajeBomba: 11.2,
      frecuenciaBombaAgua: 59,
      presionHidrociclones: 2.3
    }
  ];

  obtenerSedes(): string[] {
    return ['Todos', 'Planta A', 'Planta B', 'Planta C'];
  }

  consultarReporteManual(filtros: {
    fechaInicio: string;
    fechaFin: string;
    sede: string;
  }): { ok: boolean; message: string; data: ReporteManual[] } {
    const { fechaInicio, fechaFin, sede } = filtros;

    if (!fechaInicio || !fechaFin) {
      return {
        ok: false,
        message: 'Debe seleccionar fecha inicio y fecha fin',
        data: []
      };
    }

    if (fechaFin < fechaInicio) {
      return {
        ok: false,
        message: 'La fecha fin no puede ser menor que la fecha inicio',
        data: []
      };
    }

    let resultados = this.dataMock.filter(
      item => item.fechaRegistro >= fechaInicio && item.fechaRegistro <= fechaFin
    );

    if (sede && sede !== 'Todos') {
      resultados = resultados.filter(item => item.sede === sede);
    }

    return {
      ok: true,
      message:
        resultados.length > 0
          ? 'Consulta realizada correctamente'
          : 'Sin datos. Realice una consulta.',
      data: resultados
    };
  }

  exportarReporteManualExcel(
    data: ReporteManual[],
    filtros: {
      fechaInicio: string;
      fechaFin: string;
      sede: string;
    }
  ): { ok: boolean; message: string } {
    if (!data || data.length === 0) {
      return {
        ok: false,
        message: 'No hay datos para exportar'
      };
    }

    const filasExcel = data.map(item => ({
      Sede: item.sede,
      'Fecha Registro': item.fechaRegistro,
      'Tonelaje Entrante (Ton)': item.tonelajeEntrante,
      'Tonelaje Saliente (Ton)': item.tonelajeSaliente,
      'Amperaje Bomba (A)': item.amperajeBomba,
      'Frecuencia Bomba Agua (Hz)': item.frecuenciaBombaAgua,
      'Presión Hidrociclones (kg/cm²)': item.presionHidrociclones
    }));

    const worksheet = XLSX.utils.json_to_sheet(filasExcel);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Manual');

    const nombreArchivo =
      `reporte_manual_${filtros.fechaInicio}_${filtros.fechaFin}_${filtros.sede.replace(/\s+/g, '_')}.xlsx`;

    const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(blob, nombreArchivo);

    return {
      ok: true,
      message: 'Reporte exportado correctamente'
    };
  }
}