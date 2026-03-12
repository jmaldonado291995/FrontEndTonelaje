import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DashboardDia, DashboardGraficaItem, DashboardVariableResumen } from '../models/dashboard-dia.model';
import { API_BASE_URL } from '../config/api.config';
import { toEndOfDayISO, toStartOfDayISO } from '../utils/api-mappers';

interface VariableRecordResponse {
  id: number;
  value: number;
  recordedAt: string;
  site: string;
  variableId: number;
  variableName: string;
  variableSource: string;
  variableDescription: string;
}

function normalizeVariableName(name?: string): string {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getVariableUnit(name: string): string {
  const normalized = normalizeVariableName(name);

  if (normalized.includes('tonelaje')) {
    return 'Ton';
  }

  if (normalized.includes('frecuencia')) {
    return 'Hz';
  }

  if (normalized.includes('amperaje')) {
    return 'A';
  }

  if (normalized.includes('presion')) {
    return 'kg/cm²';
  }

  return '';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  async obtenerDashboardPorRango(fechaInicio: string, fechaFin: string): Promise<DashboardDia | null> {
    try {
      const records = await firstValueFrom(
        this.http.get<VariableRecordResponse[]>(`${API_BASE_URL}/variable-records/range`, {
          params: {
            start: toStartOfDayISO(fechaInicio),
            end: toEndOfDayISO(fechaFin)
          }
        })
      );

      if (!records.length) {
        return null;
      }

      const variablesMap = new Map<string, {
        variableId: number;
        nombre: string;
        fuente: string;
        descripcion: string;
        total: number;
        cantidad: number;
        sitios: Set<string>;
      }>();

      for (const record of records) {
        const key = `${record.variableId}-${normalizeVariableName(record.variableName)}`;
        const actual = variablesMap.get(key) ?? {
          variableId: record.variableId,
          nombre: record.variableName,
          fuente: record.variableSource,
          descripcion: record.variableDescription,
          total: 0,
          cantidad: 0,
          sitios: new Set<string>()
        };

        actual.total += Number(record.value);
        actual.cantidad += 1;
        actual.sitios.add(record.site);
        variablesMap.set(key, actual);
      }

      const variables: DashboardVariableResumen[] = Array.from(variablesMap.values())
        .map(variable => ({
          variableId: variable.variableId,
          nombre: variable.nombre,
          valorPromedio: Number((variable.total / variable.cantidad).toFixed(2)),
          fuente: variable.fuente,
          descripcion: variable.descripcion,
          sitios: Array.from(variable.sitios).sort(),
          unidad: getVariableUnit(variable.nombre)
        }))
        .sort((a, b) => a.variableId - b.variableId);

      const graficaPorVariable: Record<number, DashboardGraficaItem[]> = {};

      const recordsPorVariable = new Map<number, VariableRecordResponse[]>();
      for (const record of records) {
        const actual = recordsPorVariable.get(record.variableId) ?? [];
        actual.push(record);
        recordsPorVariable.set(record.variableId, actual);
      }

      for (const [variableId, variableRecords] of recordsPorVariable.entries()) {
        const promediosPorSede = new Map<string, { total: number; cantidad: number }>();

        for (const record of variableRecords) {
          const actual = promediosPorSede.get(record.site) ?? { total: 0, cantidad: 0 };
          actual.total += Number(record.value);
          actual.cantidad += 1;
          promediosPorSede.set(record.site, actual);
        }

        graficaPorVariable[variableId] = Array.from(promediosPorSede.entries())
          .map(([label, value]) => ({
            label,
            value: Number((value.total / value.cantidad).toFixed(2))
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      }

      return {
        fecha: `${fechaInicio} - ${fechaFin}`,
        variables,
        graficaPorVariable
      };
    } catch {
      return null;
    }
  }
}
