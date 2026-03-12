import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ReporteManual } from '../models/reporte-manual.model';
import { API_BASE_URL } from '../config/api.config';
import { toEndOfDayISO, toStartOfDayISO } from '../utils/api-mappers';

interface VariableRecordResponse {
  id: number;
  value: number;
  recordedAt: string;
  site: string;
  variableId: number;
  variableName: string;
}

function normalizeVariableName(name?: string): string {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  constructor(private http: HttpClient) {}

  obtenerSedes(): string[] {
    return ['Todos', 'Planta A', 'Planta B', 'Planta C'];
  }

  async consultarReporteManual(filtros: {
    fechaInicio: string;
    fechaFin: string;
    sede: string;
  }): Promise<{ ok: boolean; message: string; data: ReporteManual[] }> {
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

    try {
      const records = await firstValueFrom(
        this.http.get<VariableRecordResponse[]>(`${API_BASE_URL}/variable-records/range`, {
          params: {
            start: toStartOfDayISO(fechaInicio),
            end: toEndOfDayISO(fechaFin)
          }
        })
      );

      const filtered = sede && sede !== 'Todos'
        ? records.filter(item => item.site === sede)
        : records;

      const grouped = new Map<string, ReporteManual>();
      let rowId = 1;

      for (const item of filtered) {
        const fechaRegistro = item.recordedAt.slice(0, 10);
        const key = `${item.site}|${fechaRegistro}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            id: rowId++,
            sede: item.site,
            fechaRegistro,
            tonelajeEntrante: 0,
            tonelajeSaliente: 0,
            amperajeBomba: 0,
            frecuenciaBombaAgua: 0,
            presionHidrociclones: 0
          });
        }

        const target = grouped.get(key)!;
        const variable = normalizeVariableName(item.variableName);

        if (variable === 'tonelajeentrante') {
          target.tonelajeEntrante = Number(item.value);
        } else if (variable === 'tonelajesaliente') {
          target.tonelajeSaliente = Number(item.value);
        } else if (variable === 'amperajebomba') {
          target.amperajeBomba = Number(item.value);
        } else if (variable === 'frecuenciabombaagua') {
          target.frecuenciaBombaAgua = Number(item.value);
        } else if (variable === 'presionhidrociclones') {
          target.presionHidrociclones = Number(item.value);
        }
      }

      const resultados = Array.from(grouped.values()).sort((a, b) =>
        a.fechaRegistro.localeCompare(b.fechaRegistro)
      );

      return {
        ok: true,
        message:
          resultados.length > 0
            ? 'Consulta realizada correctamente'
            : 'Sin datos. Realice una consulta.',
        data: resultados
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo consultar el reporte manual',
        data: []
      };
    }
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
