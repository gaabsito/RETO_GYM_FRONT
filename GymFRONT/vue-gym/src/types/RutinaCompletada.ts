// src/types/RutinaCompletada.ts
export interface RutinaCompletada {
    rutinaCompletadaID: number;
    usuarioID: number;
    entrenamientoID: number;
    fechaCompletada: Date;
    notas?: string;
    duracionMinutos?: number;
    caloriasEstimadas?: number;
    nivelEsfuerzoPercibido?: number;
    
    // Información adicional del entrenamiento (opcional)
    nombreEntrenamiento?: string;
    dificultadEntrenamiento?: string;
}

export interface RutinaCompletadaCreate {
    entrenamientoID: number;
    fechaCompletada?: Date;
    notas?: string;
    duracionMinutos?: number;
    caloriasEstimadas?: number;
    nivelEsfuerzoPercibido?: number;
}

export interface RutinaCompletadaUpdate {
    fechaCompletada?: Date;
    notas?: string;
    duracionMinutos?: number;
    caloriasEstimadas?: number;
    nivelEsfuerzoPercibido?: number;
}

export interface ResumenRutinas {
    totalRutinasCompletadas: number;
    rutinasUltimaSemana: number;
    rutinasUltimoMes: number;
    promedioEsfuerzo: number;
    caloriasTotales: number;
    minutosTotales: number;
    entrenamientoIDMasRepetido?: number;
    nombreEntrenamientoMasRepetido?: string;
    vecesCompletado?: number;
}