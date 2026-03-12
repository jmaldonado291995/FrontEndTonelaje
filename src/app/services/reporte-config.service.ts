import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReporteConfig } from '../models/reporte-config.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ReporteConfigService {
  private readonly _configuraciones = signal<ReporteConfig[]>([]);

  readonly configuraciones = computed(() => this._configuraciones());

  constructor(private http: HttpClient) {
    this.loadConfiguraciones();
  }

  async loadConfiguraciones(): Promise<void> {
    try {
      const configs = await firstValueFrom(
        this.http.get<
          Array<{
            id: number;
            sendTime: string;
            active: boolean;
            format: string;
            createdById: number;
            createdByUsername?: string;
          }>
        >(`${API_BASE_URL}/report-configurations`)
      );

      const withRecipients = await Promise.all(
        configs.map(async config => {
          const recipients = await firstValueFrom(
            this.http.get<Array<{ id: number; email: string }>>(
              `${API_BASE_URL}/report-recipients/configuration/${config.id}`
            )
          );

          return {
            id: config.id,
            sendTime: config.sendTime,
            active: config.active,
            format: config.format,
            createdById: config.createdById,
            createdByUsername: config.createdByUsername,
            destinatarios: recipients.map(item => item.email)
          } as ReporteConfig;
        })
      );

      this._configuraciones.set(withRecipients);
    } catch {
      this._configuraciones.set([]);
    }
  }

  getAll(): ReporteConfig[] {
    return this._configuraciones();
  }

  getById(id: number): ReporteConfig | undefined {
    return this._configuraciones().find(item => item.id === id);
  }

  async crear(config: Omit<ReporteConfig, 'id'>): Promise<{ ok: boolean; message: string }> {
    if (!config.destinatarios || config.destinatarios.length === 0) {
      return {
        ok: false,
        message: 'Debe ingresar al menos un destinatario'
      };
    }

    try {
      const creada = await firstValueFrom(
        this.http.post<{
          id: number;
          sendTime: string;
          active: boolean;
          format: string;
          createdById: number;
          createdByUsername?: string;
        }>(`${API_BASE_URL}/report-configurations`, {
          sendTime: config.sendTime,
          active: config.active,
          format: config.format,
          createdById: config.createdById
        })
      );

      await Promise.all(
        config.destinatarios.map(email =>
          firstValueFrom(
            this.http.post(`${API_BASE_URL}/report-recipients`, {
              email,
              reportConfigurationId: creada.id
            })
          )
        )
      );

      await this.loadConfiguraciones();

      return {
        ok: true,
        message: 'Configuración registrada correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo registrar la configuración'
      };
    }
  }

  async actualizar(
    id: number,
    cambios: Omit<ReporteConfig, 'id'>
  ): Promise<{ ok: boolean; message: string }> {
    const existe = this._configuraciones().some(item => item.id === id);

    if (!existe) {
      return {
        ok: false,
        message: 'Configuración no encontrada'
      };
    }

    try {
      await firstValueFrom(
        this.http.put(`${API_BASE_URL}/report-configurations/${id}`, {
          sendTime: cambios.sendTime,
          active: cambios.active,
          format: cambios.format,
          createdById: cambios.createdById
        })
      );

      const existentes = await firstValueFrom(
        this.http.get<Array<{ id: number; email: string }>>(
          `${API_BASE_URL}/report-recipients/configuration/${id}`
        )
      );

      await Promise.all(
        existentes.map(item => firstValueFrom(this.http.delete(`${API_BASE_URL}/report-recipients/${item.id}`)))
      );

      await Promise.all(
        cambios.destinatarios.map(email =>
          firstValueFrom(
            this.http.post(`${API_BASE_URL}/report-recipients`, {
              email,
              reportConfigurationId: id
            })
          )
        )
      );

      await this.loadConfiguraciones();

      return {
        ok: true,
        message: 'Configuración actualizada correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo actualizar la configuración'
      };
    }
  }

  async eliminar(id: number): Promise<{ ok: boolean; message: string }> {
    const existe = this._configuraciones().some(item => item.id === id);

    if (!existe) {
      return {
        ok: false,
        message: 'Configuración no encontrada'
      };
    }

    try {
      const existentes = await firstValueFrom(
        this.http.get<Array<{ id: number; email: string }>>(
          `${API_BASE_URL}/report-recipients/configuration/${id}`
        )
      );

      await Promise.all(
        existentes.map(item => firstValueFrom(this.http.delete(`${API_BASE_URL}/report-recipients/${item.id}`)))
      );

      await firstValueFrom(this.http.delete(`${API_BASE_URL}/report-configurations/${id}`));
      this._configuraciones.update(items => items.filter(item => item.id !== id));

      return {
        ok: true,
        message: 'Configuración eliminada correctamente'
      };
    } catch {
      return {
        ok: false,
        message: 'No se pudo eliminar la configuración'
      };
    }
  }
}
