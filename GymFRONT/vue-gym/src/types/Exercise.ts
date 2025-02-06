export interface Exercise {
    ejercicioID: number;
    nombre: string;
    descripcion?: string;
    grupoMuscular: string;
    imagenURL?: string;
    equipamientoNecesario: boolean;
}