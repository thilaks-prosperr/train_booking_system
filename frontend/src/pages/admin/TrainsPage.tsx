import React, { useState, useEffect } from 'react';
import { trainsApi, stationsApi } from '@/services/adminApi';
import { Train, TrainFormData, TrainSchedule, ScheduleFormData, Station } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit2, Trash2, Train as TrainIcon, Loader2, Clock, ChevronRight, X, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TrainsPage() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | null>(null);
  const [deleteTrain, setDeleteTrain] = useState<Train | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [schedule, setSchedule] = useState<TrainSchedule[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TrainFormData>({
    train_number: '',
    train_name: '',
    total_seats_per_coach: 72,
  });
  const [scheduleData, setScheduleData] = useState<ScheduleFormData[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [trainsData, stationsData] = await Promise.all([
        trainsApi.getAll(),
        stationsApi.getAll(),
      ]);
      setTrains(trainsData);
      setFilteredTrains(trainsData);
      setStations(stationsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = trains.filter(
        t =>
          t.train_name.toLowerCase().includes(search.toLowerCase()) ||
          t.train_number.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredTrains(filtered);
    } else {
      setFilteredTrains(trains);
    }
  }, [search, trains]);

  const fetchSchedule = async (train: Train) => {
    setSelectedTrain(train);
    setIsScheduleLoading(true);
    try {
      const data = await trainsApi.getSchedule(train.train_id);
      setSchedule(data.sort((a, b) => a.stop_sequence - b.stop_sequence));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch schedule',
        variant: 'destructive',
      });
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      train_number: '',
      train_name: '',
      total_seats_per_coach: 72,
    });
    setScheduleData([]);
    setEditingTrain(null);
    setStep(1);
  };

  const openEditDialog = (train: Train) => {
    setEditingTrain(train);
    setFormData({
      train_number: train.train_number,
      train_name: train.train_name,
      total_seats_per_coach: train.total_seats_per_coach,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrain) {
        await trainsApi.update(editingTrain.train_id, formData);
        toast({ title: 'Success', description: 'Train updated successfully' });
      } else {
        const newTrain = await trainsApi.create(formData);
        // Add schedule stops if any
        for (const stop of scheduleData) {
          await trainsApi.addSchedule(newTrain.train_id, stop);
        }
        toast({ title: 'Success', description: 'Train created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save train',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTrain) return;
    try {
      await trainsApi.delete(deleteTrain.train_id);
      toast({ title: 'Success', description: 'Train deleted successfully' });
      setDeleteTrain(null);
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete train',
        variant: 'destructive',
      });
    }
  };

  const addScheduleStop = () => {
    setScheduleData([
      ...scheduleData,
      {
        station_id: 0,
        arrival_time: '',
        departure_time: '',
        stop_sequence: scheduleData.length + 1,
        distance_from_start_km: 0,
      },
    ]);
  };

  const updateScheduleStop = (index: number, field: keyof ScheduleFormData, value: any) => {
    const updated = [...scheduleData];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleData(updated);
  };

  const removeScheduleStop = (index: number) => {
    setScheduleData(scheduleData.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Train Management</h2>
          <p className="text-muted-foreground mt-1">Configure trains and their schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <button className="btn-gradient flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Train
            </button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-lg max-h-[90vh] overflow-y-auto bg-black/80">
            <DialogHeader>
              <DialogTitle className="gradient-text text-xl">
                {editingTrain ? 'Edit Train' : 'Add New Train'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Step Indicator */}
              {!editingTrain && (
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/30 border border-white/10'}`}>1</div>
                    <span className="text-sm font-medium hidden sm:inline">Details</span>
                  </div>
                  <div className={`w-12 h-0.5 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`} />
                  <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/30 border border-white/10'}`}>2</div>
                    <span className="text-sm font-medium hidden sm:inline">Schedule</span>
                  </div>
                </div>
              )}

              {/* Step 1: Train Details */}
              {(step === 1 || editingTrain) && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Train Number</label>
                      <input
                        type="text"
                        value={formData.train_number}
                        onChange={(e) => setFormData({ ...formData, train_number: e.target.value })}
                        placeholder="e.g., 12951"
                        className="input-glass"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Seats/Coach</label>
                      <input
                        type="number"
                        value={formData.total_seats_per_coach}
                        onChange={(e) => setFormData({ ...formData, total_seats_per_coach: parseInt(e.target.value) })}
                        className="input-glass"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Train Name</label>
                    <input
                      type="text"
                      value={formData.train_name}
                      onChange={(e) => setFormData({ ...formData, train_name: e.target.value })}
                      placeholder="e.g., Mumbai Rajdhani"
                      className="input-glass"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Schedule */}
              {step === 2 && !editingTrain && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Route Schedule</h3>
                    <button
                      type="button"
                      onClick={addScheduleStop}
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Stop
                    </button>
                  </div>

                  {scheduleData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-white/10 rounded-xl bg-white/5">
                      <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No stops added yet</p>
                      <p className="text-sm">Click "Add Stop" to define the route</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {scheduleData.map((stop, index) => (
                        <div key={index} className="glass-card p-3 space-y-3 bg-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary">Stop {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeScheduleStop(index)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <Select
                            value={stop.station_id.toString()}
                            onValueChange={(val) => updateScheduleStop(index, 'station_id', parseInt(val))}
                          >
                            <SelectTrigger className="input-glass">
                              <SelectValue placeholder="Select station" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {stations.map((s) => (
                                <SelectItem key={s.station_id} value={s.station_id.toString()}>
                                  {s.station_code} - {s.station_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Arrival</label>
                              <input
                                type="time"
                                value={stop.arrival_time}
                                onChange={(e) => updateScheduleStop(index, 'arrival_time', e.target.value)}
                                className="input-glass text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Departure</label>
                              <input
                                type="time"
                                value={stop.departure_time}
                                onChange={(e) => updateScheduleStop(index, 'departure_time', e.target.value)}
                                className="input-glass text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Distance (km)</label>
                            <input
                              type="number"
                              value={stop.distance_from_start_km}
                              onChange={(e) => updateScheduleStop(index, 'distance_from_start_km', parseInt(e.target.value))}
                              className="input-glass text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {step === 2 && !editingTrain && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    Back
                  </button>
                )}
                {step === 1 && !editingTrain ? (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 btn-gradient"
                  >
                    Next: Schedule
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setIsDialogOpen(false); resetForm(); }}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 btn-gradient">
                      {editingTrain ? 'Update' : 'Create Train'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by train number or name..."
            className="input-glass pl-12 bg-black/20"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trains List */}
        <div className="glass-card overflow-hidden rounded-xl border border-white/5 bg-card/30">
          <div className="p-4 border-b border-border/10 bg-white/5">
            <h3 className="font-semibold text-foreground">All Trains</h3>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTrains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <TrainIcon className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No trains found</p>
              <p className="text-sm">Add your first train to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {filteredTrains.map((train) => (
                <div
                  key={train.train_id}
                  onClick={() => fetchSchedule(train)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${selectedTrain?.train_id === train.train_id
                    ? 'bg-primary/10 border-l-2 border-l-primary'
                    : 'hover:bg-white/5 border-l-2 border-l-transparent'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${selectedTrain?.train_id === train.train_id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-muted-foreground'}`}>
                      <TrainIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-medium ${selectedTrain?.train_id === train.train_id ? 'text-primary' : 'text-foreground'}`}>{train.train_name}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-xs">#{train.train_number}</span> • {train.total_seats_per_coach} seats
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditDialog(train); }}
                      className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTrain(train); }}
                      className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedTrain?.train_id === train.train_id ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Panel */}
        <div className="glass-card overflow-hidden rounded-xl border border-white/5 bg-card/30">
          <div className="p-4 border-b border-border/10 bg-white/5">
            <h3 className="font-semibold text-foreground">
              {selectedTrain ? (
                <span className="flex items-center gap-2">
                  <span className="text-primary">{selectedTrain.train_name}</span> Route
                </span>
              ) : 'Select a train to view schedule'}
            </h3>
          </div>
          {!selectedTrain ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground min-h-[400px]">
              <Clock className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">No train selected</p>
              <p className="text-sm">Click on a train to view its route</p>
            </div>
          ) : isScheduleLoading ? (
            <div className="flex items-center justify-center py-20 min-h-[400px]">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : schedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground min-h-[400px]">
              <MapPin className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">No schedule defined</p>
              <p className="text-sm">Add stops to define the route</p>
            </div>
          ) : (
            <div className="p-6 min-h-[400px]">
              <div className="relative pl-4">
                {/* Continuous Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-8 w-0.5 bg-border/30"></div>

                {schedule.map((stop, index) => (
                  <div key={stop.schedule_id} className="relative flex items-start gap-6 pb-8 last:pb-0 group">
                    {/* Timeline Node */}
                    <div className="relative z-10 flex flex-col items-center pt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-card transition-all duration-300 shadow-lg ${index === 0
                          ? 'bg-green-500 shadow-green-500/20'
                          : index === schedule.length - 1
                            ? 'bg-red-500 shadow-red-500/20'
                            : 'bg-primary shadow-primary/20'
                        }`}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Stop Info Card */}
                    <div className="flex-1 glass-card p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors relative">
                      {/* Connecting Line to Card */}
                      <div className="absolute left-[-24px] top-6 w-6 h-0.5 bg-border/30"></div>

                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-lg text-foreground">{stop.station?.station_name || 'Unknown Station'}</p>
                          <p className="text-sm font-mono text-primary/80 bg-primary/10 px-2 py-0.5 rounded inline-block mt-1">{stop.station?.station_code}</p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded-md border border-white/5">
                          {stop.distance_from_start_km} km
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 bg-black/20 p-2 rounded-lg">
                        <div className="text-center">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-0.5">Arrival</span>
                          <span className="font-mono text-green-400 font-medium">{stop.arrival_time?.substring(0, 5) || '—'}</span>
                        </div>
                        <div className="text-center border-l border-white/5">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-0.5">Departure</span>
                          <span className="font-mono text-blue-400 font-medium">{stop.departure_time?.substring(0, 5) || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTrain} onOpenChange={() => setDeleteTrain(null)}>
        <AlertDialogContent className="glass-card border-white/10 bg-black/90">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Train</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteTrain?.train_name}</span>? This will also remove all associated schedules and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
