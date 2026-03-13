export interface DashboardVariableResumen {
  variableId: number;
  nombre: string;
  valorPromedio: number;
  fuente: string;
  descripcion: string;
  sitios: string[];
  unidad: string;
}

export interface DashboardGraficaItem {
  label: string;
  value: number;
}

export interface DashboardDia {
  fecha: string;
  variables: DashboardVariableResumen[];
  graficaPorVariable: Record<number, DashboardGraficaItem[]>;
}
