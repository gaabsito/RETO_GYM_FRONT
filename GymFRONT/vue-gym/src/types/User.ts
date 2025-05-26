// Actualización de src/types/User.ts
export interface User {
    usuarioID: number;
    nombre: string;
    apellido: string;
    email: string;
    fechaRegistro: Date;
    estaActivo: boolean;
    fotoPerfilURL?: string | null; // Nuevo campo para URL de la foto de perfil
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    nombre: string;
    apellido: string;
}

export interface AuthResponseDTO {
    user: User;
    token: string;
}

export interface UsuarioDTO {
    usuarioID: number;
    nombre: string;
    apellido: string;
    email: string;
    fechaRegistro: Date;
    estaActivo: boolean;
    fotoPerfilURL?: string | null; // Nuevo campo para URL de la foto de perfil
}