export interface User {
    usuarioID: number;
    nombre: string;
    apellido: string;
    email: string;
    fechaRegistro: Date;
    estaActivo: boolean;
}

export interface UserProfile extends User {
    edad?: number;
    peso?: number;
    altura?: number;
    objetivo?: string;
    nivelExperiencia?: string;
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

// Nueva interfaz para el cambio de contraseña
export interface ChangePasswordDTO {
    passwordActual: string;
    passwordNueva: string;
}