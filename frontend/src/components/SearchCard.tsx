/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Search, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { stationApi } from '@/lib/api';
import { Station } from '@/types';

const SearchCard = () => {
  const navigate = useNavigate();
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [date, setDate] = useState<Date>();
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    stationApi.getAll().then(res => setStations(res.data)).catch(console.error);
  }, []);

  const handleSearch = () => {
    if (fromStation && toStation && date) {
      const params = new URLSearchParams({
        from: fromStation,
        to: toStation,
        date: format(date, 'yyyy-MM-dd'),
      });
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6 md:p-8 max-w-4xl w-full mx-4"
    >
      <h2 className="font-display text-2xl font-bold mb-6 text-center gradient-text">
        Find Your Journey
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* From Station */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            From
          </label>
          <Select value={fromStation} onValueChange={setFromStation}>
            <SelectTrigger className="h-12 bg-muted/50 border-border">
              <SelectValue placeholder="Select departure" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {stations.map((station) => (
                <SelectItem key={station.stationId} value={station.stationCode}>
                  {station.stationName} ({station.stationCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To Station */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            To
          </label>
          <Select value={toStation} onValueChange={setToStation}>
            <SelectTrigger className="h-12 bg-muted/50 border-border">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {stations.filter(s => s.stationCode !== fromStation).map((station) => (
                <SelectItem key={station.stationId} value={station.stationCode}>
                  {station.stationName} ({station.stationCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Journey Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal bg-muted/50 border-border",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
              <CalendarUI
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        variant="hero"
        size="xl"
        className="w-full"
        onClick={handleSearch}
        disabled={!fromStation || !toStation || !date}
      >
        <Search className="w-5 h-5" />
        Search Trains
        <ArrowRight className="w-5 h-5" />
      </Button>
    </motion.div>
  );
};

export default SearchCard;
