// src/pages/CitizenDashboard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { mockElection } from '@/lib/mockData';
import { Election } from '@/types'; // <-- CAMBIO
import { Shield, LogOut, Clock, CheckCircle2, AlertCircle, FileText, Calendar, BarChart3 } from 'lucide-react'; // <-- CAMBIO
import ChatBot from '@/components/ChatBot';
import TermsModal from '@/components/TermsModal';
import VotingInterface from '@/components/VotingInterface';
import VoteCompletedMessage from '@/components/VoteCompletedMessage';

const CitizenDashboard = () => {
  const { user, logout, sessionTimeRemaining } = useAuth();
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  
  // CAMBIO: Controla qué elección se está votando
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Cargar elecciones desde localStorage
    const storedElections = localStorage.getItem('elections');
    setElections(storedElections ? JSON.parse(storedElections) : [mockElection]);

    const termsAccepted = localStorage.getItem('termsAccepted');
    if (!termsAccepted) {
      setShowTerms(true);
    }
  }, [user, navigate]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoteSubmission = () => {
    // Cuando el voto se envía, volvemos a la lista
    setSelectedElection(null);
  };

  if (!user) return null;
  
  // --- VISTA DE VOTACIÓN ---
  if (selectedElection) {
    const hasVotedInThis = user.votedIn.includes(selectedElection.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        {/* Header (se mantiene igual) */}
        <header /* ... */ >
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
        
        {/* Contenido de Votación */}
        <div className="container mx-auto px-4 pb-8 py-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedElection.nombre}</CardTitle>
              <CardDescription>
                Selecciona un candidato por cada categoría electoral
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasVotedInThis ? (
                <VoteCompletedMessage />
              ) : (
                <VotingInterface 
                  election={selectedElection} 
                  onVoteSubmitted={handleVoteSubmission} 
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <ChatBot />
        <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
      </div>
    );
  }

  // --- VISTA DE LISTA DE ELECCIONES (POR DEFECTO) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header (se mantiene igual) */}
      <header /* ... */ >
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

      {/* CAMBIO: Lista de Elecciones */}
      <div className="container mx-auto px-4 pb-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Elecciones Disponibles</h2>
          {elections.filter(e => e.activa).length > 0 ? (
            elections.filter(e => e.activa).map(election => {
              const hasVoted = user.votedIn.includes(election.id);
              return (
                <button
                  key={election.id}
                  className="w-full border-2 border-primary/20 rounded-lg p-5 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors text-left"
                  onClick={() => setSelectedElection(election)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg">{election.nombre}</h3>
                    {hasVoted ? (
                      <Badge className="bg-success/10 text-success hover:bg-success/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-warning text-warning hover:bg-warning/20">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground block text-xs">Tipo</span>
                        <span className="font-medium">{election.tipo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground block text-xs">Categorías</span>
                        <span className="font-medium">{election.categorias.length} categorías</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground block text-xs">Fecha</span>
                        <span className="font-medium">{election.fechaInicio} al {election.fechaFin}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-muted-foreground">No hay elecciones activas en este momento.</p>
          )}
        </div>
      </div>

      <ChatBot />
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default CitizenDashboard;