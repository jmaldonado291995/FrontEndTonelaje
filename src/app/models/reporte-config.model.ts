export interface ReporteConfig {
  id: number;
  sendTime: string;
  active: boolean;
  format: string;
  createdById: number;
  createdByUsername?: string;
  destinatarios: string[];
}
