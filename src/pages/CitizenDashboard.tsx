// src/pages/CitizenDashboard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
// import { mockElection } from '@/lib/mockData'; // Ya no se necesita aquí
// import { Vote } from '@/types'; // Ya no se necesita aquí
import { Shield, LogOut, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast'; // Ya no se necesita aquí
import ChatBot from '@/components/ChatBot';
import TermsModal from '@/components/TermsModal';
import VotingInterface from '@/components/VotingInterface'; // <-- IMPORTAR
import VoteCompletedMessage from '@/components/VoteCompletedMessage'; // <-- IMPORTAR

const CitizenDashboard = () => {
  const { user, logout, sessionTimeRemaining } = useAuth(); // Se quita updateUser
  const navigate = useNavigate();
  // const { toast } = useToast(); // Se quita toast
  // const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({}); // Se quita selectedVotes
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const termsAccepted = localStorage.getItem('termsAccepted');
    if (!termsAccepted) {
      setShowTerms(true);
    }

    if (user.hasVoted) {
      setHasSubmitted(true);
    }
  }, [user, navigate]);

  // Se elimina handleVoteSelection
  // Se elimina handleSubmitVote

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

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
              {hasSubmitted ? (
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Voto Registrado
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning text-warning">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Pendiente de votar
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Section */}
      <div className="container mx-auto px-4 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>Elecciones Generales 2025</CardTitle>
            <CardDescription>
              Selecciona un candidato por cada categoría electoral
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSubmitted ? (
              <VoteCompletedMessage /> // <-- USAR COMPONENTE
            ) : (
              <VotingInterface onVoteSubmitted={() => setHasSubmitted(true)} /> // <-- USAR COMPONENTE
            )}
          </CardContent>
        </Card>
      </div>

      <ChatBot />
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default CitizenDashboard;