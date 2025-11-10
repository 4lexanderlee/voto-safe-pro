// src/pages/CitizenDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Election } from '@/types';
import { Shield, LogOut, Clock, CheckCircle2, AlertCircle, CalendarDays, Flag, FileText } from 'lucide-react';
import ChatBot from '@/components/ChatBot';
import TermsModal from '@/components/TermsModal';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CitizenDashboard = () => {
  const { user, logout, sessionTimeRemaining, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const [activeElections, setActiveElections] = useState<Election[]>([]);

  useEffect(() => {
    if (isLoading) return; // Esperar a que la autenticación cargue

    if (!user) {
      navigate('/login');
      return;
    }

    // Check if terms have been accepted
    const termsAccepted = localStorage.getItem('termsAccepted');
    if (!termsAccepted) {
      setShowTerms(true);
    }

    // Cargar y filtrar elecciones
    const allElections: Election[] = JSON.parse(localStorage.getItem('elections') || '[]');
    const now = new Date();
    const active = allElections.filter(election => {
      const startDate = new Date(election.fechaInicio);
      const endDate = new Date(election.fechaFin);
      // Incluir 'activa' y también 'pendiente' para que el usuario las vea venir
      return (election.estado === 'activa' || election.estado === 'pendiente') && now < endDate;
    });
    
    setActiveElections(active);

  }, [user, navigate, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !user) return null; // Esperar a que el usuario esté cargado

  const getStatusInfo = (election: Election): { text: string; icon: React.ReactNode; color: string; canVote: boolean } => {
    const now = new Date();
    const startDate = new Date(election.fechaInicio);
    const hasVoted = user.votedElectionIds.includes(election.id);

    if (hasVoted) {
      return {
        text: 'Completado',
        icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
        color: 'bg-success text-success-foreground',
        canVote: false,
      };
    }
    if (now < startDate) {
      return {
        text: 'Pendiente (Aún no inicia)',
        icon: <AlertCircle className="h-4 w-4 mr-1" />,
        color: 'bg-blue-100 text-blue-800',
        canVote: false,
      };
    }
    // Si está activa y no ha votado
    return {
      text: 'Pendiente',
      icon: <AlertCircle className="h-4 w-4 mr-1" />,
      color: 'bg-warning text-warning-foreground',
      canVote: true,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">Voto Safe</h1>
                <p className="text-xs text-muted-foreground">Portal del Ciudadano</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-foreground">{formatTime(sessionTimeRemaining)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* User Info */}
      <div className="container mx-auto px-4 py-6">
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {user.nombre} {user.apellidos}
                </h2>
                <p className="text-muted-foreground">DNI: {user.dni}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Section - Lista de Cédulas */}
      <div className="container mx-auto px-4 pb-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Cédulas de Votación Disponibles</h2>
          {activeElections.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay elecciones activas o programadas en este momento.
            </p>
          ) : (
            activeElections.map(election => {
              const status = getStatusInfo(election);
              return (
                <Card key={election.id} className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Flag className="h-5 w-5 text-primary" />
                        {election.nombre}
                      </CardTitle>
                      <Badge className={cn("text-xs", status.color)}>
                        {status.icon}
                        {status.text}
                      </Badge>
                    </div>
                    <CardDescription>{election.tipo}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span>Disponible del {format(new Date(election.fechaInicio), 'dd/MM/yyyy')} al {format(new Date(election.fechaFin), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{election.categorias.length} categorías a votar</span>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        asChild
                        disabled={!status.canVote}
                        size="lg"
                      >
                        <Link to={`/votar/${election.id}`}>
                          {status.canVote ? 'Ir a Votar' : (status.text === 'Completado' ? 'Voto Registrado' : 'No Disponible')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <ChatBot />
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default CitizenDashboard;