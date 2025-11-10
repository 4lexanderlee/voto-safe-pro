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
    votedIn: [], // <-- CAMBIO: de hasVoted: false
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
    votedIn: [], // <-- CAMBIO: de hasVoted: false
    termsAccepted: true
  }
];

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
  // ... (otros candidatos)
];

// Solo exportamos una elección por defecto. 
// La lista completa se manejará en localStorage
export const mockElection: Election = {
  id: 'e1',
  tipo: 'Presidencial',
  nombre: 'Elecciones Generales 2025',
  fechaInicio: '2025-04-10',
  fechaFin: '2025-04-10',
  activa: true,
  allowNullVote: true, // <-- CAMBIO: añadido
  requireAllCategories: true, // <-- CAMBIO: añadido
  categorias: [
    {
      id: 'cat1',
      nombre: 'Presidencia',
      candidatos: mockCandidates
    },
    {
      id: 'cat2',
      nombre: 'Senado Nacional',
      candidatos: mockCandidates.map(c => ({ ...c, id: c.id + '-sn' }))
    },
    {
      id: 'cat3',
      nombre: 'Senado Regional',
      candidatos: mockCandidates.map(c => ({ ...c, id: c.id + '-sr' }))
    },
    {
      id: 'cat4',
      nombre: 'Diputado',
      candidatos: mockCandidates.map(c => ({ ...c, id: c.id + '-d' }))
    },
    {
      id: 'cat5',
      nombre: 'Parlamento Andino',
      candidatos: mockCandidates.map(c => ({ ...c, id: c.id + '-pa' }))
    }
  ]
};

// ... (generateMockUserData se mantiene igual)
export const generateMockUserData = (dni: string) => {
  // ... (código existente)
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