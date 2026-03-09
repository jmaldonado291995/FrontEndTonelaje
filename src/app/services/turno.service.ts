import { Injectable, computed, signal } from '@angular/core';
import { Rol } from '../enums/rol.enum';
import { NombreTurno } from '../enums/turno.enum';
import { AsignacionTurno } from '../models/asignacion-turno.model';
import { Turno } from '../models/turno.model';
import { Usuario } from '../models/usuario.model';
import { StorageService } from './storage.service';

const SHIFTS_KEY = 'proyecto-tonelaje-shifts';
const ASSIGNMENTS_KEY = 'proyecto-tonelaje-shift-assignments';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private readonly _turnos = signal<Turno[]>([]);
  private readonly _asignaciones = signal<AsignacionTurno[]>([]);

  readonly turnos = computed(() => this._turnos());
  readonly asignaciones = computed(() => this._asignaciones());

  constructor(private storageService: StorageService) {
    const turnosGuardados = this.storageService.getItem<Turno[]>(SHIFTS_KEY);
    const asignacionesGuardadas = this.storageService.getItem<AsignacionTurno[]>(ASSIGNMENTS_KEY);

    if (turnosGuardados && turnosGuardados.length > 0) {
      this._turnos.set(turnosGuardados);
    } else {
      const turnosIniciales: Turno[] = [
        {
          id: 1,
          name: NombreTurno.MANANA,
          startTime: '06:00',
          endTime: '14:00'
        },
        {
          id: 2,
          name: NombreTurno.TARDE,
          startTime: '14:00',
          endTime: '22:00'
        },
        {
          id: 3,
          name: NombreTurno.NOCHE,
          startTime: '22:00',
          endTime: '06:00'
        }
      ];

      this._turnos.set(turnosIniciales);
      this.persistirTurnos();
    }

    if (asignacionesGuardadas && asignacionesGuardadas.length > 0) {
      this._asignaciones.set(asignacionesGuardadas);
    }
  }

  getAllTurnos(): Turno[] {
    return this._turnos();
  }

  getAllAsignaciones(): AsignacionTurno[] {
    return this._asignaciones();
  }

  getTurnoById(id: number): Turno | undefined {
    return this._turnos().find(turno => turno.id === id);
  }

  getAsignacionesByOperadorId(operadorId: number): AsignacionTurno[] {
    return this._asignaciones().filter(item => item.empleado.id === operadorId);
  }

  tieneAsignacion(operadorId: number): boolean {
    return this.getAsignacionesByOperadorId(operadorId).length > 0;
  }

  puedeAsignarTurno(usuario: Usuario): boolean {
    return usuario.rol === Rol.ADMIN || usuario.rol === Rol.SUPERVISOR;
  }

  asignarTurno(params: {
    supervisor: Usuario;
    empleado: Usuario;
    turnoId: number;
    fechaAsignada: string;
  }): { ok: boolean; message: string } {
    const { supervisor, empleado, turnoId, fechaAsignada } = params;

    if (!this.puedeAsignarTurno(supervisor)) {
      return {
        ok: false,
        message: 'Solo Administrador o Supervisor pueden asignar turnos'
      };
    }

    if (empleado.rol !== Rol.OPERADOR) {
      return {
        ok: false,
        message: 'El usuario ingresado no es un operador'
      };
    }

    if (this.tieneAsignacion(empleado.id)) {
      return {
        ok: false,
        message: 'No es posible registrar más de un turno al operador'
      };
    }

    const turno = this.getTurnoById(turnoId);

    if (!turno) {
      return {
        ok: false,
        message: 'Turno no encontrado'
      };
    }

    const nuevaAsignacion: AsignacionTurno = {
      id: this.generarAsignacionId(),
      supervisor,
      empleado,
      turno,
      fechaAsignada
    };

    this._asignaciones.update(asignaciones => [...asignaciones, nuevaAsignacion]);
    this.persistirAsignaciones();

    return {
      ok: true,
      message: 'Turno asignado correctamente'
    };
  }

  eliminarAsignacion(id: number): { ok: boolean; message: string } {
    const existe = this._asignaciones().some(item => item.id === id);

    if (!existe) {
      return {
        ok: false,
        message: 'Asignación no encontrada'
      };
    }

    this._asignaciones.update(asignaciones => asignaciones.filter(item => item.id !== id));
    this.persistirAsignaciones();

    return {
      ok: true,
      message: 'Asignación eliminada correctamente'
    };
  }

  private persistirTurnos(): void {
    this.storageService.setItem(SHIFTS_KEY, this._turnos());
  }

  private persistirAsignaciones(): void {
    this.storageService.setItem(ASSIGNMENTS_KEY, this._asignaciones());
  }

  private generarAsignacionId(): number {
    const ids = this._asignaciones().map(item => item.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }


  actualizarAsignacion(
    id: number,
    params: {
      supervisor: Usuario;
      empleado: Usuario;
      turnoId: number;
      fechaAsignada: string;
    }
  ): { ok: boolean; message: string } {
    const { supervisor, empleado, turnoId, fechaAsignada } = params;

    const index = this._asignaciones().findIndex(item => item.id === id);

    if (index === -1) {
      return {
        ok: false,
        message: 'Asignación no encontrada'
      };
    }

    if (!this.puedeAsignarTurno(supervisor)) {
      return {
        ok: false,
        message: 'Solo Administrador o Supervisor pueden asignar turnos'
      };
    }

    if (empleado.rol !== Rol.OPERADOR) {
      return {
        ok: false,
        message: 'El usuario ingresado no es un operador'
      };
    }

    const existeOtraAsignacion = this._asignaciones().some(
      item => item.id !== id && item.empleado.id === empleado.id
    );

    if (existeOtraAsignacion) {
      return {
        ok: false,
        message: 'No es posible registrar más de un turno al operador'
      };
    }

    const turno = this.getTurnoById(turnoId);

    if (!turno) {
      return {
        ok: false,
        message: 'Turno no encontrado'
      };
    }

    const actualizadas = [...this._asignaciones()];
    actualizadas[index] = {
      ...actualizadas[index],
      supervisor,
      empleado,
      turno,
      fechaAsignada
    };

    this._asignaciones.set(actualizadas);
    this.persistirAsignaciones();

    return {
      ok: true,
      message: 'Asignación actualizada correctamente'
    };
  }

}