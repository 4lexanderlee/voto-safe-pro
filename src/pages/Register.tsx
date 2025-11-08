import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { generateMockUserData } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [dni, setDni] = useState('');
  const [autoFilledData, setAutoFilledData] = useState<any>(null);
  const [formData, setFormData] = useState({
    correo: '',
    celular: '',
    pin: '',
    confirmPin: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  // Auto-fill data when DNI reaches 8 digits (simulating RENIEC)
  useEffect(() => {
    if (dni.length === 8) {
      const mockData = generateMockUserData(dni);
      setAutoFilledData(mockData);
      toast({
        title: 'Datos encontrados',
        description: 'Información completada automáticamente desde RENIEC',
      });
    }
  }, [dni]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.pin !== formData.confirmPin) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Los PINs no coinciden',
      });
      setIsLoading(false);
      return;
    }

    if (!autoFilledData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ingresa un DNI válido de 8 dígitos',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        dni,
        pin: formData.pin,
        nombre: autoFilledData.nombre,
        apellidos: autoFilledData.apellidos,
        correo: formData.correo,
        celular: formData.celular,
        direccion: autoFilledData.direccion,
        sexo: autoFilledData.sexo,
        fechaNacimiento: autoFilledData.fechaNacimiento,
        termsAccepted: true
      });

      if (result.success) {
        toast({
          title: 'Registro exitoso',
          description: 'Tu cuenta ha sido creada correctamente',
        });
        navigate('/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error en el registro',
          description: result.error || 'No se pudo crear la cuenta',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al registrar la cuenta',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
            <CardDescription>
              Regístrate para participar en el proceso electoral
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DNI Field */}
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  required
                />
                {dni.length === 8 && autoFilledData && (
                  <p className="text-xs text-success">✓ DNI verificado</p>
                )}
              </div>

              {/* Auto-filled fields (read-only) */}
              {autoFilledData && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input value={autoFilledData.nombre} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Apellidos</Label>
                      <Input value={autoFilledData.apellidos} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input value={autoFilledData.direccion} disabled className="bg-muted" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sexo</Label>
                      <Input value={autoFilledData.sexo === 'M' ? 'Masculino' : 'Femenino'} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Nacimiento</Label>
                      <Input value={autoFilledData.fechaNacimiento} disabled className="bg-muted" />
                    </div>
                  </div>
                </>
              )}

              {/* Editable fields */}
              {autoFilledData && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo Electrónico</Label>
                    <Input
                      id="correo"
                      type="email"
                      placeholder="tu@correo.com"
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      type="tel"
                      placeholder="987654321"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                      maxLength={9}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pin">PIN (4 dígitos)</Label>
                      <Input
                        id="pin"
                        type="password"
                        placeholder="****"
                        value={formData.pin}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        maxLength={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPin">Confirmar PIN</Label>
                      <Input
                        id="confirmPin"
                        type="password"
                        placeholder="****"
                        value={formData.confirmPin}
                        onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Cuenta
                  </Button>
                </>
              )}

              <div className="text-center text-sm">
                <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
