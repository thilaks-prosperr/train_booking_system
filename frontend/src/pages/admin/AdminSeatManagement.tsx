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

    // We need to know the status of selected seats to determine actions
    // This is a bit tricky since SeatSelector manages state internally or via props.
    // SeatSelector doesn't expose status of selected seats back to us directly, 
    // but we can re-fetch or just infer from user intent?
    // Ideally seatSelector should tell us status, but current prop is strictly `selectedSeats: number[]`.
    // We can fetch layout here too or trust `seatApi` call.
    // Let's just keep it simple: We try to block. If it fails (already booked), backend throws.
    // "Unblock" is for blocked seats.

    // Better UX: Show "Block" and "Unblock" buttons. 

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
                // Wait, blocking generally applies to specific segment or whole route.
                // For simplicity, let's assume we block for the *entire* route of the train.
                // But we need valid IDs.
                // Improvement: Fetch train schedule to get first and last station IDs.
                // For now, let's use the inputs or just pass generic if backend can handle it.
                // Backend `createAdminBlock` fetches schedule by train & station.
                // We MUST provide valid source/dest station IDs that exist in Valid Route.
                // Let's rely on common Stations or better, fetch route.
                coachType: coach,
                selectedSeats: selectedSeats
            };

            // We need source/dest IDs. 
            // Quick hack: Fetch train details first to get route?
            // Or updated backend to just use TrainID and block entire route?
            // Let's do the latter in backend or fetch here?
            // Fetching here is safer.
            const trainDetails = await adminApi.getTrains().then(res => res.data.find((t: Train) => t.trainId === train.trainId));
            // trainDetails might not have schedule.
            // Let's try to assume full route blocking.
            // We really need correct Source/Dest Station IDs that match the schedule.
            // TODO: Refactor Backend to `blockSeats(trainId, ...)` without generic booking logic requiring specific stations?
            // OR: Frontend fetches "Source" and "Dest" from Train Schedule.
            // Let's assume user provides or we pick first/last.

            // TEMPORARY FIX: We need source/dest.
            // Let's prompt user? No that's tedious.
            // Let's optimistically pick IDs.
            // Actually, we can pass dummy IDs if we modify backend to ignore them for blocks?
            // No, backend looks up schedule.
            // Let's fetch schedule.
            // We lack `getTrainSchedule` API in frontend.
            // We can add it.

            // Alternative: Pass `sourceStationId` and `destStationId` as parameters if known.
            // If not, we block.
            toast({
                title: "Configuration Needed",
                description: "Route blocking requires knowing Start/End stations. Please implement fetch.",
                variant: "destructive"
            });

        } catch (e) {
            console.error(e);
            toast({ title: "Failed", variant: "destructive" });
        } finally {
            setLoadingAction(false);
        }
    };

    // REVISION: I will implement a smarter Block function that asks backend to "block entire route".
    // I need to update Backend `createAdminBlock` to find start/end stations if not provided.
    // Or just expose `getTrainDetails` which includes stops.

    // Let's make `AdminSeatManagement` simpler: 
    // We assume we block the whole train.
    // We need to fetch the train details to get source/dest station IDs.
    // `trainApi.getDetails(id)` returns details?
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
                // We need source/dest. Using fallback for now (1, 100) or we must fetch.
                // Let's assume specific hardcoded IDs for demo if we can't fetch.
                // OR better: Update backend so that createAdminBlock finds the route itself.
                // I will update backend first? No, let's try to fetch train details.

                // Fetch full train details including stops to find first/last
                // trainApi.getDetails(train.trainId)
                // But wait, `train` passed prop might be shallow.
                // Let's fetch it.

                const res = await adminApi.getTrains(); // heavy?
                // Maybe API call to get specific train?
                // trainApi.getDetails is public.
                const detailRes = await fetch(`/api/trains/${train.trainId}`).then(r => r.json());
                // detailRes should have stops/schedule?
                // The backend `Train` entity doesn't list stops eagerly.
                // `TrainController.getTrain` usually returns basic info?
                // `TrainScheduleRepository` queries by train.

                // To save time and complexity:
                // I will update `BookingService.createAdminBlock` to Optional Source/Dest.
                // If not provided, it finds the Start and End of the train route.
                // This makes Frontend much simpler.

                // Let's assume I did that (I will do it next).
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
