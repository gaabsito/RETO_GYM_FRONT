// src/types/User.ts
export interface User {
    usuarioID: number;
    nombre: string;
    apellido: string;
    email: string;
    fechaRegistro: Date;
    estaActivo: boolean;
    esAdmin: boolean; // NUEVO CAMPO
    edad?: number;
    peso?: number;
    altura?: number;
    fotoPerfilURL?: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface RegisterData extends LoginCredentials {
    nombre: string;
    apellido: string;
}

export interface AuthResponseDTO {
    user: User;
    token: string;
    esAdmin: boolean; // NUEVO CAMPO
}

export interface UsuarioDTO {
    usuarioID: number;
    nombre: string;
    apellido: string;
    email: string;
    fechaRegistro: Date;
    estaActivo: boolean;
    esAdmin: boolean; // NUEVO CAMPO
    edad?: number;
    peso?: number;
    altura?: number;
    fotoPerfilURL?: string | null;
}

// NUEVOS TIPOS PARA ADMINISTRACIÓN

export interface AdminUserCreateRequest {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    esAdmin?: boolean;
    estaActivo?: boolean;
    edad?: number;
    peso?: number;
    altura?: number;
}

export interface AdminUserUpdateRequest {
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    esAdmin?: boolean;
    estaActivo?: boolean;
    edad?: number;
    peso?: number;
    altura?: number;
}

export interface UserPermissions {
    canManageUsers: boolean;
    canManageWorkouts: boolean;
    canManageExercises: boolean;
    canViewStats: boolean;
    canDeleteContent: boolean;
}

export interface AdminStats {
    totalUsuarios: number;
    usuariosActivos: number;
    totalAdmins: number;
    usuariosRegistradosHoy: number;
    usuariosRegistradosEsteMes: number;
}

// Tipos de respuesta específicos para admin
export interface AdminResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface UserListResponse extends AdminResponse<User[]> {}
export interface UserDetailResponse extends AdminResponse<User> {}
export interface StatsResponse extends AdminResponse<AdminStats> {}

// Enums para mejor type safety
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

// Tipos para filtros
export interface UserFilters {
    search?: string;
    status?: UserStatus;
    role?: UserRole;
    dateFrom?: Date;
    dateTo?: Date;
}

// Tipo para paginación
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Tipos para validación
export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Tipos para actividad de usuario
export interface UserActivity {
    id: number;
    userId: number;
    action: string;
    description: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}

// Constantes para validación
export const USER_VALIDATION = {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_AGE: 13,
    MAX_AGE: 120,
    MIN_WEIGHT: 20,
    MAX_WEIGHT: 500,
    MIN_HEIGHT: 100,
    MAX_HEIGHT: 250
} as const;

// Funciones de utilidad para tipos
export function isAdmin(user: User | null): user is User & { esAdmin: true } {
    return user?.esAdmin === true;
}

export function isActiveUser(user: User | null): user is User & { estaActivo: true } {
    return user?.estaActivo === true;
}

export function getUserDisplayName(user: User | null): string {
    if (!user) return 'Usuario Desconocido';
    return `${user.nombre} ${user.apellido}`.trim();
}

export function getUserInitials(user: User | null): string {
    if (!user) return '??';
    const firstInitial = user.nombre.charAt(0).toUpperCase();
    const lastInitial = user.apellido.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
}

export function validateEmail(email: string): boolean {
    return USER_VALIDATION.EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (password.length < USER_VALIDATION.MIN_PASSWORD_LENGTH) {
        errors.push({
            field: 'password',
            message: `La contraseña debe tener al menos ${USER_VALIDATION.MIN_PASSWORD_LENGTH} caracteres`
        });
    }
    
    if (password.length > USER_VALIDATION.MAX_PASSWORD_LENGTH) {
        errors.push({
            field: 'password',
            message: `La contraseña no puede exceder ${USER_VALIDATION.MAX_PASSWORD_LENGTH} caracteres`
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export function validateUserData(userData: Partial<AdminUserCreateRequest>): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Validar nombre
    if (userData.nombre) {
        if (userData.nombre.length < USER_VALIDATION.MIN_NAME_LENGTH) {
            errors.push({
                field: 'nombre',
                message: `El nombre debe tener al menos ${USER_VALIDATION.MIN_NAME_LENGTH} caracteres`
            });
        }
        if (userData.nombre.length > USER_VALIDATION.MAX_NAME_LENGTH) {
            errors.push({
                field: 'nombre',
                message: `El nombre no puede exceder ${USER_VALIDATION.MAX_NAME_LENGTH} caracteres`
            });
        }
    }
    
    // Validar apellido
    if (userData.apellido) {
        if (userData.apellido.length < USER_VALIDATION.MIN_NAME_LENGTH) {
            errors.push({
                field: 'apellido',
                message: `El apellido debe tener al menos ${USER_VALIDATION.MIN_NAME_LENGTH} caracteres`
            });
        }
        if (userData.apellido.length > USER_VALIDATION.MAX_NAME_LENGTH) {
            errors.push({
                field: 'apellido',
                message: `El apellido no puede exceder ${USER_VALIDATION.MAX_NAME_LENGTH} caracteres`
            });
        }
    }
    
    // Validar email
    if (userData.email && !validateEmail(userData.email)) {
        errors.push({
            field: 'email',
            message: 'El formato del email no es válido'
        });
    }
    
    // Validar contraseña
    if (userData.password) {
        const passwordValidation = validatePassword(userData.password);
        errors.push(...passwordValidation.errors);
    }
    
    // Validar edad
    if (userData.edad) {
        if (userData.edad < USER_VALIDATION.MIN_AGE || userData.edad > USER_VALIDATION.MAX_AGE) {
            errors.push({
                field: 'edad',
                message: `La edad debe estar entre ${USER_VALIDATION.MIN_AGE} y ${USER_VALIDATION.MAX_AGE} años`
            });
        }
    }
    
    // Validar peso
    if (userData.peso) {
        if (userData.peso < USER_VALIDATION.MIN_WEIGHT || userData.peso > USER_VALIDATION.MAX_WEIGHT) {
            errors.push({
                field: 'peso',
                message: `El peso debe estar entre ${USER_VALIDATION.MIN_WEIGHT} y ${USER_VALIDATION.MAX_WEIGHT} kg`
            });
        }
    }
    
    // Validar altura
    if (userData.altura) {
        if (userData.altura < USER_VALIDATION.MIN_HEIGHT || userData.altura > USER_VALIDATION.MAX_HEIGHT) {
            errors.push({
                field: 'altura',
                message: `La altura debe estar entre ${USER_VALIDATION.MIN_HEIGHT} y ${USER_VALIDATION.MAX_HEIGHT} cm`
            });
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}