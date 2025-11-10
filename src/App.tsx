import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// --- CAMBIOS AQUÍ ---
// Se usarán alias de ruta con '@/' para todas las páginas
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CitizenDashboard from "@/pages/CitizenDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/pages/AdminLayout";
import AdminElectionDetails from "@/pages/AdminElectionDetails";
// --- FIN DE CAMBIOS ---

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Ruta de Ciudadano */}
            <Route path="/dashboard" element={<CitizenDashboard />} />
            
            {/* Rutas de Admin (ruta padre /admin con rutas hijas relativas) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="votantes" element={<AdminDashboard />} />
              <Route path="elecciones" element={<AdminDashboard />} />
              <Route path="elecciones/:electionId" element={<AdminElectionDetails />} />
              <Route path="cedula" element={<AdminDashboard />} />
            </Route>
            
            {/* Ruta Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;