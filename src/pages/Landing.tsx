import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Vote, Users, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Voto Safe</h1>
              <p className="text-xs text-muted-foreground">Sistema Electoral del Perú</p>
            </div>
          </div>
          <Link to="/login">
            <Button variant="outline">Iniciar Sesión</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm font-medium text-secondary-foreground mb-4">
            <CheckCircle className="h-4 w-4" />
            Sistema Seguro y Confiable
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Plataforma de
            <span className="text-primary"> Votación Electrónica</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Participa en las elecciones presidenciales y regionales del Perú de manera segura, 
            transparente y desde cualquier lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                COMENZAR
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-card-foreground">Seguridad Garantizada</h3>
            <p className="text-muted-foreground">
              Sistema de autenticación de dos factores y encriptación de datos de última generación.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-card-foreground">Voto Electrónico</h3>
            <p className="text-muted-foreground">
              Emite tu voto de forma rápida y sencilla para todas las categorías electorales.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-card-foreground">Transparencia Total</h3>
            <p className="text-muted-foreground">
              Resultados en tiempo real y auditoría completa de todo el proceso electoral.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">25M+</div>
              <div className="text-primary-foreground/80">Ciudadanos Registrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-primary-foreground/80">Seguridad del Sistema</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80">Soporte Disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold text-foreground">¿Listo para votar?</h2>
          <p className="text-xl text-muted-foreground">
            Accede ahora a la plataforma y ejerce tu derecho al voto de manera segura.
          </p>
          <Link to="/login">
            <Button size="lg" className="text-lg px-12 py-6">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            © 2025 Voto Safe - Sistema Electoral del Perú. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-2">
            Plataforma de simulación electoral con fines educativos y demostrativos.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
