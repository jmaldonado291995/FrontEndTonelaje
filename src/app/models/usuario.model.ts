import { Rol } from "../enums/rol.enum";

export interface Usuario {
  id: number;
  username: string;
  password: string;
  rol: Rol;
}