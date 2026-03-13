import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Rol } from '../enums/rol.enum';
import { AsignacionTurno } from '../models/asignacion-turno.model';
import { Turno } from '../models/turno.model';
import { Usuario } from '../models/usuario.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private readonly _turnos = signal<Turno[]>([]);
  private readonly _asignaciones = signal<AsignacionTurno[]>([]);

  readonly turnos = computed(() => this._turnos());
  readonly asignaciones = computed(() => this._asignaciones());

  constructor(private http: HttpClient) {
    this.loadTurnos();
    this.loadAsignaciones();
  }

  async loadTurnos(): Promise<void> {
    try {
      const turnos = await firstValueFrom(
        this.http.get<Array<{ id: number; name: string; startTime: string; endTime: string }>>(
          `${API_BASE_URL}/shifts`
        )
      );

      this._turnos.set(
        turnos.map(item => ({
          id: item.id,
          name: item.name,
          startTime: item.startTime,
          endTime: item.endTime
        }))
      );
    } catch {
      this._turnos.set([]);
    }
  }

  async loadAsignaciones(): Promise<void> {
    try {
      const asignaciones = await firstValueFrom(
        this.http.get<
          Array<{
            id: number;
            shiftId: number;
            shiftName: string;
            shiftStartTime: string;
            shiftEndTime: string;
            supervisorId: number;
            supervisorUsername: string;
            employeeId: number;
            employeeUsername: string;
            assignedDate: string;
          }>
        >(`${API_BASE_URL}/shift-assignments`)
      );

      this._asignaciones.set(
        asignaciones.map(item => ({
          id: item.id,
          supervisor: {
            id: item.supervisorId,
            username: item.supervisorUsername,
            password: '',
            rol: Rol.SUPERVISOR
          },
          empleado: {
            id: item.employeeId,
            username: item.employeeUsername,
            password: '',
            rol: Rol.OPERADOR
          },
          turno: {
            id: item.shiftId,
            name: item.shiftName,
            startTime: item.shiftStartTime,
            endTime: item.shiftEndTime
          },
          fechaAsignada: item.assignedDate
        }))
      );
    } catch {
      this._asignaciones.set([]);
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

  async asignarTurno(params: {
    supervisor: Usuario;
    empleado: Usuario;
    turnoId: number;
    fechaAsignada: string;
  }): Promise<{ ok: boolean; message: string }> {
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

    try {
      await firstValueFrom(
        this.http.post(`${API_BASE_URL}/shift-assignments`, {
          supervisorId: supervisor.id,
          employeeId: empleado.id,
          shiftId: turnoId,
          assignedDate: fechaAsignada
        })
      );

      await this.loadAsignaciones();

      return {
        ok: true,
        message: 'Turno asignado correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo asignar el turno'
      };
    }
  }

  async eliminarAsignacion(id: number): Promise<{ ok: boolean; message: string }> {
    const existe = this._asignaciones().some(item => item.id === id);

    if (!existe) {
      return {
        ok: false,
        message: 'Asignación no encontrada'
      };
    }

    try {
      await firstValueFrom(this.http.delete(`${API_BASE_URL}/shift-assignments/${id}`));
      this._asignaciones.update(asignaciones => asignaciones.filter(item => item.id !== id));

      return {
        ok: true,
        message: 'Asignación eliminada correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo eliminar la asignación'
      };
    }
  }

  async actualizarAsignacion(
    id: number,
    params: {
      supervisor: Usuario;
      empleado: Usuario;
      turnoId: number;
      fechaAsignada: string;
    }
  ): Promise<{ ok: boolean; message: string }> {
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

    try {
      await firstValueFrom(
        this.http.put(`${API_BASE_URL}/shift-assignments/${id}`, {
          supervisorId: supervisor.id,
          employeeId: empleado.id,
          shiftId: turnoId,
          assignedDate: fechaAsignada
        })
      );

      await this.loadAsignaciones();

      return {
        ok: true,
        message: 'Asignación actualizada correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo actualizar la asignación'
      };
    }
  }
}
