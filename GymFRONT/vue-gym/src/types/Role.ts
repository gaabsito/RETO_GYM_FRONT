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

export interface UsuarioRol {
  usuarioID: number;
  rolID: number;
  nombreRol: string;
  color: string;
  icono: string;
  fechaAsignacion: Date;
  diasEntrenadosSemanales: number; // Días únicos entrenados esta semana
  diasParaSiguienteRol: number;    // Días restantes para siguiente nivel
  progresoSiguienteRol: number;    // Porcentaje de progreso hacia siguiente nivel
  semanaActual: number;            // Número de la semana actual
}