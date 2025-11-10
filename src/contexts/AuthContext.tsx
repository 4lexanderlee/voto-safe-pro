// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession } from '@/types';
import { mockUsers } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (dni: string, pin: string) => Promise<{ success: boolean; tempCode?: string; error?: string }>;
  logout: () => void;
  verifyCode: (code: string, expectedCode: string) => boolean;
  completeLogin: (dni: string) => User | null;
  register: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
  sessionTimeRemaining: number;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// --- INICIO DE NUEVA FUNCIÓN ---
// Esta función "migra" un objeto de usuario antiguo al nuevo formato.
const getUpgradedUser = (user: any): User => {
  if (user && typeof user.hasVoted === 'boolean') {
    // Es la ESTRUCTURA ANTIGUA
    const upgradedUser: User = {
      ...user,
      votedElectionIds: [], // Convertir a la nueva estructura
    };
    delete (upgradedUser as any).hasVoted; // Eliminar la clave antigua
    return upgradedUser;
  }
  // Si 'votedElectionIds' no existe, lo añade
  if (user && !user.votedElectionIds) {
    return {
      ...user,
      votedElectionIds: []
    };
  }
  // Si no, ya tiene la nueva estructura
  return user;
};
// --- FIN DE NUEVA FUNCIÓN ---

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true); 

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('authSession');
      if (storedSession) {
        const session: AuthSession = JSON.parse(storedSession);
        const now = Date.now();
        
        if (session.expiresAt > now) {
          const upgradedUser = getUpgradedUser(session.user); // <--- APLICAR MIGRACIÓN
          setUser(upgradedUser); // <--- Guardar usuario actualizado
          setSessionTimeRemaining(Math.floor((session.expiresAt - now) / 1000));

          // Si el usuario fue actualizado, re-guardar la sesión
          if (upgradedUser !== session.user) {
            localStorage.setItem('authSession', JSON.stringify({ ...session, user: upgradedUser }));
          }
        } else {
          localStorage.removeItem('authSession');
        }
      }
    } catch (e) {
      console.error("Failed to load session", e);
      localStorage.removeItem('authSession');
    } finally {
      setIsLoading(false); 
    }
  }, []);

  // Session timeout countdown
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      setSessionTimeRemaining((prev) => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (dni: string, pin: string): Promise<{ success: boolean; tempCode?: string; error?: string }> => {
    const storedUsers = localStorage.getItem('users');
    let users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;

    // <--- APLICAR MIGRACIÓN A LA LISTA DE USUARIOS
    users = users.map(getUpgradedUser);
    // Re-guardar la lista de usuarios actualizada en localStorage
    if (storedUsers) {
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    const foundUser = users.find((u: User) => u.dni === dni && u.pin === pin);
    
    if (!foundUser) {
      return { success: false, error: 'DNI o PIN incorrectos' };
    }

    const tempCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    return { success: true, tempCode };
  };

  const verifyCode = (code: string, expectedCode: string): boolean => {
    if (code === expectedCode) {
      return true;
    }
    return false;
  };

  const completeLogin = (dni: string): User | null => {
    setIsLoading(true); 
    const storedUsers = localStorage.getItem('users');
    
    // Volver a cargar usuarios (ya deberían estar migrados por la función 'login', pero por si acaso)
    let users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;
    users = users.map(getUpgradedUser); // <--- Asegurar migración aquí también
    
    const foundUser = users.find((u: User) => u.dni === dni);
    
    if (foundUser) {
      const now = Date.now();
      const session: AuthSession = {
        user: foundUser, // 'foundUser' ya está actualizado
        loginTime: now,
        expiresAt: now + SESSION_TIMEOUT
      };
      
      localStorage.setItem('authSession', JSON.stringify(session));
      setUser(foundUser); 
      setSessionTimeRemaining(SESSION_TIMEOUT / 1000);
      setIsLoading(false); 
      return foundUser;
    }
    setIsLoading(false); 
    return null;
  };

  const logout = () => {
    localStorage.removeItem('authSession');
    setUser(null);
    setSessionTimeRemaining(0);
    setIsLoading(false); 
  };

  const register = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const storedUsers = localStorage.getItem('users');
      let users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;
      users = users.map(getUpgradedUser); // Migrar lista antes de añadir

      if (users.find((u: User) => u.dni === userData.dni)) {
        return { success: false, error: 'El DNI ya está registrado' };
      }

      const newUser: User = {
        dni: userData.dni!,
        pin: userData.pin!,
        nombre: userData.nombre!,
        apellidos: userData.apellidos!,
        correo: userData.correo!,
        celular: userData.celular!,
        direccion: userData.direccion!,
        sexo: userData.sexo!,
        fechaNacimiento: userData.fechaNacimiento!,
        role: 'ciudadano',
        votedElectionIds: [], // <--- Usar la nueva estructura
        termsAccepted: userData.termsAccepted || false
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al registrar usuario' };
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { 
      ...user, 
      ...userData,
      votedElectionIds: userData.votedElectionIds || user.votedElectionIds,
    };
    setUser(updatedUser);
    
    const session: AuthSession = {
      user: updatedUser,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT
    };
    localStorage.setItem('authSession', JSON.stringify(session));
    
    const storedUsers = localStorage.getItem('users');
    let users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;
    users = users.map(getUpgradedUser); // Migrar
    
    const updatedUsers = users.map((u: User) => u.dni === user.dni ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        verifyCode,
        completeLogin, 
        register,
        updateUser,
        sessionTimeRemaining,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};