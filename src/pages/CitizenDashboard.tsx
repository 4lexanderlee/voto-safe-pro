import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { mockElection } from '@/lib/mockData';
import { Vote } from '@/types';
import { Shield, LogOut, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatBot from '@/components/ChatBot';
import TermsModal from '@/components/TermsModal';

const CitizenDashboard = () => {
  const { user, logout, sessionTimeRemaining, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if terms have been accepted
    const termsAccepted = localStorage.getItem('termsAccepted');
    if (!termsAccepted) {
      setShowTerms(true);
    }

    // Check if user has already voted
    if (user.hasVoted) {
      setHasSubmitted(true);
    }
  }, [user, navigate]);

  const handleVoteSelection = (categoryId: string, candidateId: string) => {
    if (hasSubmitted) return;
    
    setSelectedVotes(prev => ({
      ...prev,
      [categoryId]: candidateId
    }));
  };

  const handleSubmitVote = () => {
    if (Object.keys(selectedVotes).length !== mockElection.categorias.length) {
      toast({
        variant: 'destructive',
        title: 'Votación incompleta',
        description: 'Debes votar en todas las categorías antes de enviar',
      });
      return;
    }

    // Save vote
    const vote: Vote = {
      userId: user!.dni,
      electionId: mockElection.id,
      fecha: new Date().toISOString(),
      votos: Object.entries(selectedVotes).map(([categoria, candidatoId]) => {
        const cat = mockElection.categorias.find(c => c.id === categoria);
        const candidate = cat?.candidatos.find(c => c.id === candidatoId);
        return {
          categoria,
          candidatoId,
          partido: candidate?.partido || ''
        };
      })
    };

    // Save to localStorage
    const existingVotes = localStorage.getItem('votes');
    const votes = existingVotes ? JSON.parse(existingVotes) : [];
    votes.push(vote);
    localStorage.setItem('votes', JSON.stringify(votes));

    // Update user status
    updateUser({ hasVoted: true });
    setHasSubmitted(true);

    toast({
      title: '¡Voto registrado exitosamente!',
      description: 'Tu voto ha sido procesado de forma segura',
    });
  };

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
            <CardTitle>{mockElection.nombre}</CardTitle>
            <CardDescription>
              Selecciona un candidato por cada categoría electoral
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">¡Gracias por participar!</h3>
                <p className="text-muted-foreground">
                  Tu voto ha sido registrado de forma segura y anónima
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {mockElection.categorias.map((categoria) => (
                  <div key={categoria.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-lg font-bold text-foreground">{categoria.nombre}</h3>
                      {selectedVotes[categoria.id] && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success">
                          Seleccionado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {categoria.candidatos.map((candidato) => {
                        const isSelected = selectedVotes[categoria.id] === candidato.id;
                        return (
                          <button
                            key={candidato.id}
                            onClick={() => handleVoteSelection(categoria.id, candidato.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-lg ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-3xl">{candidato.simbolo}</div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-1">
                                  {candidato.nombre}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {candidato.partido}
                                </p>
                                {isSelected && (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-6">
                  <Button
                    size="lg"
                    onClick={handleSubmitVote}
                    disabled={Object.keys(selectedVotes).length !== mockElection.categorias.length}
                  >
                    Enviar Voto
                  </Button>
                </div>
              </div>
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
