export interface DashboardDia {
  fecha: string;
  tonelajeEntrante: number;
  tonelajeSaliente: number;
  frecuenciaBombaAgua: number;
  amperajeBomba: number;
  presionHidrociclones: number;
  graficaTonelaje: {
    label: string;
    value: number;
  }[];
}