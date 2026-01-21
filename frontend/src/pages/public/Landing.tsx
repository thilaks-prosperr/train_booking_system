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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { stationApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { DatePicker } from '@/components/ui/date-picker';

interface Station {
    stationCode: string;
    stationName: string;
}

const Landing = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState<Date>();
    const [stations, setStations] = useState<Station[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        stationApi.getAll()
            .then(res => setStations(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (from && to && date) {
            navigate(`/search?from=${from}&to=${to}&date=${format(date, 'yyyy-MM-dd')}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
            <Navbar />

            {/* Animated Background */}
            <div className="animated-bg absolute inset-0 z-0 pointer-events-none"></div>

            <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 gap-12 lg:gap-24">
                {/* Hero Text */}
                <div className="flex-1 text-center lg:text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        Live Booking System
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.1]">
                        Travel with <br />
                        <span className="gradient-text">Future Speed</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Experience the next generation of railway booking. Seamless, fast, and designed for the modern traveler.
                    </p>
                </div>

                {/* Search Card */}
                <div className="flex-1 w-full max-w-md">
                    <div className="glass-card p-8 relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-1000"></div>

                        <h2 className="text-2xl font-bold mb-6 font-display">Start Your Journey</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Station</label>
                                <select
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full bg-background/50 border border-input rounded-md p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="">Select Station</option>
                                    {stations.map((s) => (
                                        <option key={s.stationCode} value={s.stationCode}>{s.stationName} ({s.stationCode})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Station</label>
                                <select
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full bg-background/50 border border-input rounded-md p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="">Select Station</option>
                                    {stations.map((s) => (
                                        <option key={s.stationCode} value={s.stationCode}>{s.stationName} ({s.stationCode})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                                <DatePicker
                                    date={date}
                                    setDate={setDate}
                                    className="w-full bg-background/50 border border-input rounded-md p-3 focus:ring-2 focus:ring-primary outline-none transition-all h-auto"
                                    placeholder="Select Journey Date"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-md shadow-lg hover:shadow-primary/25 transition-all transform hover:-translate-y-1"
                            >
                                Search Trains
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Landing;
