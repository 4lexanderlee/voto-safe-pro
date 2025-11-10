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
  votedIn: string[]; // <-- CAMBIO: de hasVoted: boolean
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

// Interfaz de Categoría actualizada
export interface ElectionCategory {
  id: string;
  nombre: string; // <-- CAMBIO: de literales a string
  candidatos: Candidate[];
}

// Interfaz de Elección actualizada
export interface Election {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: 'Presidencial' | 'Regional' | 'Municipal' | 'Otros'; // <-- CAMBIO: 'Otros' añadido
  categorias: ElectionCategory[];
  activa: boolean; // Para saber si se muestra (ej. 'true' por defecto)
  allowNullVote: boolean; // ¿Permitir voto nulo?
  requireAllCategories: boolean; // ¿Es necesario marcar todas las casillas?
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