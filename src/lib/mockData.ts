// src/lib/mockData.ts
import { User, Election, Candidate } from '@/types';

export const mockUsers: User[] = [
  {
    dni: '12345678',
    pin: '1234',
    nombre: 'Juan Carlos',
    apellidos: 'Pérez García',
    correo: 'juan.perez@email.com',
    celular: '987654321',
    direccion: 'Av. La Marina 2000, San Miguel',
    sexo: 'M',
    fechaNacimiento: '1985-05-15',
    role: 'ciudadano',
    votedElectionIds: [], // <--- CAMBIO
    termsAccepted: true
  },
  {
    dni: '87654321',
    pin: '4321',
    nombre: 'María Elena',
    apellidos: 'Torres Ramírez',
    correo: 'maria.torres@email.com',
    celular: '976543210',
    direccion: 'Jr. Junín 450, Miraflores',
    sexo: 'F',
    fechaNacimiento: '1990-08-22',
    role: 'admin',
    votedElectionIds: [], // <--- CAMBIO
    termsAccepted: true
  }
];

// ... (el resto del archivo mockCandidates, mockElection, etc., puede quedar igual o ser eliminado si ya no se usa) ...
// ... (eliminaremos mockElection de aquí ya que ahora se carga desde localStorage) ...

export const mockCandidates: Candidate[] = [
  {
    id: 'c1',
    nombre: 'Alberto Sánchez',
    partido: 'Partido Democrático',
    foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    simbolo: '🦅',
    propuestas: ['Educación gratuita', 'Salud universal', 'Trabajo digno']
  },
  {
    id: 'c2',
    nombre: 'Carmen López',
    partido: 'Alianza Nacional',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    simbolo: '🌟',
    propuestas: ['Inversión en infraestructura', 'Seguridad ciudadana', 'Desarrollo rural']
  },
  {
    id: 'c3',
    nombre: 'Roberto Flores',
    partido: 'Fuerza Popular',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    simbolo: '🔷',
    propuestas: ['Lucha anticorrupción', 'Economía sostenible', 'Tecnología educativa']
  },
  {
    id: 'c4',
    nombre: 'Ana Martínez',
    partido: 'Perú Libre',
    foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    simbolo: '✊',
    propuestas: ['Reforma agraria', 'Nacionalización de recursos', 'Justicia social']
  }
];

// Simular RENIEC - autocompletar datos al escribir DNI
export const generateMockUserData = (dni: string) => {
  const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Rosa', 'Pedro', 'Carmen'];
  const apellidosPaternos = ['García', 'López', 'Martínez', 'Rodríguez', 'Pérez', 'González'];
  const apellidosMaternos = ['Silva', 'Torres', 'Flores', 'Ramírez', 'Castro', 'Vargas'];
  
  return {
    nombre: nombres[Math.floor(Math.random() * nombres.length)],
    apellidos: `${apellidosPaternos[Math.floor(Math.random() * apellidosPaternos.length)]} ${apellidosMaternos[Math.floor(Math.random() * apellidosMaternos.length)]}`,
    direccion: 'Av. Principal 123, Lima',
    sexo: Math.random() > 0.5 ? 'M' : 'F',
    fechaNacimiento: `${1970 + Math.floor(Math.random() * 35)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
  };
};