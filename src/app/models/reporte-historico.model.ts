import { Usuario } from './usuario.model';

export interface ReporteHistorico {
  id: number;
  generatedAt: string;
  startPeriod: string;
  endPeriod: string;
  filepath: string;
  generatedBy: Usuario;
}