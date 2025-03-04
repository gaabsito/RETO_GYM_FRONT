export interface Comment {
    comentarioID: number;
    entrenamientoID: number;
    usuarioID: number | null;
    contenido: string;
    calificacion: number;
    fechaComentario: Date | string;
    usuario?: {
        nombre: string;
        apellido: string;
        email?: string;
    };
}