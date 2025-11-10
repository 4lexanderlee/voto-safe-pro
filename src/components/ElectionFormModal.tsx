// src/components/ElectionFormModal.tsx

import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Election } from '@/types';

// Esquema de validación con Zod
const electionSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(5, 'El nombre debe tener al menos 5 caracteres'),
  tipo: z.enum(['Presidencial', 'Regional', 'Municipal', 'Otros']),
  fechaInicio: z.date({ required_error: 'La fecha de inicio es requerida' }),
  fechaFin: z.date({ required_error: 'La fecha de fin es requerida' }),
  allowNullVote: z.boolean().default(false),
  requireAllCategories: z.boolean().default(true),
  categorias: z.array(z.object({
    id: z.string().optional(),
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  })).min(1, 'Debe haber al menos una categoría'),
});

type ElectionFormData = z.infer<typeof electionSchema>;

interface ElectionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Election) => void;
  initialData?: Election | null;
}

export const ElectionFormModal = ({ open, onClose, onSubmit, initialData }: ElectionFormModalProps) => {
  const isEditMode = !!initialData;

  const form = useForm<ElectionFormData>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      nombre: '',
      tipo: 'Presidencial',
      allowNullVote: false,
      requireAllCategories: true,
      categorias: [{ nombre: '' }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'categorias',
  });

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        fechaInicio: new Date(initialData.fechaInicio),
        fechaFin: new Date(initialData.fechaFin),
        categorias: initialData.categorias.map(cat => ({ id: cat.id, nombre: cat.nombre })),
      });
    } else {
      form.reset({
        nombre: '',
        tipo: 'Presidencial',
        fechaInicio: undefined,
        fechaFin: undefined,
        allowNullVote: false,
        requireAllCategories: true,
        categorias: [{ nombre: '' }],
      });
    }
  }, [initialData, form, open]); // Depender de 'open' para resetear al abrir

  const handleFormSubmit = (data: ElectionFormData) => {
    const electionId = initialData?.id || `e${Date.now()}`;
    
    // Simular la creación de candidatos para cada categoría (en un futuro esto sería otro CRUD)
    const fullCategorias = data.categorias.map((cat, index) => ({
      id: cat.id || `cat${Date.now()}-${index}`,
      nombre: cat.nombre,
      candidatos: [], // En un futuro, aquí se añadirían candidatos
    }));

    const finalData: Election = {
      id: electionId,
      nombre: data.nombre,
      tipo: data.tipo,
      fechaInicio: format(data.fechaInicio, 'yyyy-MM-dd'),
      fechaFin: format(data.fechaFin, 'yyyy-MM-dd'),
      allowNullVote: data.allowNullVote,
      requireAllCategories: data.requireAllCategories,
      categorias: fullCategorias,
      activa: true, // Por defecto al crearla
    };

    onSubmit(finalData);
    onClose();
  }; // <--- ¡LA LLAVE DE CIERRE "};" DE handleFormSubmit VA AQUÍ!

  return ( // <--- El return estaba dentro de handleFormSubmit, ahora está fuera
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Elección' : 'Crear Nueva Elección'}</DialogTitle>
          <DialogDescription>
            Completa los detalles del nuevo proceso electoral.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <ScrollArea className="h-[60vh] p-1 pr-4">
              <div className="space-y-6 p-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Elección</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Elecciones Municipales 2026" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Presidencial">Presidencial</SelectItem>
                          <SelectItem value="Regional">Regional</SelectItem>
                          <SelectItem value="Municipal">Municipal</SelectItem>
                          <SelectItem value="Otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaInicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Inicio</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaFin"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Fin</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Preguntas Si/No */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="allowNullVote"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <FormLabel className="mb-0">¿Permitir Voto Nulo/En Blanco?</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requireAllCategories"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <FormLabel className="mb-0">¿Es obligatorio votar en todas las categorías?</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Categorías Dinámicas */}
                <div className="space-y-4">
                  <Label>Categorías de la Cédula</Label>
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`categorias.${index}.nombre`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input {...field} placeholder={`Nombre de Categoría ${index + 1}`} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ nombre: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Categoría
                  </Button>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-6 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditMode ? 'Guardar Cambios' : 'Crear Evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
// El "};" extra que tenías al final ya no está.