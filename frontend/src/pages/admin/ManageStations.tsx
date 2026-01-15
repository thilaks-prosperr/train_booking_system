import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { stationApi, adminApi } from '@/lib/api';
import { Station } from '@/types';

const ManageStations = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<Station[]>([]);

  const fetchStations = () => {
    stationApi.getAll()
      .then(res => setStations(res.data))
      .catch(err => console.error("Failed to fetch stations", err));
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stationName: '',
    stationCode: '',
    city: '',
    latitude: '',
    longitude: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        stationName: formData.stationName,
        stationCode: formData.stationCode.toUpperCase(),
        city: formData.city,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      await adminApi.createStation(payload);

      toast({
        title: 'Station Added',
        description: `${formData.stationName} has been added successfully.`,
      });

      setFormData({ stationName: '', stationCode: '', city: '', latitude: '', longitude: '' });
      fetchStations();
    } catch (error) {
      console.error('Failed to create station:', error);
      toast({
        title: 'Error',
        description: 'Failed to create station. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!confirm('Are you sure you want to delete this station?')) return;

      await adminApi.deleteStation(id);

      toast({
        title: 'Station Deleted',
        description: 'The station has been removed.',
        variant: 'destructive',
      });
      fetchStations();
    } catch (error) {
      console.error('Failed to delete station:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete station.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Add Station Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold">Add New Station</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stationName">Station Name</Label>
                <Input
                  id="stationName"
                  value={formData.stationName}
                  onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                  placeholder="e.g., Central Station"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stationCode">Station Code</Label>
                <Input
                  id="stationCode"
                  value={formData.stationCode}
                  onChange={(e) => setFormData({ ...formData, stationCode: e.target.value })}
                  placeholder="e.g., CEN"
                  maxLength={4}
                  className="bg-muted/50 uppercase"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Metro City"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 28.6139"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., 77.2090"
                  className="bg-muted/50"
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="hero" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Station
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Stations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-card"
        >
          <h2 className="font-display text-xl font-bold mb-6">Existing Stations ({stations.length})</h2>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map((station) => (
                  <TableRow key={station.stationId} className="border-border">
                    <TableCell className="font-mono font-bold text-primary">{station.stationCode}</TableCell>
                    <TableCell className="font-medium">{station.stationName}</TableCell>
                    <TableCell>{station.city}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(station.stationId)}
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

export default ManageStations;
