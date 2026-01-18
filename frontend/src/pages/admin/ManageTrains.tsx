/*
 * Copyright (c) 2026 Thilak S. All Rights Reserved.
 *
 * This source code, inclusive of the logic, design, and intellectual property,
 * is the sole property of Thilak S.
 *
 * Created by Thilak S.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Train, Loader2, X, GripVertical } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { trainApi, stationApi, adminApi } from '@/lib/api';
import { Train as TrainType, Station } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RouteStop {
  id: string; // Added for DnD stability
  stationId: number;
  arrivalTime: string;
  departureTime: string;
  distanceFromStartKm?: number;
}

// Sortable Item Component
const SortableRouteItem = ({
  id,
  stop,
  index,
  stations,
  handleStopChange,
  handleRemoveStop
}: {
  id: string,
  stop: RouteStop,
  index: number,
  stations: Station[],
  handleStopChange: (id: string, field: keyof RouteStop, value: string | number) => void,
  handleRemoveStop: (id: string) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group">
      <div {...attributes} {...listeners} className="cursor-grab touch-none p-1 hover:bg-muted/50 rounded">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select
          value={stop.stationId.toString()}
          onValueChange={(v) => handleStopChange(id, 'stationId', parseInt(v))}
        >
          <SelectTrigger className="bg-muted/50">
            <SelectValue placeholder="Select Station" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {stations.map((station) => (
              <SelectItem key={station.stationId} value={station.stationId.toString()}>
                {station.stationName} ({station.stationCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="time"
          value={stop.arrivalTime}
          onChange={(e) => handleStopChange(id, 'arrivalTime', e.target.value)}
          placeholder="Arrival"
          className="bg-muted/50 dark:[color-scheme:dark]"
        />
        <Input
          type="time"
          value={stop.departureTime}
          onChange={(e) => handleStopChange(id, 'departureTime', e.target.value)}
          placeholder="Departure"
          className="bg-muted/50 dark:[color-scheme:dark]"
        />
        <div className="relative">
          <Input
            type="number"
            value={stop.distanceFromStartKm || ''}
            readOnly
            placeholder="Auto Calc"
            className="bg-muted/30 text-muted-foreground pr-8 cursor-not-allowed"
            title="Distance is automatically calculated based on station coordinates"
          />
          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">km</span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => handleRemoveStop(id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

interface EditTrainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSave: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const EditTrainDialog = ({ isOpen, onClose, formData, setFormData, onSave, isLoading }: EditTrainDialogProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border p-6 rounded-lg w-full max-w-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Train</h2>
        <form onSubmit={onSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-trainNumber">Train Number</Label>
              <Input
                id="edit-trainNumber"
                value={formData.trainNumber}
                onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                required
                className="bg-muted/50"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-trainName">Train Name</Label>
              <Input
                id="edit-trainName"
                value={formData.trainName}
                onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
                required
                className="bg-muted/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-coaches">Coaches</Label>
              <Input
                id="edit-coaches"
                type="number"
                value={formData.numberOfCoaches}
                onChange={(e) => setFormData({ ...formData, numberOfCoaches: e.target.value })}
                required
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-seats">Seats/Coach</Label>
              <Input
                id="edit-seats"
                type="number"
                value={formData.totalSeatsPerCoach}
                onChange={(e) => setFormData({ ...formData, totalSeatsPerCoach: e.target.value })}
                required
                className="bg-muted/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price">Base Price</Label>
            <Input
              id="edit-price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="bg-muted/50"
            />
          </div>
          <Button type="submit" variant="hero" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </div >
    </div >
  );
};

const ManageTrains = () => {
  const { toast } = useToast();
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    // Fetch stations for the dropdown
    stationApi.getAll().then(res => setStations(res.data)).catch(console.error);

    // Fetch trains
    adminApi.getTrains().then(res => setTrains(res.data)).catch(console.error);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrains = trains.filter(train =>
    train.trainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.trainNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    trainNumber: '',
    trainName: '',
    totalSeatsPerCoach: '40',
    numberOfCoaches: '3',
    price: '100',
  });
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddStop = () => {
    const newId = `stop-${Date.now()}`;
    setRouteStops([
      ...routeStops,
      { id: newId, stationId: 0, arrivalTime: '', departureTime: '' },
    ]);
  };

  const handleRemoveStop = (id: string) => {
    setRouteStops(routeStops.filter((stop) => stop.id !== id));
  };

  const handleStopChange = (id: string, field: keyof RouteStop, value: string | number) => {
    setRouteStops(routeStops.map(stop =>
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRouteStops((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create Train
      const trainPayload = {
        trainNumber: formData.trainNumber,
        trainName: formData.trainName,
        totalSeatsPerCoach: parseInt(formData.totalSeatsPerCoach),
        numberOfCoaches: parseInt(formData.numberOfCoaches),
        price: parseInt(formData.price),
      };

      const trainRes = await adminApi.createTrain(trainPayload);
      const newTrain = trainRes.data;

      // 2. Add Schedules (if any)
      if (routeStops.length > 0) {
        // Sequentially add schedules to ensure order
        for (let i = 0; i < routeStops.length; i++) {
          const stop = routeStops[i];
          const schedulePayload = {
            station: { stationId: stop.stationId },
            arrivalTime: stop.arrivalTime + ":00",
            departureTime: stop.departureTime + ":00",
            platformNumber: "1",
            stopSequence: i + 1, // Correct sequence based on current order
            distanceFromStartKm: stop.distanceFromStartKm || 0 // Backend handles 0 calculation
          };
          await adminApi.addSchedule(newTrain.trainId, schedulePayload);
        }
      }

      setTrains([...trains, newTrain]);
      setFormData({ trainNumber: '', trainName: '', totalSeatsPerCoach: '40', numberOfCoaches: '3', price: '100' });
      setRouteStops([]);

      toast({
        title: 'Train Added',
        description: `${newTrain.trainName} has been added successfully with schedules.`,
      });
    } catch (error) {
      console.error("Failed to create train:", error);
      toast({
        title: 'Error',
        description: 'Failed to create train. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!confirm("Are you sure?")) return;
      await adminApi.deleteTrain(id);
      setTrains(trains.filter(t => t.trainId !== id));
      toast({
        title: 'Train Deleted',
        description: 'The train has been removed.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error("Failed to delete train", error);
      toast({
        title: "Error",
        description: "Failed to delete train",
        variant: "destructive"
      });
    }
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState<TrainType | null>(null);

  const handleEditClick = (train: TrainType) => {
    setEditingTrain(train);
    setFormData({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      totalSeatsPerCoach: train.totalSeatsPerCoach.toString(),
      numberOfCoaches: train.numberOfCoaches.toString(),
      price: train.price ? train.price.toString() : '100',
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrain) return;
    setIsLoading(true);

    try {
      const payload = {
        trainId: editingTrain.trainId,
        trainNumber: formData.trainNumber,
        trainName: formData.trainName,
        totalSeatsPerCoach: parseInt(formData.totalSeatsPerCoach),
        numberOfCoaches: parseInt(formData.numberOfCoaches),
        price: parseInt(formData.price),
      };

      await adminApi.updateTrain(payload.trainId, payload);

      toast({
        title: 'Train Updated',
        description: `${formData.trainName} has been updated successfully.`,
      });

      setIsEditOpen(false);
      setEditingTrain(null);
      setFormData({ trainNumber: '', trainName: '', totalSeatsPerCoach: '40', numberOfCoaches: '3', price: '100' });
      // Refresh trains
      const res = await adminApi.getTrains();
      setTrains(res.data);
    } catch (error) {
      console.error('Failed to update train:', error);
      toast({
        title: 'Error',
        description: 'Failed to update train.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Edit Modal */}
        <EditTrainDialog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingTrain(null);
            setFormData({ trainNumber: '', trainName: '', totalSeatsPerCoach: '40', numberOfCoaches: '3', price: '100' });
          }}
          formData={formData}
          setFormData={setFormData}
          onSave={handleUpdate}
          isLoading={isLoading}
        />

        {/* Add Train Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold">Add New Train</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainNumber">Train Number</Label>
                <Input
                  id="trainNumber"
                  value={formData.trainNumber}
                  onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                  placeholder="e.g., 12301"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainName">Train Name</Label>
                <Input
                  id="trainName"
                  value={formData.trainName}
                  onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
                  placeholder="e.g., Express Special"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Base Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="100"
                  required
                  className="bg-muted/50"
                />
              </div>
            </div>

            {/* Route Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Route Builder</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddStop}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stop
                </Button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={routeStops.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {routeStops.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground">No stops added yet. Click "Add Stop" to build the route.</p>
                      </div>
                    ) : (
                      routeStops.map((stop, index) => (
                        <SortableRouteItem
                          key={stop.id}
                          id={stop.id}
                          stop={stop}
                          index={index}
                          stations={stations}
                          handleStopChange={handleStopChange}
                          handleRemoveStop={handleRemoveStop}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <Button type="submit" variant="hero" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Train
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Trains List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Existing Trains ({trains.length})</h2>
            <div className="relative w-64">
              <Input
                placeholder="Search trains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted/50 pl-8"
              />
              <div className="absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Total Seats</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrains.map((train) => (
                  <TableRow key={train.trainId} className="border-border">
                    <TableCell className="font-mono font-bold text-primary">#{train.trainNumber}</TableCell>
                    <TableCell className="font-medium">{train.trainName}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{Number(train.totalSeatsPerCoach) * Number(train.numberOfCoaches)}</span>
                      <span className="text-muted-foreground text-xs ml-1">({train.numberOfCoaches}x{train.totalSeatsPerCoach})</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₹{train.price || 100}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(train)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(train.trainId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ManageTrains;
