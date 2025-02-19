export interface User {
    usuarioID: number;
    nombre: string;
    apellido: string;
    email: string;
    fechaRegistro: Date;
    estaActivo: boolean;
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
}