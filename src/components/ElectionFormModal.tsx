import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Election, ElectionCategory } from '@/types'; // Importa tus tipos

interface ElectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (election: Election) => void;
  electionToEdit?: Election | null; // Opcional, para editar
}

const ElectionFormModal: React.FC<ElectionFormModalProps> = ({ isOpen, onClose, onSave, electionToEdit }) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'Presidencial' | 'Municipal' | 'Regional' | 'Otros'>('Presidencial');
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);
  const [permiteVotoNulo, setPermiteVotoNulo] = useState(false);
  const [permiteVotoIncompleto, setPermiteVotoIncompleto] = useState(false);
  const [categorias, setCategorias] = useState<ElectionCategory[]>([]);

  useEffect(() => {
    if (electionToEdit && isOpen) {
      // Cargar datos de la elección si estamos editando
      setNombre(electionToEdit.nombre);
      setTipo(electionToEdit.tipo);
      setFechaInicio(new Date(electionToEdit.fechaInicio));
      setFechaFin(new Date(electionToEdit.fechaFin));
      setPermiteVotoNulo(electionToEdit.permiteVotoNulo);
      setPermiteVotoIncompleto(electionToEdit.permiteVotoIncompleto);
      setCategorias(electionToEdit.categorias);
    } else {
      // Resetear formulario si es una nueva elección
      setNombre('');
      setTipo('Presidencial');
      setFechaInicio(undefined);
      setFechaFin(undefined);
      setPermiteVotoNulo(false);
      setPermiteVotoIncompleto(false);
      setCategorias([]); // Vaciar categorías para nueva elección
    }
  }, [electionToEdit, isOpen]); // Resetear cuando se abre o cambia la elección a editar

  const handleAddCategory = () => {
    setCategorias([...categorias, { id: `cat-${Date.now()}`, nombre: '', candidatos: [] }]);
  };

  const handleRemoveCategory = (id: string) => {
    setCategorias(categorias.filter(cat => cat.id !== id));
  };

  const handleCategoryNameChange = (id: string, newName: string) => {
    setCategorias(categorias.map(cat => (cat.id === id ? { ...cat, nombre: newName } : cat)));
  };

  const handleSubmit = () => {
    // Aquí puedes añadir una validación más robusta (ej. con Zod) si quieres
    if (!nombre || !fechaInicio || !fechaFin || categorias.length === 0 || categorias.some(c => !c.nombre)) {
      alert("Faltan campos obligatorios o nombres en las categorías.");
      return;
    }

    const newElection: Election = {
      id: electionToEdit?.id || `elec-${Date.now()}`, // Usar ID existente si edita, sino nuevo
      nombre,
      tipo,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      permiteVotoNulo,
      permiteVotoIncompleto,
      categorias,
      estado: 'activa', // Por defecto
    };
    onSave(newElection);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Aumentado el ancho del modal para que el layout de 2 columnas funcione bien */}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{electionToEdit ? 'Editar Elección' : 'Crear Nueva Elección'}</DialogTitle>
          <DialogDescription>
            {electionToEdit ? 'Modifica los detalles de la elección.' : 'Define los parámetros para una nueva elección.'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Usar 'space-y-6' para separar las secciones */}
        <div className="grid gap-6 py-4">
          
          {/* SECCIÓN 1: Detalles Básicos (Grid de 2 columnas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Columna 1 */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Columna 2 */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(value) => setTipo(value as any)}>
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presidencial">Presidencial</SelectItem>
                  <SelectItem value="Municipal">Municipal</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Columna 1 */}
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="fechaInicio"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaInicio ? format(fechaInicio, "PPP") : <span>Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaInicio}
                    onSelect={setFechaInicio}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Columna 2 */}
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="fechaFin"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaFin && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaFin ? format(fechaFin, "PPP") : <span>Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaFin}
                    onSelect={setFechaFin}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* SECCIÓN 2: Opciones (Checkboxes) */}
          <div className="space-y-2">
            <Label>Opciones</Label>
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 p-4 border rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="votoNulo"
                  checked={permiteVotoNulo}
                  onCheckedChange={(checked) => setPermiteVotoNulo(checked as boolean)}
                />
                <label
                  htmlFor="votoNulo"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ¿Se permite voto nulo?
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="votoIncompleto"
                  checked={permiteVotoIncompleto}
                  onCheckedChange={(checked) => setPermiteVotoIncompleto(checked as boolean)}
                />
                <label
                  htmlFor="votoIncompleto"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ¿Permitir enviar votación incompleta?
                </label>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Gestión de Categorías */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Categorías de Elección</Label>
            <div className="space-y-2 mt-2">
              {categorias.map((cat, index) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground pt-2">#{index + 1}</Label>
                  <Input
                    placeholder="Ej: Presidente, Alcalde..."
                    value={cat.nombre}
                    onChange={(e) => handleCategoryNameChange(cat.id, e.target.value)}
                    className="flex-grow bg-background"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveCategory(cat.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={handleAddCategory}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Categoría
            </Button>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>
            {electionToEdit ? 'Guardar Cambios' : 'Crear Elección'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ElectionFormModal;