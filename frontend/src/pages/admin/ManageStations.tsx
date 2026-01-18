/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin, Loader2, X } from 'lucide-react';
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

interface EditStationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  onSave: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const EditStationDialog = ({ isOpen, onClose, formData, setFormData, onSave, isLoading }: EditStationDialogProps) => {
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
        <h2 className="text-xl font-bold mb-4">Edit Station</h2>
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-stationName">Station Name</Label>
            <Input id="edit-stationName" value={formData.stationName} onChange={(e) => setFormData({ ...formData, stationName: e.target.value })} required className="bg-muted/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stationCode">Code</Label>
              <Input id="edit-stationCode" value={formData.stationCode} onChange={(e) => setFormData({ ...formData, stationCode: e.target.value })} required className="bg-muted/50 uppercase" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input id="edit-city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required className="bg-muted/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lat">Latitude</Label>
              <Input id="edit-lat" type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} required className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-long">Longitude</Label>
              <Input id="edit-long" type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} required className="bg-muted/50" />
            </div>
          </div>
          <Button type="submit" variant="hero" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  )
};

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



  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  // Dialog Component for Edit - Moved outside/before usage


  const handleEditClick = (station: Station) => {
    setEditingStation(station);
    setFormData({
      stationName: station.stationName,
      stationCode: station.stationCode,
      city: station.city,
      latitude: station.latitude?.toString() || '',
      longitude: station.longitude?.toString() || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation) return;
    setIsLoading(true);

    try {
      const payload = {
        stationId: editingStation.stationId,
        stationName: formData.stationName,
        stationCode: formData.stationCode.toUpperCase(),
        city: formData.city,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      await adminApi.updateStation(payload.stationId, payload);

      toast({
        title: 'Station Updated',
        description: `${formData.stationName} has been updated successfully.`,
      });

      setIsEditOpen(false);
      setEditingStation(null);
      setFormData({ stationName: '', stationCode: '', city: '', latitude: '', longitude: '' });
      fetchStations();
    } catch (error) {
      console.error('Failed to update station:', error);
      toast({
        title: 'Error',
        description: 'Failed to update station.',
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
        <EditStationDialog
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setEditingStation(null); setFormData({ stationName: '', stationCode: '', city: '', latitude: '', longitude: '' }); }}
          formData={formData}
          setFormData={setFormData}
          onSave={handleUpdate}
          isLoading={isLoading}
        />

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
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(station)}>
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
