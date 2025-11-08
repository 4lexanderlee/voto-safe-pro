import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, BarChart3, Users, Vote, TrendingUp, Search, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChatBot from '@/components/ChatBot';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Get data from localStorage
  const votes = JSON.parse(localStorage.getItem('votes') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  // Calculate statistics
  const totalVotes = votes.length;
  const totalUsers = users.length;
  const votingParticipation = totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(1) : 0;

  // Party vote distribution
  const partyVotes: Record<string, number> = {};
  votes.forEach((vote: any) => {
    vote.votos.forEach((v: any) => {
      if (v.categoria === 'cat1') { // Only count presidential votes
        partyVotes[v.partido] = (partyVotes[v.partido] || 0) + 1;
      }
    });
  });

  const pieData = Object.entries(partyVotes).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#1e40af', '#dc2626', '#16a34a', '#ca8a04'];

  // Gender distribution
  const genderData = [
    { name: 'Masculino', value: users.filter((u: any) => u.sexo === 'M').length },
    { name: 'Femenino', value: users.filter((u: any) => u.sexo === 'F').length }
  ];

  // Age distribution
  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getFullYear() - birth.getFullYear();
  };

  const ageGroups = {
    '18-30': 0,
    '31-45': 0,
    '46-60': 0,
    '60+': 0
  };

  users.forEach((u: any) => {
    const age = getAge(u.fechaNacimiento);
    if (age <= 30) ageGroups['18-30']++;
    else if (age <= 45) ageGroups['31-45']++;
    else if (age <= 60) ageGroups['46-60']++;
    else ageGroups['60+']++;
  });

  const ageData = Object.entries(ageGroups).map(([name, value]) => ({
    name,
    value
  }));

  // Filter users for search
  const filteredUsers = users.filter((u: any) =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.dni.includes(searchTerm)
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Voto Safe
                </h1>
                <p className="text-xs text-muted-foreground font-medium">Panel de Administración</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-right hidden md:block">
                <p className="font-semibold text-foreground">{user.nombre}</p>
                <Badge variant="secondary" className="text-xs">Administrador</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 via-background to-background hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Votantes</CardTitle>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalVotes}</div>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <p className="text-xs text-muted-foreground">
                  de {totalUsers} registrados
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-accent/10 via-background to-background hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Participación</CardTitle>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{votingParticipation}%</div>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <p className="text-xs text-muted-foreground">
                  del padrón electoral
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-success/10 via-background to-background hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Elecciones Activas</CardTitle>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Vote className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">1</div>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Elecciones Generales 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="estadisticas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1">
            <TabsTrigger value="estadisticas" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="votantes" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
              <Users className="h-4 w-4 mr-2" />
              Votantes
            </TabsTrigger>
            <TabsTrigger value="elecciones" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
              <Vote className="h-4 w-4 mr-2" />
              Elecciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estadisticas" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    Votos por Partido (Presidencial)
                  </CardTitle>
                  <CardDescription>Distribución de votos presidenciales</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-accent" />
                    </div>
                    Distribución por Género
                  </CardTitle>
                  <CardDescription>Votantes registrados por género</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={genderData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }} 
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg md:col-span-2">
                <CardHeader className="bg-gradient-to-r from-success/5 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    Distribución por Edad
                  </CardTitle>
                  <CardDescription>Votantes registrados por rango etario</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }} 
                      />
                      <Bar dataKey="value" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="votantes" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  Lista de Votantes
                </CardTitle>
                <CardDescription>Búsqueda y gestión de ciudadanos registrados</CardDescription>
                <div className="pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por DNI o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b-2 border-border bg-muted/30">
                      <tr>
                        <th className="text-left p-3 font-semibold text-foreground">DNI</th>
                        <th className="text-left p-3 font-semibold text-foreground">Nombre Completo</th>
                        <th className="text-left p-3 font-semibold text-foreground">Correo</th>
                        <th className="text-left p-3 font-semibold text-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u: any) => (
                        <tr key={u.dni} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3 font-medium">{u.dni}</td>
                          <td className="p-3">{u.nombre} {u.apellidos}</td>
                          <td className="p-3 text-muted-foreground">{u.correo}</td>
                          <td className="p-3">
                            {u.hasVoted ? (
                              <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">
                                ✓ Votó
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-warning/10 text-warning hover:bg-warning/20">
                                Pendiente
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elecciones" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Vote className="h-4 w-4 text-accent" />
                  </div>
                  Gestión de Elecciones
                </CardTitle>
                <CardDescription>Crear y administrar procesos electorales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-primary/20 rounded-lg p-5 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg">Elecciones Generales 2025</h3>
                    <Badge className="bg-success/10 text-success hover:bg-success/20">Activa</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground block text-xs">Tipo</span>
                        <span className="font-medium">Presidencial</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground block text-xs">Categorías</span>
                        <span className="font-medium">5 categorías</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Vote className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground block text-xs">Fecha de votación</span>
                        <span className="font-medium">10 de Abril, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" disabled variant="outline">
                  <Vote className="h-4 w-4 mr-2" />
                  Crear Nueva Elección (Próximamente)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ChatBot />
    </div>
  );
};

export default AdminDashboard;
