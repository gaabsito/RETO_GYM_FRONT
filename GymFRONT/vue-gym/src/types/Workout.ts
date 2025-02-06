export interface Workout {
    entrenamientoID: number;
    titulo: string;
    descripcion?: string;
    duracionMinutos: number;
    dificultad: 'Fácil' | 'Media' | 'Difícil';
    fechaCreacion: Date;
    publico: boolean;
    autorID?: number;
    ejercicios?: WorkoutExercise[];
}

export interface WorkoutExercise {
    ejercicioID: number;
    nombre: string;
    descripcion?: string;
    series: number;
    repeticiones: number;
    descansoSegundos: number;
    notas?: string;
}

export interface CreateWorkoutDTO {
    titulo: string;
    descripcion?: string;
    duracionMinutos: number;
    dificultad: 'Fácil' | 'Media' | 'Difícil';
    publico: boolean;
    ejercicios: Array<{
        ejercicioID: number;
        series: number;
        repeticiones: number;
        descansoSegundos: number;
        notas?: string;
    }>;
}