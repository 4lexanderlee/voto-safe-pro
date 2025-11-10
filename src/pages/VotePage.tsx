// src/pages/VotePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Election, Vote, Candidate } from '@/types';
import { Shield, LogOut, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatBot from '@/components/ChatBot';
import { mockCandidates } from '@/lib/mockData'; // Usaremos candidatos mock por ahora

// Esta función simula la carga de candidatos para una elección específica
// En un caso real, esto vendría de una API o estaría en el objeto Election
const getElectionWithCandidates = (election: Election): Election => {
  return {
    ...election,
    categorias: election.categorias.map(categoria => ({
      ...categoria,
      // Asignamos candidatos mock a cada categoría para la simulación
      candidatos: mockCandidates.map(c => ({
        ...c,
        id: `${election.id}-${categoria.id}-${c.id}`, // ID único por candidato en esta elección/categoría
        nombre: `${c.nombre} (${categoria.nombre.slice(0, 4)})` // Nombre de ejemplo
      }))
    }))
  };
};

const VotePage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { user, logout, sessionTimeRemaining, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [election, setElection] = useState<Election | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Esperar
    if (!user) {
      navigate('/login');
      return;
    }

    // Comprobar si ya votó en esta elección
    if (user.votedElectionIds.includes(electionId || '')) {
      setHasVoted(true);
    }

    // Cargar la elección específica desde localStorage
    const allElections: Election[] = JSON.parse(localStorage.getItem('elections') || '[]');
    const currentElection = allElections.find(e => e.id === electionId);

    if (currentElection) {
      // Simular la carga de candidatos para esta elección
      setElection(getElectionWithCandidates(currentElection));
    } else {
      // Elección no encontrada
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'La elección que intentas votar no existe.',
      });
      navigate('/dashboard');
    }
  }, [user, navigate, isLoading, electionId, toast]);

  const handleVoteSelection = (categoryId: string, candidateId: string) => {
    if (hasVoted) return;
    
    setSelectedVotes(prev => ({
      ...prev,
      [categoryId]: candidateId
    }));
  };

  const handleSubmitVote = () => {
    if (!election) return;
    
    // Validar si la votación está completa (si la elección no lo permite)
    if (!election.permiteVotoIncompleto && Object.keys(selectedVotes).length !== election.categorias.length) {
      toast({
        variant: 'destructive',
        title: 'Votación incompleta',
        description: 'Debes votar en todas las categorías antes de enviar',
      });
      return;
    }

    // Guardar voto
    const vote: Vote = {
      userId: user!.dni,
      electionId: election.id,
      fecha: new Date().toISOString(),
      votos: Object.entries(selectedVotes).map(([categoria, candidatoId]) => {
        const cat = election.categorias.find(c => c.id === categoria);
        const candidate = cat?.candidatos.find(c => c.id === candidatoId);
        return {
          categoria,
          candidatoId,
          partido: candidate?.partido || 'Voto Nulo/Blanco' // Asumir nulo si no se encuentra
        };
      })
    };

    // Guardar en localStorage
    const existingVotes = localStorage.getItem('votes');
    const votes = existingVotes ? JSON.parse(existingVotes) : [];
    votes.push(vote);
    localStorage.setItem('votes', JSON.stringify(votes));

    // Actualizar estado del usuario
    updateUser({ votedElectionIds: [...user!.votedElectionIds, election.id] });
    setHasVoted(true);

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

  if (isLoading || !user || !election) {
    // Puedes poner un skeleton/loader aquí
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  } 

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

      {/* User Info & Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a Cédulas
        </Link>
      </div>

      {/* Voting Section */}
      <div className="container mx-auto px-4 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>{election.nombre}</CardTitle>
            <CardDescription>
              Selecciona un candidato por cada categoría electoral
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasVoted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">¡Gracias por participar!</h3>
                <p className="text-muted-foreground">
                  Tu voto para esta elección ha sido registrado.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/dashboard">Volver a Cédulas</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {election.categorias.map((categoria) => (
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
                      {/* Lógica para Voto Nulo/Blanco si está permitido */}
                      {election.permiteVotoNulo && (
                         <button
                            onClick={() => handleVoteSelection(categoria.id, 'NULO')}
                            className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-lg ${
                              selectedVotes[categoria.id] === 'NULO'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">❌</div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-1">
                                  Voto Nulo / En Blanco
                                </h4>
                                {selectedVotes[categoria.id] === 'NULO' && (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </div>
                          </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-6">
                  <Button
                    size="lg"
                    onClick={handleSubmitVote}
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
    </div>
  );
};

export default VotePage;