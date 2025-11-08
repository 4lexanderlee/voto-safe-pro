import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut, BarChart3, Users, Vote } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">Voto Safe</h1>
                <p className="text-xs text-muted-foreground">Panel de Administración</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-right">
                <p className="font-semibold text-foreground">{user.nombre}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotes}</div>
              <p className="text-xs text-muted-foreground">
                de {totalUsers} registrados
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participación</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{votingParticipation}%</div>
              <p className="text-xs text-muted-foreground">
                del padrón electoral
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Elecciones Activas</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Elecciones Generales 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="estadisticas" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="votantes">Votantes</TabsTrigger>
            <TabsTrigger value="elecciones">Elecciones</TabsTrigger>
          </TabsList>

          <TabsContent value="estadisticas" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Votos por Partido (Presidencial)</CardTitle>
                  <CardDescription>Distribución de votos presidenciales</CardDescription>
                </CardHeader>
                <CardContent>
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

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Género</CardTitle>
                  <CardDescription>Votantes registrados por género</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={genderData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1e40af" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Edad</CardTitle>
                  <CardDescription>Votantes registrados por rango etario</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="votantes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Votantes</CardTitle>
                <CardDescription>Búsqueda y gestión de ciudadanos registrados</CardDescription>
                <div className="pt-4">
                  <Input
                    placeholder="Buscar por DNI o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">DNI</th>
                        <th className="text-left p-2">Nombre Completo</th>
                        <th className="text-left p-2">Correo</th>
                        <th className="text-left p-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u: any) => (
                        <tr key={u.dni} className="border-b hover:bg-muted/50">
                          <td className="p-2">{u.dni}</td>
                          <td className="p-2">{u.nombre} {u.apellidos}</td>
                          <td className="p-2">{u.correo}</td>
                          <td className="p-2">
                            {u.hasVoted ? (
                              <span className="text-success text-xs">✓ Votó</span>
                            ) : (
                              <span className="text-warning text-xs">Pendiente</span>
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

          <TabsContent value="elecciones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Elecciones</CardTitle>
                <CardDescription>Crear y administrar procesos electorales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Elecciones Generales 2025</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span> Presidencial
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado:</span>{' '}
                      <span className="text-success">Activa</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha:</span> 10 Abril 2025
                    </div>
                    <div>
                      <span className="text-muted-foreground">Categorías:</span> 5
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" disabled>
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
