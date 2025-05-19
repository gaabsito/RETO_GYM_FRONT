// src/types/Role.ts
export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  diasPorSemanaMinimo: number;
  diasPorSemanaMaximo: number;
}

export interface UserRole {
  roleId: number;
  usuarioId: number;
  fechaAsignacion: Date;
  roleActual: boolean;
}