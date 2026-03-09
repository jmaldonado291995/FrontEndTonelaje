import { NombreTurno } from '../enums/turno.enum';

export interface Turno {
  id: number;
  name: NombreTurno;
  startTime: string;
  endTime: string;
}