// src/types/Medicion.ts
export interface Medicion {
    medicionID: number;
    usuarioID: number;
    fecha: Date;
    peso?: number;
    altura?: number;
    imc?: number;
    porcentajeGrasa?: number;
    circunferenciaBrazo?: number;
    circunferenciaPecho?: number;
    circunferenciaCintura?: number;
    circunferenciaMuslo?: number;
    notas?: string;
}

export interface MedicionCreateDTO {
    usuarioID: number;
    fecha?: Date;
    peso?: number;
    altura?: number;
    porcentajeGrasa?: number;
    circunferenciaBrazo?: number;
    circunferenciaPecho?: number;
    circunferenciaCintura?: number;
    circunferenciaMuslo?: number;
    notas?: string;
}

export interface MedicionUpdateDTO {
    fecha?: Date;
    peso?: number;
    altura?: number;
    porcentajeGrasa?: number;
    circunferenciaBrazo?: number;
    circunferenciaPecho?: number;
    circunferenciaCintura?: number;
    circunferenciaMuslo?: number;
    notas?: string;
}

export interface MedicionResumen {
    anio: number;
    mes: number;
    pesoPromedio?: number;
    imcPromedio?: number;
    grasaPromedio?: number;
    cinturaPromedio?: number;
}