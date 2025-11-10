// src/components/BallotCard.tsx
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CalendarDays, Flag, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Election } from '@/types'; // Importa el tipo Election
import { cn } from '@/lib/utils';

interface BallotCardProps {
  election: Election;
  onView: (election: Election) => void;
  onEdit?: (election: Election) => void; // Opcional para edición
  onDelete?: (electionId: string) => void; // Opcional para eliminación
}

const BallotCard: React.FC<BallotCardProps> = ({ election, onView, onEdit, onDelete }) => {
  const now = new Date();
  const startDate = new Date(election.fechaInicio);
  const endDate = new Date(election.fechaFin);

  // Determinar el estado de la cédula (basado en las fechas)
  let status: 'activa' | 'pendiente' | 'finalizada';
  let statusBadgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';

  if (now < startDate) {
    status = 'pendiente';
    statusBadgeVariant = 'secondary';
  } else if (now >= startDate && now <= endDate) {
    status = 'activa';
    statusBadgeVariant = 'success';
  } else {
    status = 'finalizada';
    statusBadgeVariant = 'outline';
  }

  // Actualizar el estado de la elección si es diferente al calculado
  // Esto es para que el estado se actualice automáticamente en el frontend
  // sin necesidad de editar la elección manualmente solo para cambiar el estado.
  useEffect(() => {
    if (election.estado !== status) {
      // Nota: Aquí se debería llamar a una función para actualizar el estado en el padre (AdminDashboard)
      // y persistirlo en localStorage. Por ahora, solo lo calculamos para la UI.
      // Si quieres persistirlo, deberías pasar una prop `onUpdateStatus` al BallotCard.
      console.log(`Estado de la elección ${election.nombre} cambió de ${election.estado} a ${status}`);
    }
  }, [status, election.estado, election.nombre]);


  return (
    <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Flag className="h-6 w-6 text-primary" />
            {election.nombre}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {election.tipo} - {election.categorias.length} Categorías
          </CardDescription>
        </div>
        <Badge 
          className={cn(
            "text-xs px-3 py-1",
            statusBadgeVariant === 'success' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
            statusBadgeVariant === 'secondary' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            statusBadgeVariant === 'outline' && 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400',
          )}
        >
          {status === 'activa' && 'Activa'}
          {status === 'pendiente' && 'Pendiente'}
          {status === 'finalizada' && 'Finalizada'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>Inicio: {format(new Date(election.fechaInicio), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>Fin: {format(new Date(election.fechaFin), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        {/* Aquí podríamos añadir más detalles como cuántos usuarios han votado, etc. */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border/70">
          <Button variant="outline" size="sm" onClick={() => onView(election)}>
            <FileText className="h-4 w-4 mr-2" />
            Ver Detalles
          </Button>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(election)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(election.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BallotCard;