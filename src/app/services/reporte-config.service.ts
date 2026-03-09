import { Injectable, computed, signal } from '@angular/core';
import { ReporteConfig } from '../models/reporte-config.model';
import { StorageService } from './storage.service';

const REPORTE_CONFIG_KEY = 'proyecto-tonelaje-reporte-config';

@Injectable({
  providedIn: 'root'
})
export class ReporteConfigService {
  private readonly _configuraciones = signal<ReporteConfig[]>([]);

  readonly configuraciones = computed(() => this._configuraciones());

  constructor(private storageService: StorageService) {
    const guardadas =
      this.storageService.getItem<ReporteConfig[]>(REPORTE_CONFIG_KEY);

    if (guardadas && guardadas.length > 0) {
      this._configuraciones.set(guardadas);
    } else {
      const iniciales: ReporteConfig[] = [
        {
          id: 1,
          codigo: '0001',
          horaEjecucion: '07:00',
          fechaInicio: '2026-01-01',
          fechaFin: '2026-01-01',
          destinatarios: ['lsilvera@gmail.com']
        },
        {
          id: 2,
          codigo: '0002',
          horaEjecucion: '21:00',
          fechaInicio: '2026-01-01',
          fechaFin: '2026-01-01',
          destinatarios: ['lsilvera@gmail.com']
        }
      ];

      this._configuraciones.set(iniciales);
      this.persistir();
    }
  }

  getAll(): ReporteConfig[] {
    return this._configuraciones();
  }

  getById(id: number): ReporteConfig | undefined {
    return this._configuraciones().find(item => item.id === id);
  }

  crear(config: Omit<ReporteConfig, 'id'>): { ok: boolean; message: string } {
    if (
      this._configuraciones().some(
        item => item.codigo.trim().toLowerCase() === config.codigo.trim().toLowerCase()
      )
    ) {
      return {
        ok: false,
        message: 'El código ya existe'
      };
    }

    if (config.fechaFin < config.fechaInicio) {
      return {
        ok: false,
        message: 'La fecha fin no puede ser menor que la fecha inicio'
      };
    }

    const nueva: ReporteConfig = {
      ...config,
      id: this.generarId()
    };

    this._configuraciones.update(items => [...items, nueva]);
    this.persistir();

    return {
      ok: true,
      message: 'Configuración registrada correctamente'
    };
  }

  actualizar(
    id: number,
    cambios: Omit<ReporteConfig, 'id'>
  ): { ok: boolean; message: string } {
    const items = this._configuraciones();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      return {
        ok: false,
        message: 'Configuración no encontrada'
      };
    }

    if (
      items.some(
        item =>
          item.id !== id &&
          item.codigo.trim().toLowerCase() === cambios.codigo.trim().toLowerCase()
      )
    ) {
      return {
        ok: false,
        message: 'El código ya existe'
      };
    }

    if (cambios.fechaFin < cambios.fechaInicio) {
      return {
        ok: false,
        message: 'La fecha fin no puede ser menor que la fecha inicio'
      };
    }

    const actualizados = [...items];
    actualizados[index] = {
      ...actualizados[index],
      ...cambios
    };

    this._configuraciones.set(actualizados);
    this.persistir();

    return {
      ok: true,
      message: 'Configuración actualizada correctamente'
    };
  }

  eliminar(id: number): { ok: boolean; message: string } {
    const existe = this._configuraciones().some(item => item.id === id);

    if (!existe) {
      return {
        ok: false,
        message: 'Configuración no encontrada'
      };
    }

    this._configuraciones.update(items => items.filter(item => item.id !== id));
    this.persistir();

    return {
      ok: true,
      message: 'Configuración eliminada correctamente'
    };
  }

  private persistir(): void {
    this.storageService.setItem(REPORTE_CONFIG_KEY, this._configuraciones());
  }

  private generarId(): number {
    const ids = this._configuraciones().map(item => item.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }
}