export interface Comment {
    comentarioID: number;
    entrenamientoID: number;
    usuarioID: number;
    contenido: string;
    calificacion: number;
    fechaComentario: Date;
    usuario?: {
        nombre: string;
        apellido: string;
    };
}