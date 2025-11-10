// src/pages/AdminLayout.tsx

import { Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, BarChart3, Users, Vote, FileText } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset
} from '@/components/ui/sidebar';
import ChatBot from '@/components/ChatBot';

// Definimos los enlaces de navegación del Admin
const adminNavLinks = [
  { href: "/admin", label: "Estadísticas", icon: BarChart3 },
  { href: "/admin/votantes", label: "Votantes", icon: Users },
  { href: "/admin/elecciones", label: "Elecciones", icon: Vote },
  { href: "/admin/cedula", label: "Cédula de Votación", icon: FileText },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Esta lógica determinará qué pestaña mostrar en AdminDashboard
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("votantes")) return "votantes";
    if (path.includes("elecciones")) return "elecciones";
    if (path.includes("cedula")) return "cedula";
    return "estadisticas";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
        
        {/* --- BARRA LATERAL ESTÁTICA --- */}
        <Sidebar
          variant="sidebar" 
          collapsible="icon"
          className="border-r border-border/50 bg-background/95 backdrop-blur-md shadow-sm"
        >
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2 justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
                Voto Safe
              </span>
            </div>
          </SidebarHeader>

          {/* --- NAVEGACIÓN PRINCIPAL --- */}
          <SidebarContent>
            <SidebarMenu>
              {adminNavLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === link.href}
                    tooltip={link.label}
                  >
                    <NavLink to={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* --- PIE DE PÁGINA DE SIDEBAR (USUARIO Y LOGOUT) --- */}
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                {/* --- CORRECCIÓN AQUÍ --- */}
                {/* Se eliminó variant="ghost" que causaba el error */}
                <SidebarMenuButton 
                  onClick={logout} 
                  className="text-destructive-foreground/70 hover:bg-destructive/20 hover:text-destructive"
                  tooltip="Cerrar Sesión"
                >
                  <LogOut />
                  <span>Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* --- CONTENIDO PRINCIPAL DE LA PÁGINA --- */}
        <SidebarInset className="flex-1 overflow-y-auto">
          {/* Pasamos el 'activeTab' al Outlet (AdminDashboard) */}
          <Outlet context={{ activeTab: getActiveTab() }} />
        </SidebarInset>

        {/* --- CHATBOT A LA IZQUIERDA --- */}
        <div className="fixed bottom-6 left-6 z-50">
           <ChatBot />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;