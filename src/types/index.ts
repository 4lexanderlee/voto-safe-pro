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
  hasVoted: boolean;
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

export interface Election {
  id: string;
  tipo: 'Presidencial' | 'Regional' | 'Municipal';
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  categorias: ElectionCategory[];
}

export interface ElectionCategory {
  id: string;
  nombre: 'Presidencia' | 'Senado Nacional' | 'Senado Regional' | 'Diputado' | 'Parlamento Andino';
  candidatos: Candidate[];
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
