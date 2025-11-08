import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { completeLoginHelper } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const Login = () => {
  const [dni, setDni] = useState('');
  const [pin, setPin] = useState('');
  const [tempCode, setTempCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, verifyCode } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(dni, pin);
      
      if (result.success && result.tempCode) {
        setTempCode(result.tempCode);
        setStep('verification');
        toast({
          title: 'Código enviado',
          description: `Tu código de verificación es: ${result.tempCode}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error de autenticación',
          description: result.error || 'Credenciales incorrectas',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al iniciar sesión',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (verifyCode(userCode, tempCode)) {
        const user = completeLoginHelper(dni);
        
        if (user) {
          toast({
            title: 'Inicio de sesión exitoso',
            description: `Bienvenido ${user.nombre}`,
          });
          
          // Navigate based on role
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Código incorrecto',
          description: 'El código de verificación no coincide',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error en la verificación',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>
              {step === 'credentials' 
                ? 'Ingresa tu DNI y PIN para continuar'
                : 'Ingresa el código de verificación enviado'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'credentials' ? (
              <form onSubmit={handleLogin} className="space-y-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">PIN (4 dígitos)</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={pin}
                      onChange={(value) => setPin(value)}
                      required
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continuar
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">¿No tienes cuenta? </span>
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Regístrate aquí
                  </Link>
                </div>

                <div className="bg-secondary/50 border border-border rounded-md p-3 text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Usuarios de prueba:</p>
                  <p>Ciudadano: DNI 12345678, PIN 1234</p>
                  <p>Admin: DNI 87654321, PIN 4321</p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="bg-secondary/50 border border-border rounded-md p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Se ha enviado un código de verificación
                  </p>
                  <p className="text-2xl font-bold text-primary">{tempCode}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (En producción se enviaría por SMS o correo)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificación</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={userCode}
                      onChange={(value) => setUserCode(value)}
                      required
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep('credentials');
                      setUserCode('');
                      setTempCode('');
                    }}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verificar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
