// src/components/VotingInterface.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Election, Vote } from '@/types'; // <-- CAMBIO: Election añadido
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VotingInterfaceProps {
  election: Election; // <-- CAMBIO: Recibe la elección completa
  onVoteSubmitted: () => void;
}

const VotingInterface = ({ election, onVoteSubmitted }: VotingInterfaceProps) => {
  const { user, submitVote } = useAuth(); // <-- CAMBIO: submitVote
  const { toast } = useToast();
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});

  const handleVoteSelection = (categoryId: string, candidateId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [categoryId]: candidateId
    }));
  };

  const handleSubmitVote = () => {
    // CAMBIO: Lógica de validación actualizada
    if (election.requireAllCategories && Object.keys(selectedVotes).length !== election.categorias.length) {
      toast({
        variant: 'destructive',
        title: 'Votación incompleta',
        description: 'Debes votar en todas las categorías antes de enviar',
      });
      return;
    }

    if (!user) return;

    // CAMBIO: Lógica de guardado actualizada
    const vote: Vote = {
      userId: user.dni,
      electionId: election.id, // <-- CAMBIO
      fecha: new Date().toISOString(),
      votos: Object.entries(selectedVotes).map(([categoria, candidatoId]) => {
        const cat = election.categorias.find(c => c.id === categoria);
        const candidate = cat?.candidatos.find(c => c.id === candidatoId);
        return {
          categoria,
          candidatoId,
          partido: candidate?.partido || ''
        };
      })
    };

    // CAMBIO: Llamar a la nueva función del contexto
    submitVote(vote);
    
    onVoteSubmitted(); 

    toast({
      title: '¡Voto registrado exitosamente!',
      description: 'Tu voto ha sido procesado de forma segura',
    });
  };

  return (
    <div className="space-y-8">
      {/* CAMBIO: Mapea sobre las categorías de la elección recibida */}
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
          </div>
        </div>
      ))}
      
      {/* TODO: Aquí se podría añadir la lógica de "Voto Nulo" si 'election.allowNullVote' es true */}

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          onClick={handleSubmitVote}
          // CAMBIO: Lógica de deshabilitado actualizada
          disabled={election.requireAllCategories && Object.keys(selectedVotes).length !== election.categorias.length}
        >
          Enviar Voto
        </Button>
      </div>
    </div>
  );
};

export default VotingInterface;