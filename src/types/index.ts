// src/types/index.ts

export interface User {
  dni: string;
  pin: string;
  nombre: string;
  apellidos: string;
  correo: string;
  celular: string;
  direccion: string;
  sexo: 'M' | 'F';
  fechaNacimiento: string;
  role: 'ciudadano' | 'admin';
  votedElectionIds: string[]; // <--- CAMBIO: de hasVoted: boolean
  termsAccepted: boolean;
}

export interface Candidate {
  id: string;
  nombre: string;
  partido: string;
  foto: string;
  simbolo: string;
  propuestas: string[];
}

export interface ElectionCategory {
  id: string;
  nombre: string; 
  candidatos: Candidate[];
}

export interface Election {
  id: string;
  nombre: string; 
  tipo: 'Presidencial' | 'Municipal' | 'Regional' | 'Otros';
  categorias: ElectionCategory[]; 
  fechaInicio: string; 
  fechaFin: string; 
  permiteVotoNulo: boolean; 
  permiteVotoIncompleto: boolean; 
  estado: 'pendiente' | 'activa' | 'finalizada';
}

export interface Vote {
  userId: string;
  electionId: string;
  fecha: string;
  votos: {
    categoria: string;
    candidatoId: string;
    partido: string;
  }[];
}

export interface AuthSession {
  user: User;
  loginTime: number;
  expiresAt: number;
}