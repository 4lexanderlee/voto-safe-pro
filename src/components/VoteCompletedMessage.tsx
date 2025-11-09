// src/components/VoteCompletedMessage.tsx

import { CheckCircle2 } from 'lucide-react';

const VoteCompletedMessage = () => {
  return (
    <div className="text-center py-12">
      <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-2">¡Gracias por participar!</h3>
      <p className="text-muted-foreground">
        Tu voto ha sido registrado de forma segura y anónima
      </p>
    </div>
  );
};

export default VoteCompletedMessage;

