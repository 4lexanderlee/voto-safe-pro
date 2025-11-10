// src/pages/AdminLayout.tsx

import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, BarChart3, Users, Vote, FileText, Loader2 } from 'lucide-react'; // <-- CAMBIO: Añadir Loader2
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
  const { user, logout, isAuthenticated, isLoading } = useAuth(); // <-- CAMBIO: Obtener isLoading
  const location = useLocation();

  // Esta lógica determinará qué pestaña mostrar en AdminDashboard
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("votantes")) return "votantes";
    if (path.includes("elecciones")) return "elecciones";
    if (path.includes("cedula")) return "cedula";
    return "estadisticas";
  };

  // --- CORRECCIÓN PANTALLA EN BLANCO ---
  
  // 1. Mostrar estado de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Si NO está cargando Y NO está autenticado, redirigir
  if (!isAuthenticated || !user) {
     return <Navigate to="/login" replace />;
  }
  
  // 3. Si está autenticado pero no es admin, redirigir
  if (user.role !== 'admin') {
     return <Navigate to="/" replace />;
  }
  // --- FIN CORRECCIÓN ---

  // 4. Si todo pasó, mostrar el layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
        
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

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
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

        <SidebarInset className="flex-1 overflow-y-auto">
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