import React, { useState, useEffect } from 'react';
import { stationsApi } from '@/services/adminApi';
import { Station, StationFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit2, Trash2, MapPin, Loader2 } from 'lucide-react';
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

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deleteStation, setDeleteStation] = useState<Station | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<StationFormData>({
    station_code: '',
    station_name: '',
    city: '',
    latitude: undefined,
    longitude: undefined,
  });

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const data = await stationsApi.getAll();
      setStations(data);
      setFilteredStations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch stations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []); // Run once on mount

  useEffect(() => {
    if (search) {
      const filtered = stations.filter(
        s =>
          s.station_name.toLowerCase().includes(search.toLowerCase()) ||
          s.station_code.toLowerCase().includes(search.toLowerCase()) ||
          s.city.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStations(filtered);
    } else {
      setFilteredStations(stations);
    }
  }, [search, stations]);

  const resetForm = () => {
    setFormData({
      station_code: '',
      station_name: '',
      city: '',
      latitude: undefined,
      longitude: undefined,
    });
    setEditingStation(null);
  };

  const openEditDialog = (station: Station) => {
    setEditingStation(station);
    setFormData({
      station_code: station.station_code,
      station_name: station.station_name,
      city: station.city,
      latitude: station.latitude,
      longitude: station.longitude,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStation) {
        await stationsApi.update(editingStation.station_id, formData);
        toast({ title: 'Success', description: 'Station updated successfully' });
      } else {
        await stationsApi.create(formData);
        toast({ title: 'Success', description: 'Station created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchStations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save station',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteStation) return;
    try {
      await stationsApi.delete(deleteStation.station_id);
      toast({ title: 'Success', description: 'Station deleted successfully' });
      setDeleteStation(null);
      fetchStations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete station',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Railway Stations</h2>
          <p className="text-muted-foreground mt-1">Manage all stations in the network</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <button className="btn-gradient flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Station
            </button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-md bg-black/80">
            <DialogHeader>
              <DialogTitle className="gradient-text text-xl">
                {editingStation ? 'Edit Station' : 'Add New Station'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Station Code</label>
                  <input
                    type="text"
                    value={formData.station_code}
                    onChange={(e) => setFormData({ ...formData, station_code: e.target.value.toUpperCase() })}
                    placeholder="e.g., CEN"
                    className="input-glass"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Mumbai"
                    className="input-glass"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Station Name</label>
                <input
                  type="text"
                  value={formData.station_name}
                  onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                  placeholder="e.g., Central Station"
                  className="input-glass"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || undefined })}
                    placeholder="e.g., 18.9402"
                    className="input-glass"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || undefined })}
                    placeholder="e.g., 72.8351"
                    className="input-glass"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsDialogOpen(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-gradient">
                  {editingStation ? 'Update' : 'Create'}
                </button>
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
            placeholder="Search by station name, code, or city..."
            className="input-glass pl-12 bg-black/20"
          />
        </div>
      </div>

      {/* Stations Table */}
      <div className="glass-card overflow-hidden rounded-xl border border-white/5 bg-card/30">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <MapPin className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No stations found</p>
            <p className="text-sm">Add your first station to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr className="bg-white/5">
                  <th>Code</th>
                  <th>Station Name</th>
                  <th>City</th>
                  <th>Coordinates</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStations.map((station) => (
                  <tr key={station.station_id} className="group">
                    <td>
                      <span className="badge-primary font-mono tracking-wider">{station.station_code}</span>
                    </td>
                    <td className="font-medium text-foreground">{station.station_name}</td>
                    <td className="text-muted-foreground">{station.city}</td>
                    <td className="text-muted-foreground/60 text-sm font-mono">
                      {station.latitude && station.longitude
                        ? `${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}`
                        : '—'}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditDialog(station)}
                          className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                          title="Edit Station"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteStation(station)}
                          className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                          title="Delete Station"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteStation} onOpenChange={() => setDeleteStation(null)}>
        <AlertDialogContent className="glass-card border-white/10 bg-black/90">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Station</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-white">{deleteStation?.station_name}</span>? This action cannot be undone.
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
