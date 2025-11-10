// src/pages/AdminDashboard.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, Users, Vote, TrendingUp, Search, FileText, 
  Calendar, CheckCircle2, AlertCircle, ArrowLeft, Plus, MoreHorizontal, Pencil, Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockElection, mockUsers } from '@/lib/mockData'; // <-- CAMBIO: mockUsers añadido
import { Election } from '@/types'; // <-- CAMBIO: Election añadido
import VotingInterface from '@/components/VotingInterface';
import VoteCompletedMessage from '@/components/VoteCompletedMessage';
import { ElectionFormModal } from '@/components/ElectionFormModal'; // <-- CAMBIO: Importar modal
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // <-- CAMBIO: Importar Dropdown

type AdminContextType = { activeTab: string };

// Hook para gestionar la lista de elecciones desde localStorage
function useElections() {
  const [elections, setElections] = useState<Election[]>([]);

  useEffect(() => {
    let storedElections = localStorage.getItem('elections');
    if (!storedElections) {
      // Si no hay nada, inicializar con la data de mock
      storedElections = JSON.stringify([mockElection]);
      localStorage.setItem('elections', storedElections);
    }
    setElections(JSON.parse(storedElections));
  }, []);

  const saveElections = (updatedElections: Election[]) => {
    setElections(updatedElections);
    localStorage.setItem('elections', JSON.stringify(updatedElections));
  };

  return { elections, saveElections };
}

// Hook para gestionar los usuarios desde localStorage (para estadísticas)
function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    let storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      storedUsers = JSON.stringify(mockUsers);
      localStorage.setItem('users', storedUsers);
    }
    setUsers(JSON.parse(storedUsers));
  }, []);
  return users;
}


const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeTab } = useOutletContext<AdminContextType>();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [adminHasVoted, setAdminHasVoted] = useState(user?.votedIn || []);
  const [votingView, setVotingView] = useState<'list' | 'voting'>('list');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  // --- NUEVA LÓGICA DE GESTIÓN DE ELECCIONES ---
  const { elections, saveElections } = useElections();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [electionToEdit, setElectionToEdit] = useState<Election | null>(null);

  const users = useUsers(); // Hook para usuarios de estadísticas

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setAdminHasVoted(user.votedIn);
    }
  }, [user?.votedIn]);

  const handleOpenCreateModal = () => {
    setElectionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (election: Election) => {
    setElectionToEdit(election);
    setIsModalOpen(true);
  };

  const handleDeleteElection = (electionId: string) => {
    // Aquí podrías añadir una confirmación (AlertDialog)
    const updatedElections = elections.filter(e => e.id !== electionId);
    saveElections(updatedElections);
  };

  const handleFormSubmit = (data: Election) => {
    let updatedElections: Election[];
    if (electionToEdit) {
      // Modo Edición
      updatedElections = elections.map(e => e.id === data.id ? data : e);
    } else {
      // Modo Creación
      updatedElections = [...elections, data];
    }
    saveElections(updatedElections);
    setIsModalOpen(false);
    setElectionToEdit(null);
  };
  // --- FIN LÓGICA GESTIÓN ELECCIONES ---


  // (Lógica de estadísticas - sin cambios, pero usa 'users' del hook)
  const votes = JSON.parse(localStorage.getItem('votes') || '[]');
  const totalVotes = votes.length;
  const totalUsers = users.length;
  const votingParticipation = totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(1) : 0;
  const partyVotes: Record<string, number> = {};
  votes.forEach((vote: any) => {
    vote.votos.forEach((v: any) => {
      if (v.categoria === 'cat1') {
        partyVotes[v.partido] = (partyVotes[v.partido] || 0) + 1;
      }
    });
  });
  const pieData = Object.entries(partyVotes).map(([name, value]) => ({ name, value }));
  const COLORS = ['#1e40af', '#dc2626', '#16a34a', '#ca8a04'];
  const genderData = [
    { name: 'Masculino', value: users.filter((u: any) => u.sexo === 'M').length },
    { name: 'Femenino', value: users.filter((u: any) => u.sexo === 'F').length }
  ];
  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getFullYear() - birth.getFullYear();
  };
  const ageGroups = { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
  users.forEach((u: any) => {
    const age = getAge(u.fechaNacimiento);
    if (age <= 30) ageGroups['18-30']++;
    else if (age <= 45) ageGroups['31-45']++;
    else if (age <= 60) ageGroups['46-60']++;
    else ageGroups['60+']++;
  });
  const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
  const filteredUsers = users.filter((u: any) =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.dni.includes(searchTerm)
  );

  if (!user) return null;

  return (
    <>
      {/* Stats Overview (sin cambios) */}
      <div className="container mx-auto px-4 py-8">
        {/* ... (código de las 3 tarjetas de estadísticas) ... */}
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
              <div className="text-3xl font-bold text-foreground">{elections.filter(e => e.activa).length}</div>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Procesos electorales
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs 
          value={activeTab} 
          onValueChange={(tab) => navigate(tab === 'estadisticas' ? '/admin' : `/admin/${tab}`)} 
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 h-12 p-1 sticky top-[0rem] z-30 bg-background/95 backdrop-blur-md shadow-sm">
            {/* ... (código de TabsTrigger sin cambios) ... */}
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
            <TabsTrigger value="cedula" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
              <FileText className="h-4 w-4 mr-2" />
              Cédula de Votación
            </TabsTrigger>
          </TabsList>

          {/* Pestaña Estadisticas (sin cambios) */}
          <TabsContent value="estadisticas" className="space-y-6">
            {/* ... (código de gráficos sin cambios) ... */}
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

          {/* Pestaña Votantes (sin cambios) */}
          <TabsContent value="votantes" className="space-y-6">
             {/* ... (código de la tabla de votantes) ... */}
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
                            <Badge variant="secondary" className="bg-secondary/80">
                                {u.votedIn.length > 0 ? `Votó en ${u.votedIn.length}` : 'Pendiente'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- PESTAÑA ELECCIONES (MODIFICADA) --- */}
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
                {/* Lista de tarjetas de elección */}
                {elections.map((election) => (
                  <div 
                    key={election.id} 
                    className="relative border-2 border-primary/20 rounded-lg p-5 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors"
                  >
                    {/* Botón de Opciones (Editar/Eliminar) */}
                    <div className="absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditModal(election)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteElection(election.id)} 
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <Link to={`/admin/elecciones/${election.id}`} className="block">
                      <div className="flex items-start justify-between mb-4 pr-10">
                        <h3 className="font-bold text-lg">{election.nombre}</h3>
                        <Badge className={election.activa ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground"}>
                          {election.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Tipo</span>
                            <span className="font-medium">{election.tipo}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Categorías</span>
                            <span className="font-medium">{election.categorias.length} categorías</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Duración</span>
                            <span className="font-medium">{election.fechaInicio} al {election.fechaFin}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
                
                <Button className="w-full" variant="outline" onClick={handleOpenCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nueva Elección
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* --- PESTAÑA CÉDULA DE VOTACIÓN (MODIFICADA) --- */}
          <TabsContent value="cedula" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  Cédula de Votación
                </CardTitle>
                <CardDescription>
                  {votingView === 'list' 
                    ? 'Selecciona una elección para ejercer tu voto' 
                    : `Votando en: ${selectedElection?.nombre}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                
                {/* VISTA DE LISTA DE ELECCIONES */}
                {votingView === 'list' && (
                  <div className="space-y-4">
                    {elections.filter(e => e.activa).length > 0 ? (
                      elections.filter(e => e.activa).map(election => {
                        const hasVoted = adminHasVoted.includes(election.id);
                        return (
                          <button
                            key={election.id}
                            className="w-full border-2 border-primary/20 rounded-lg p-5 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors text-left"
                            onClick={() => {
                              setSelectedElection(election);
                              setVotingView('voting');
                            }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="font-bold text-lg">{election.nombre}</h3>
                              {hasVoted ? (
                                <Badge className="bg-success/10 text-success hover:bg-success/20">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-warning text-warning hover:bg-warning/20">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pendiente
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              {/* ... (detalles de la tarjeta) ... */}
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <span className="text-muted-foreground block text-xs">Tipo</span>
                                  <span className="font-medium">{election.tipo}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <span className="text-muted-foreground block text-xs">Categorías</span>
                                  <span className="font-medium">{election.categorias.length} categorías</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <span className="text-muted-foreground block text-xs">Fecha</span>
                                  <span className="font-medium">{election.fechaInicio} al {election.fechaFin}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">No hay elecciones activas para votar.</p>
                    )}
                  </div>
                )}

                {/* VISTA DE VOTACIÓN (INTERFAZ DEL CIUDADANO) */}
                {votingView === 'voting' && selectedElection && (
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => setVotingView('list')}
                      className="mb-6"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver a Elecciones
                    </Button>
                    
                    {adminHasVoted.includes(selectedElection.id) ? (
                      <VoteCompletedMessage />
                    ) : (
                      <VotingInterface 
                        election={selectedElection} 
                        onVoteSubmitted={() => {
                          setVotingView('list'); // Volver a la lista
                          // Forzar actualización del estado local de 'adminHasVoted'
                          setAdminHasVoted(prev => [...prev, selectedElection.id]);
                        }} 
                      />
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
      
      {/* El ChatBot se renderiza en AdminLayout.tsx */}

      {/* Renderizar el modal */}
      <ElectionFormModal 
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setElectionToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={electionToEdit}
      />
    </>
  );
};

export default AdminDashboard;