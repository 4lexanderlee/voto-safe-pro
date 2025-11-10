// src/pages/AdminElectionDetails.tsx

import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AdminElectionDetails = () => {
  const { electionId } = useParams();

  // En un futuro, aquí cargarías los datos de la elección usando el electionId
  // const election = ...

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/elecciones">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Elecciones
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Elección</CardTitle>
          <CardDescription>
            ID de la Elección: {electionId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Esta es la "página en blanco". En un futuro, aquí podrás
            gestionar los candidatos, ver resultados en vivo y más
            detalles de esta elección específica.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminElectionDetails;