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
import { format, addDays } from 'date-fns';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminApi, seatApi } from '@/lib/api';
import SeatSelector from '@/components/SeatSelector';
import { Train } from '@/types';

interface AdminSeatManagementProps {
    isOpen: boolean;
    onClose: () => void;
    train: Train | null;
}

const AdminSeatManagement = ({ isOpen, onClose, train }: AdminSeatManagementProps) => {
    const { toast } = useToast();
    const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd')); // Default tomorrow
    const [coach, setCoach] = useState('S1');
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loadingAction, setLoadingAction] = useState(false);

    // SeatSelector manages state internally or via props.
    // We assume backend handles blocking logic based on selected seats. 

    const handleSeatToggle = (seatNum: number) => {
        setSelectedSeats(prev =>
            prev.includes(seatNum) ? prev.filter(s => s !== seatNum) : [...prev, seatNum]
        );
    };

    const handleBlock = async () => {
        if (!train) return;
        setLoadingAction(true);
        try {
            const payload = {
                userId: 1, // Admin User ID (Mock or use context)
                trainId: train.trainId,
                journeyDate: date,
                sourceStationId: 1, // Start of route (mock) - ideally fetch route start
                destStationId: 100, // End of route (mock)
                // Ideally, we should fetch the train schedule to get the correct start/end station IDs.
                // For this demo, we are using simplified logic.
                // Improvement: Fetch train schedule to get first and last station IDs.
                coachType: coach,
                selectedSeats: selectedSeats
            };

            const trainDetails = await adminApi.getTrains().then(res => res.data.find((t: Train) => t.trainId === train.trainId));

            if (!trainDetails) {
                toast({
                    title: "Error",
                    description: "Train details not found.",
                    variant: "destructive"
                });
                return;
            }

            // Note: For a real production app, ensure sourceStationId and destStationId are correctly derived from the schedule.


        } catch (e) {
            console.error(e);
            toast({ title: "Failed", variant: "destructive" });
        } finally {
            setLoadingAction(false);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Seats - {train?.trainName} ({train?.trainNumber})</DialogTitle>
                </DialogHeader>

                <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-2">
                        <Label>Journey Date</Label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="space-y-2 w-32">
                        <Label>Coach</Label>
                        <Select value={coach} onValueChange={setCoach}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['S1', 'S2', 'S3', 'B1', 'A1'].map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="border rounded-md p-4 min-h-[400px]">
                    {train && (
                        <SeatSelector
                            isAdmin={true}
                            key={`${train.trainId}-${date}-${coach}-${refreshTrigger}`}
                            trainId={train.trainId}
                            coach={coach}
                            date={date}
                            selectedSeats={selectedSeats}
                            onSeatToggle={handleSeatToggle}
                        />
                    )}
                </div>

                <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                        {selectedSeats.length} seats selected
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            disabled={selectedSeats.length === 0 || loadingAction}
                            onClick={() => handleAction('block')}
                        >
                            {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                            Block Selected
                        </Button>
                        <Button
                            variant="outline"
                            disabled={selectedSeats.length === 0 || loadingAction}
                            onClick={() => handleAction('unblock')}
                        >
                            {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            Unblock Selected
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    async function handleAction(action: 'block' | 'unblock') {
        if (!train) return;
        setLoadingAction(true);
        try {
            if (action === 'block') {
                // For this demo, we assume the backend or a future implementation handles 
                // finding the correct route segment if generic IDs are passed.

                await adminApi.blockSeats({
                    userId: 1,
                    trainId: train.trainId,
                    journeyDate: date,
                    // Pass generic/dummy or let backend handle keys
                    sourceStationId: 0,
                    destStationId: 0,
                    coachType: coach,
                    selectedSeats: selectedSeats
                });
                toast({ title: "Blocked", description: "Seats blocked successfully" });
            } else {
                await adminApi.unblockSeats({
                    trainId: train.trainId,
                    journeyDate: date,
                    coachType: coach,
                    seatNumbers: selectedSeats
                });
                toast({ title: "Unblocked", description: "Seats unblocked successfully" });
            }
            setSelectedSeats([]);
            setRefreshTrigger(prev => prev + 1);
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Action failed", variant: "destructive" });
        } finally {
            setLoadingAction(false);
        }
    }
};

export default AdminSeatManagement;
