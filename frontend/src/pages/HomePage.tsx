import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Station {
    code: string;
    name: string;
}

function HomePage() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [stations, setStations] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get<Station[]>('/stations')
            .then(res => setStations(res.data.map(s => s.code)))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (from && to && date) {
            navigate(`/search?from=${from}&to=${to}&date=${date}`);
        } else {
            alert("Please fill in all fields");
        }
    };

    return (
        <div className="font-sans min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
            {/* Animated Background */}
            <div className="gradient-bg-animated absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1474487548417-781cb714c270?q=80&w=2938&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background"></div>
            </div>

            {/* Navbar (Placeholder for now, or just implicit) */}
            <nav className="relative z-50 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <span className="text-3xl">🚄</span>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        RailBook
                    </span>
                </div>
                <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                    <a href="#" className="hover:text-primary transition-colors">Home</a>
                    <a href="#" className="hover:text-primary transition-colors">Bookings</a>
                    <a href="#" className="hover:text-primary transition-colors">Support</a>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 gap-12 lg:gap-24">

                {/* Text Content */}
                <div className="flex-1 text-center lg:text-left space-y-6 animate-scale-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live Booking System
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                        Travel with <br />
                        <span className="gradient-text">Future Speed</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Experience the next generation of railway booking. Seamless, fast, and designed for the modern traveler. Book your journey across India in seconds.
                    </p>
                </div>

                {/* Search Card */}
                <div className="flex-1 w-full max-w-md">
                    <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                        {/* Glow Effect */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/30 rounded-full blur-3xl group-hover:bg-violet-500/40 transition-all duration-1000"></div>

                        <h2 className="text-2xl font-bold mb-6 text-white relative z-10">Start Your Journey</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-violet-200/70 uppercase tracking-wider">From Station</label>
                                <div className="relative group/input">
                                    <select
                                        value={from}
                                        onChange={(e) => setFrom(e.target.value)}
                                        className="input-glass appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900">Select Station</option>
                                        {stations.map((code) => (
                                            <option key={code} value={code} className="bg-slate-900">{code}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-violet-200/70 uppercase tracking-wider">To Station</label>
                                <div className="relative">
                                    <select
                                        value={to}
                                        onChange={(e) => setTo(e.target.value)}
                                        className="input-glass appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900">Select Station</option>
                                        {stations.map((code) => (
                                            <option key={code} value={code} className="bg-slate-900">{code}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-violet-200/70 uppercase tracking-wider">Departure Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="input-glass cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-4 btn-gradient font-bold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 relative overflow-hidden group/btn"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Search Trains
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HomePage;
