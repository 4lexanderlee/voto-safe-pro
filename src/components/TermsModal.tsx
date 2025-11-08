import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const TermsModal = ({ open, onClose }: TermsModalProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      localStorage.setItem('termsAccepted', 'true');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Términos y Condiciones de Uso</DialogTitle>
          <DialogDescription>
            Por favor, lee y acepta los términos antes de continuar
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 text-sm text-foreground">
            <section>
              <h3 className="font-bold text-base mb-2">1. Aceptación de Términos</h3>
              <p className="text-muted-foreground">
                Al acceder y utilizar la plataforma Voto Safe, usted acepta estar legalmente vinculado
                por estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos,
                no debe utilizar este servicio.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">2. Uso del Sistema Electoral</h3>
              <p className="text-muted-foreground">
                El usuario se compromete a utilizar el sistema de votación electrónica de manera responsable
                y de acuerdo con las leyes electorales del Perú. Cualquier intento de manipulación,
                fraude o acceso no autorizado será reportado a las autoridades competentes.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">3. Confidencialidad y Seguridad</h3>
              <p className="text-muted-foreground">
                Su voto es secreto y anónimo. La plataforma utiliza encriptación de última generación
                para proteger su información personal y garantizar la integridad del proceso electoral.
                No compartiremos su información con terceros sin su consentimiento explícito.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">4. Responsabilidades del Usuario</h3>
              <p className="text-muted-foreground mb-2">
                Como usuario de Voto Safe, usted se compromete a:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Mantener la confidencialidad de su PIN y credenciales de acceso</li>
                <li>No compartir su cuenta con terceros</li>
                <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                <li>Proporcionar información veraz y actualizada</li>
                <li>Votar una sola vez en cada proceso electoral</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">5. Protección de Datos Personales</h3>
              <p className="text-muted-foreground">
                En cumplimiento de la Ley N° 29733 - Ley de Protección de Datos Personales del Perú,
                sus datos personales serán tratados con la máxima confidencialidad y utilizados
                únicamente para fines del proceso electoral. Usted tiene derecho a acceder,
                rectificar, cancelar u oponerse al tratamiento de sus datos.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">6. Duración de la Sesión</h3>
              <p className="text-muted-foreground">
                Por razones de seguridad, su sesión en la plataforma tiene una duración máxima
                de 5 minutos. Después de este tiempo, deberá iniciar sesión nuevamente.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">7. Modificaciones del Servicio</h3>
              <p className="text-muted-foreground">
                Voto Safe se reserva el derecho de modificar o discontinuar el servicio en cualquier
                momento, con o sin previo aviso. No seremos responsables ante usted o terceros por
                cualquier modificación, suspensión o discontinuación del servicio.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">8. Limitación de Responsabilidad</h3>
              <p className="text-muted-foreground">
                Voto Safe no será responsable de daños directos, indirectos, incidentales,
                especiales o consecuentes que resulten del uso o la imposibilidad de usar el servicio,
                incluso si hemos sido advertidos de la posibilidad de tales daños.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">9. Jurisdicción y Ley Aplicable</h3>
              <p className="text-muted-foreground">
                Estos términos se regirán e interpretarán de acuerdo con las leyes de la República
                del Perú. Cualquier disputa que surja en relación con estos términos estará sujeta
                a la jurisdicción exclusiva de los tribunales de Lima, Perú.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">10. Contacto</h3>
              <p className="text-muted-foreground">
                Para preguntas sobre estos términos y condiciones, puede contactarnos en:
                legal@votosafe.pe
              </p>
            </section>

            <section className="border-t pt-4">
              <p className="text-xs text-muted-foreground italic">
                Última actualización: 10 de Noviembre de 2025
              </p>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los términos y condiciones
              </label>
            </div>
            <Button onClick={handleAccept} disabled={!accepted}>
              Continuar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
