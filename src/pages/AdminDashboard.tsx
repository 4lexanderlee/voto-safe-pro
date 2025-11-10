 // src/pages/AdminDashboard.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  Users,
  Vote,
  TrendingUp,
  Search,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockElection, mockUsers } from '@/lib/mockData';
import { Election, User } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// --- COMPONENTES TEMPORALES (PLACEHOLDERS) ---
const VotingInterface: React.FC<{ election: Election; onVoteSubmitted: () => void }> = ({
  election,
  onVoteSubmitted,
}) => (
  <div className="text-center p-8 bg-muted rounded-lg">
    <p className="font-semibold">Interfaz de Votación (VotingInterface)</p>
    <p className="text-sm text-muted-foreground">Componente pendiente de crear para la elección: {election.nombre}</p>
    <Button onClick={onVoteSubmitted} className="mt-4">
      Simular Voto
    </Button>
  </div>
);

const VoteCompletedMessage: React.FC = () => (
  <div className="text-center p-8 bg-muted rounded-lg">
    <p className="font-semibold text-success">¡Ya votaste en esta elección!</p>
    <p className="text-sm text-muted-foreground">(VoteCompletedMessage)</p>
  </div>
);

const ElectionFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Election) => void;
  initialData?: Election | null;
}> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg shadow-lg">
        <p>Modal de Formulario de Elección (ElectionFormModal)</p>
        <p className="text-sm text-muted-foreground">Componente pendiente de crear.</p>
        <Button onClick={onClose} variant="outline" className="mt-4">
          Cerrar
        </Button>
      </div>
    </div>
  );
};
// --- FIN PLACEHOLDERS ---

type AdminContextType = { activeTab: string };

// Hook para gestionar la lista de elecciones desde localStorage
function useElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedElections = localStorage.getItem('elections');
      if (!storedElections) {
        // Si no hay elecciones guardadas, inicializar con mock
        localStorage.setItem('elections', JSON.stringify([mockElection]));
        setElections([mockElection]);
      } else {
        // Validar el JSON antes de establecerlo
        const parsedElections = JSON.parse(storedElections);
        if (!Array.isArray(parsedElections)) {
          throw new Error('Formato de elecciones inválido');
        }
        setElections(parsedElections);
      }
    } catch (err) {
      // Manejar error y resetear a estado inicial
      setError(err instanceof Error ? err.message : 'Error al cargar elecciones');
      localStorage.setItem('elections', JSON.stringify([mockElection]));
      setElections([mockElection]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveElections = useCallback((updatedElections: Election[]) => {
    try {
      localStorage.setItem('elections', JSON.stringify(updatedElections));
      setElections(updatedElections);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar elecciones');
    }
  }, []);

  const addElection = useCallback((election: Election) => {
    saveElections([...elections, election]);
  }, [elections, saveElections]);

  const updateElection = useCallback((updatedElection: Election) => {
    const updatedElections = elections.map((e) => 
      e.id === updatedElection.id ? updatedElection : e
    );
    saveElections(updatedElections);
  }, [elections, saveElections]);

  const deleteElection = useCallback((electionId: string) => {
    const updatedElections = elections.filter((e) => e.id !== electionId);
    saveElections(updatedElections);
  }, [elections, saveElections]);

  return { 
    elections, 
    isLoading, 
    error, 
    saveElections,
    addElection,
    updateElection,
    deleteElection
  };
}

// Hook para gestionar los usuarios desde localStorage (para estadísticas)
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    try {
      let storedUsers = localStorage.getItem('users');
      if (!storedUsers) {
        storedUsers = JSON.stringify(mockUsers);
        localStorage.setItem('users', storedUsers);
      }
      setUsers(JSON.parse(storedUsers));
    } catch (err) {
      localStorage.setItem('users', JSON.stringify(mockUsers));
      setUsers(mockUsers);
    }
  }, []);
  return users;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  //const outletContext = useOutletContext<AdminContextType | null>();
  //const activeTab = outletContext?.activeTab ?? 'estadisticas';
  const [activeTab, setActiveTab] = useState('estadisticas');
  // Estado de búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Estado de elecciones y votos
  const { 
    elections, 
    isLoading: electionsLoading, 
    error: electionsError,
    addElection,
    updateElection,
    deleteElection 
  } = useElections();

  // Estado del administrador
  const [adminVotedElections, setAdminVotedElections] = useState<string[]>(user?.votedIn ?? []);

  // Estado de la interfaz
  const [votingView, setVotingView] = useState<'list' | 'voting'>('list');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [electionToEdit, setElectionToEdit] = useState<Election | null>(null);

  // Obtener usuarios y mantener actualizada la lista filtrada
  const users = useUsers();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Mantener adminHasVoted sincronizado si user.votedIn cambia
  useEffect(() => {
    if (user) {
      setAdminVotedElections(user.votedIn ?? []); // <-- CORRECCIÓN
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
    deleteElection(electionId);
  };

  const handleFormSubmit = (data: Election) => {
    if (electionToEdit) {
      updateElection(data);
    } else {
      addElection(data);
    }
    setIsModalOpen(false);
    setElectionToEdit(null);
  };

  // Lógica de estadísticas
  let votes: any[] = [];
  try {
    votes = JSON.parse(localStorage.getItem('votes') || '[]');
  } catch {
    votes = [];
  }
  const totalVotes = votes.length;
  const totalUsers = users.length;
  const votingParticipation = totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(1) : '0.0';
  const partyVotes: Record<string, number> = {};

  // Leer estructura de votos: asumimos votes[] = [{ id, voterDni, votos: [{ categoriaId, partidoNombre, candidatoId }, ...] }, ...]
  votes.forEach((vote) => {
    if (!Array.isArray(vote.votos)) return;
    vote.votos.forEach((v: any) => {
      // Por ejemplo: contamos solo la categoría presidencial 'cat1' como en tu mock
      if (v.categoria === 'cat1') { // <-- CORREGIDO
        const party = v.partido ?? 'Sin partido'; // <-- CORREGIDO
        partyVotes[party] = (partyVotes[party] || 0) + 1;
      }
    });
  });

  const pieData = Object.entries(partyVotes).map(([name, value]) => ({ name, value }));
  const COLORS = ['#1e40af', '#dc2626', '#16a34a', '#ca8a04'];

  const genderData = [
    { name: 'Masculino', value: users.filter((u: any) => u.sexo === 'M').length },
    { name: 'Femenino', value: users.filter((u: any) => u.sexo === 'F').length },
  ];

  const getAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const ageGroups: Record<string, number> = { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
  users.forEach((u: any) => {
    const age = getAge(u.fechaNacimiento);
    if (age >= 18 && age <= 30) ageGroups['18-30']++;
    else if (age <= 45) ageGroups['31-45']++;
    else if (age <= 60) ageGroups['46-60']++;
    else if (age > 60) ageGroups['60+']++;
  });

  const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

  // Filtrar usuarios cuando cambie el término de búsqueda o la lista de usuarios
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = users.filter((u: User) => {
      if (!term) return true;
      return (
        (u.nombre ?? '').toLowerCase().includes(term) ||
        (u.apellidos ?? '').toLowerCase().includes(term) ||
        (u.dni ?? '').includes(term)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  if (!user) return null;

  return (
    <>
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
                <p className="text-xs text-muted-foreground">de {totalUsers} registrados</p>
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
                <p className="text-xs text-muted-foreground">del padrón electoral</p>
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
              <div className="text-3xl font-bold text-foreground">{elections.filter((e) => e.activa).length}</div>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Procesos electorales</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs
          value={activeTab}
          //onValueChange={(tab) => navigate(tab === 'estadisticas' ? '/admin' : `/admin/${tab}`)}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 h-12 p-1 sticky top-[0rem] z-30 bg-background/95 backdrop-blur-md shadow-sm">
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

          {/* Estadísticas */}
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
                    <RechartsBarChart data={genderData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                    </RechartsBarChart>
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
                    <RechartsBarChart data={ageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Votantes */}
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

                <div className="pt-4 w-full">
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
                      {filteredUsers.map((u: User) => (
                        <tr key={u.dni} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3 font-medium">{u.dni}</td>
                          <td className="p-3">
                            {u.nombre} {u.apellidos}
                          </td>
                          <td className="p-3 text-muted-foreground">{u.correo}</td>
                          <td className="p-3">
                            <Badge
                              variant={u.votedIn.length > 0 ? 'default' : 'secondary'} // <-- CORRECCIÓN
                              className={
                                u.votedIn.length > 0 // <-- CORRECCIÓN
                                  ? 'bg-success/10 text-success hover:bg-success/20'
                                  : 'bg-warning/10 text-warning hover:bg-warning/20'
                              }
                            >
                              {u.votedIn.length > 0 ? '✓ Votó' : 'Pendiente'} // -- CORRECCIÓN
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

          {/* Elecciones */}
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
                {elections.map((election) => (
                  <div
                    key={election.id}
                    className="relative border-2 border-primary/20 rounded-lg p-5 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors"
                  >
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
                          <DropdownMenuItem onClick={() => handleDeleteElection(election.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Link to={`/admin/elecciones/${election.id}`} className="block">
                      <div className="flex items-start justify-between mb-4 pr-10">
                        <h3 className="font-bold text-lg">{election.nombre}</h3>
                        <Badge
                          className={
                            election.activa ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-muted text-muted-foreground'
                          }
                        >
                          {election.activa ? 'Activa' : 'Inactiva'}
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
                            <span className="font-medium">{election.categorias?.length ?? 0} categorías</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block text-xs">Duración</span>
                            <span className="font-medium">
                              {election.fechaInicio} al {election.fechaFin}
                            </span>
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

          {/* Cédula de Votación */}
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
                  {votingView === 'list' ? 'Selecciona una elección para ejercer tu voto' : `Votando en: ${selectedElection?.nombre}`}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Vista: lista de elecciones */}
                {votingView === 'list' && (
                  <div className="space-y-4">
                    {elections.filter((e) => e.activa).length > 0 ? (
                      elections
                        .filter((e) => e.activa)
                        .map((election) => {
                          const hasVoted = adminVotedElections.includes(election.id);
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
                                    <span className="font-medium">{election.categorias?.length ?? 0} categorías</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <span className="text-muted-foreground block text-xs">Fecha</span>
                                    <span className="font-medium">
                                      {election.fechaInicio} al {election.fechaFin}
                                    </span>
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

                {/* Vista: votación */}
                {votingView === 'voting' && selectedElection && (
                  <div>
                    <Button variant="outline" onClick={() => setVotingView('list')} className="mb-6">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver a Elecciones
                    </Button>

                    {adminVotedElections.includes(selectedElection.id) ? (
                      <VoteCompletedMessage />
                    ) : (
                      <VotingInterface
                        election={selectedElection}
                        onVoteSubmitted={() => {
                          setVotingView('list');
                          setAdminVotedElections((prev) => [...prev, selectedElection.id]);
                          // También podrías querer persistir esto en localStorage o actualizar user en contexto
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

      {/* Render del modal */}
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