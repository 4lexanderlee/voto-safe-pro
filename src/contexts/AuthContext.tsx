import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession } from '@/types';
import { mockUsers } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (dni: string, pin: string) => Promise<{ success: boolean; tempCode?: string; error?: string }>;
  logout: () => void;
  verifyCode: (code: string, expectedCode: string) => boolean;
  completeLogin: (dni: string) => User | null; // <-- AÑADIDO
  register: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
  sessionTimeRemaining: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);

  // Initialize from localStorage
  useEffect(() => {
    const storedSession = localStorage.getItem('authSession');
    if (storedSession) {
      const session: AuthSession = JSON.parse(storedSession);
      const now = Date.now();
      
      if (session.expiresAt > now) {
        setUser(session.user);
        setSessionTimeRemaining(Math.floor((session.expiresAt - now) / 1000));
      } else {
        localStorage.removeItem('authSession');
      }
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
    // Get users from localStorage or use mock
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : mockUsers;
    
    const foundUser = users.find((u: User) => u.dni === dni && u.pin === pin);
    
    if (!foundUser) {
      return { success: false, error: 'DNI o PIN incorrectos' };
    }

    // Generate temporary verification code
    const tempCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    return { success: true, tempCode };
  };

  const verifyCode = (code: string, expectedCode: string): boolean => {
    if (code === expectedCode) {
      return true;
    }
    return false;
  };

  // ESTA ES LA NUEVA FUNCIÓN QUE SÍ ACTUALIZA EL ESTADO
  const completeLogin = (dni: string): User | null => {
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : mockUsers;
    const foundUser = users.find((u: User) => u.dni === dni);
    
    if (foundUser) {
      const now = Date.now();
      const session: AuthSession = {
        user: foundUser,
        loginTime: now,
        expiresAt: now + SESSION_TIMEOUT
      };
      
      localStorage.setItem('authSession', JSON.stringify(session));
      setUser(foundUser); // <-- ¡LA LÍNEA CLAVE QUE FALTABA!
      setSessionTimeRemaining(SESSION_TIMEOUT / 1000);
      return foundUser;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('authSession');
    setUser(null);
    setSessionTimeRemaining(0);
  };

  const register = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const storedUsers = localStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : mockUsers;
      
      // Check if DNI already exists
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
        hasVoted: false,
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
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    const session: AuthSession = {
      user: updatedUser,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT
    };
    localStorage.setItem('authSession', JSON.stringify(session));
    
    // Update in users list
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : mockUsers;
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
        completeLogin, // <-- AÑADIDO
        register,
        updateUser,
        sessionTimeRemaining
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

// LA FUNCIÓN "completeLoginHelper" QUE ESTABA AQUÍ ABAJO DEBE SER ELIMINADA