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
        <div className="font-sans">
            {/* Hero Section */}
            <div
                className="h-screen w-screen bg-cover bg-center flex items-center justify-start pl-[10%] relative"
                style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url("/images/vande_barath.jpg")' }}
            >
                {/* Search Card */}
                <div className="bg-card/95 backdrop-blur-sm p-8 rounded-xl w-[400px] shadow-2xl z-10 border border-border/20">
                    <h2 className="text-2xl font-bold mb-6 text-card-foreground">Book Your Train Ticket</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="from" className="text-sm font-semibold text-muted-foreground">From Station</label>
                            <div className="relative">
                                <select
                                    id="from"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full p-3 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                >
                                    <option value="">Select Station</option>
                                    {stations.map((code) => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">↕</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="to" className="text-sm font-semibold text-muted-foreground">To Station</label>
                            <div className="relative">
                                <select
                                    id="to"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full p-3 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                >
                                    <option value="">Select Station</option>
                                    {stations.map((code) => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">↕</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="date" className="text-sm font-semibold text-muted-foreground">Departure Date</label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 rounded-md border border-input bg-background text-foreground cursor-pointer focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 py-4 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>🎫</span> Search Trains
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
