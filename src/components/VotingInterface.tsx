// src/components/VotingInterface.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { mockElection } from '@/lib/mockData';
import { Vote } from '@/types';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Este componente recibe una función para notificar al padre que el voto se completó.
interface VotingInterfaceProps {
  onVoteSubmitted: () => void;
}

const VotingInterface = ({ onVoteSubmitted }: VotingInterfaceProps) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});

  const handleVoteSelection = (categoryId: string, candidateId: string) => {
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

    if (!user) return; // Verificación de usuario

    // Save vote
    const vote: Vote = {
      userId: user.dni,
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
    
    // Notificar al componente padre
    onVoteSubmitted(); 

    toast({
      title: '¡Voto registrado exitosamente!',
      description: 'Tu voto ha sido procesado de forma segura',
    });
  };

  return (
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
  );
};

export default VotingInterface;