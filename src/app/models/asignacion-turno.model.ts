import { Usuario } from './usuario.model';
import { Turno } from './turno.model';

export interface AsignacionTurno {
  id: number;
  supervisor: Usuario;
  empleado: Usuario;
  turno: Turno;
  fechaAsignada: string;
}