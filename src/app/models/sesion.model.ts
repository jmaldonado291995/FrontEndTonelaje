import { Usuario } from './usuario.model';

export interface Sesion {
  autenticado: boolean;
  usuario: Usuario | null;
  token: string | null;
}
