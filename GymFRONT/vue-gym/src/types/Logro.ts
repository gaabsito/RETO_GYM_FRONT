// src/types/Logro.ts
export interface Logro {
  logroID: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  experiencia: number;
  categoria: string;
  valorMeta: number;
  secreto: boolean;
}

export interface UsuarioLogro {
  logroID: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  experiencia: number;
  categoria: string;
  desbloqueado: boolean;
  fechaDesbloqueo?: Date;
  progresoActual: number;
  valorMeta: number;
}