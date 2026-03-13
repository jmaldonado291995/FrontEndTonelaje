import { Rol } from '../enums/rol.enum';
import { NombreTurno } from '../enums/turno.enum';

export function mapApiRoleToFront(role: string): Rol {
  if (role === 'ADMIN') {
    return Rol.ADMIN;
  }

  if (role === 'SUPERVISOR') {
    return Rol.SUPERVISOR;
  }

  return Rol.OPERADOR;
}

export function mapFrontRoleToApi(rol: Rol): 'ADMIN' | 'SUPERVISOR' | 'OPERATOR' {
  if (rol === Rol.ADMIN) {
    return 'ADMIN';
  }

  if (rol === Rol.SUPERVISOR) {
    return 'SUPERVISOR';
  }

  return 'OPERATOR';
}

export function mapApiShiftNameToFront(name: string): NombreTurno {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

  if (normalized.includes('MANANA')) {
    return NombreTurno.MANANA;
  }

  if (normalized.includes('TARDE')) {
    return NombreTurno.TARDE;
  }

  if (normalized.includes('NOCHE')) {
    return NombreTurno.NOCHE;
  }

  return NombreTurno.NOCHE;
}

export function toStartOfDayISO(date: string): string {
  return `${date}T00:00:00`;
}

export function toEndOfDayISO(date: string): string {
  return `${date}T23:59:59`;
}
