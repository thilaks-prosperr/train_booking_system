import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function AdminPortal() {
    const [activeTab, setActiveTab] = useState('trains');
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stations, setStations] = useState([]);

    // Forms State
    const [newTrain, setNewTrain] = useState({ name: '', number: '', capacity: 60 });
    const [selectedTrainId, setSelectedTrainId] = useState('');
    const [stops, setStops] = useState([
        { stationId: '', arrivalTime: '', departureTime: '', stopSequence: 1, distanceFromStartKm: 0 }
    ]);

    useEffect(() => {
        fetchTrains();
        fetchStations();
    }, []);

    const fetchTrains = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/trains`);
            setTrains(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/stations`);
            setStations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTrain = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/admin/trains`, {
                trainName: newTrain.name,
                trainNumber: newTrain.number,
                totalSeatsPerCoach: newTrain.capacity
            });
            alert('Train created successfully!');
            setNewTrain({ name: '', number: '', capacity: 60 });
            fetchTrains();
        } catch (err) {
            alert('Failed to create train');
        }
    };

    const handleAddStopRow = () => {
        setStops([...stops, {
            stationId: '',
            arrivalTime: '',
            departureTime: '',
            stopSequence: stops.length + 1,
            distanceFromStartKm: 0
        }]);
    };

    const handleStopChange = (index, field, value) => {
        const newStops = [...stops];
        newStops[index][field] = value;
        setStops(newStops);
    };

    const handleSaveSchedule = async () => {
        if (!selectedTrainId) {
            alert("Please select a train");
            return;
        }

        try {
            // Send each stop as a separate POST (as per requirement "POST /schedules: Add a Stop")
            // Or ideally bulk, but let's follow the requirement likely implying individual adds or the controller accepts one.
            // The controller accepts ONE TrainSchedule object per POST.
            // verifying controller: saveSchedule(@RequestBody TrainSchedule schedule)

            for (const stop of stops) {
                if (!stop.stationId) continue;

                await axios.post(`${API_BASE_URL}/api/admin/schedules`, {
                    train: { trainId: parseInt(selectedTrainId) },
                    station: { stationId: parseInt(stop.stationId) },
                    arrivalTime: stop.arrivalTime + ":00", // Append seconds for LocalTime
                    departureTime: stop.departureTime + ":00",
                    stopSequence: parseInt(stop.stopSequence),
                    distanceFromStartKm: parseInt(stop.distanceFromStartKm)
                });
            }
            alert("Schedule saved successfully!");
            setStops([{ stationId: '', arrivalTime: '', departureTime: '', stopSequence: 1, distanceFromStartKm: 0 }]);
        } catch (err) {
            console.error(err);
            alert("Failed to save some schedules. Check console.");
        }
    };

    // ... (Keep existing handleClearSeats)
    const handleClearSeats = async () => {
        if (confirm("Are you sure you want to clear ALL booked seats?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/admin/seats`);
                alert("Seats cleared!");
            } catch (err) {
                alert("Failed to clear seats");
            }
        }
    };

    return (
        <div className="container" style={{ display: 'flex', gap: '2rem', maxWidth: '1200px', marginTop: '2rem' }}>
            {/* Sidebar */}
            <div className="sidebar" style={{ width: '250px', borderRight: '1px solid #ddd', minHeight: '80vh' }}>
                <h3>Admin Portal</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li
                        style={{ padding: '0.75rem', cursor: 'pointer', background: activeTab === 'trains' ? '#e9ecef' : 'transparent', borderRadius: '4px' }}
                        onClick={() => setActiveTab('trains')}
                    >
                        Manage Trains
                    </li>
                    <li
                        style={{ padding: '0.75rem', cursor: 'pointer', background: activeTab === 'routes' ? '#e9ecef' : 'transparent', borderRadius: '4px' }}
                        onClick={() => setActiveTab('routes')}
                    >
                        Route Builder
                    </li>
                    <li
                        style={{ padding: '0.75rem', cursor: 'pointer', background: activeTab === 'stats' ? '#e9ecef' : 'transparent', borderRadius: '4px' }}
                        onClick={() => setActiveTab('stats')}
                    >
                        Stats
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div className="content" style={{ flex: 1 }}>

                {activeTab === 'trains' && (
                    <div>
                        <h2>Add New Train</h2>
                        <form onSubmit={handleCreateTrain} style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label>Train Name</label>
                                <input type="text" className="form-control" value={newTrain.name} onChange={e => setNewTrain({ ...newTrain, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Train Number</label>
                                <input type="text" className="form-control" value={newTrain.number} onChange={e => setNewTrain({ ...newTrain, number: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Capacity (Seats per Coach)</label>
                                <input type="number" className="form-control" value={newTrain.capacity} onChange={e => setNewTrain({ ...newTrain, capacity: e.target.value })} required />
                            </div>
                            <button type="submit" className="btn btn-primary">Create Train</button>
                        </form>

                        <h3>Existing Trains</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem' }}>Name</th>
                                    <th style={{ padding: '0.75rem' }}>Number</th>
                                    <th style={{ padding: '0.75rem' }}>Capacity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trains.map(t => (
                                    <tr key={t.trainId} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '0.75rem' }}>{t.trainName}</td>
                                        <td style={{ padding: '0.75rem' }}>{t.trainNumber}</td>
                                        <td style={{ padding: '0.75rem' }}>{t.totalSeatsPerCoach}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn btn-danger" onClick={handleClearSeats} style={{ marginTop: '2rem' }}>Clear All Seats</button>
                    </div>
                )}

                {activeTab === 'routes' && (
                    <div>
                        <h2>Route Builder</h2>
                        <div className="form-group">
                            <label>Select Train</label>
                            <select className="form-control" value={selectedTrainId} onChange={e => setSelectedTrainId(e.target.value)}>
                                <option value="">-- Select Train --</option>
                                {trains.map(t => (
                                    <option key={t.trainId} value={t.trainId}>{t.trainName} ({t.trainNumber})</option>
                                ))}
                            </select>
                        </div>

                        <h3>Stops Configuration</h3>
                        {stops.map((stop, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'end', marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Station</label>
                                    <select className="form-control" value={stop.stationId} onChange={e => handleStopChange(index, 'stationId', e.target.value)}>
                                        <option value="">Select Station</option>
                                        {stations.map(s => (
                                            <option key={s.stationId} value={s.stationId}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ width: '150px' }}>
                                    <label>Arrival</label>
                                    <input type="time" className="form-control" value={stop.arrivalTime} onChange={e => handleStopChange(index, 'arrivalTime', e.target.value)} />
                                </div>
                                <div style={{ width: '150px' }}>
                                    <label>Departure</label>
                                    <input type="time" className="form-control" value={stop.departureTime} onChange={e => handleStopChange(index, 'departureTime', e.target.value)} />
                                </div>
                                <div style={{ width: '80px' }}>
                                    <label>Seq</label>
                                    <input type="number" className="form-control" value={stop.stopSequence} onChange={e => handleStopChange(index, 'stopSequence', e.target.value)} />
                                </div>
                                <div style={{ width: '100px' }}>
                                    <label>Km</label>
                                    <input type="number" className="form-control" value={stop.distanceFromStartKm} onChange={e => handleStopChange(index, 'distanceFromStartKm', e.target.value)} />
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={handleAddStopRow}>+ Add Stop</button>
                            <button className="btn btn-success" onClick={handleSaveSchedule} disabled={!selectedTrainId}>Save Route</button>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <StatsTab />
                )}
            </div>
        </div>
    );
}

function StatsTab() {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/admin/stats`).then(res => setStats(res.data));
    }, []);

    if (!stats) return <div>Loading stats...</div>;

    return (
        <div>
            <h2>System Statistics</h2>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ padding: '2rem', background: '#e3f2fd', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>{stats.users}</h3>
                    <p>Users</p>
                </div>
                <div style={{ padding: '2rem', background: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>{stats.bookings}</h3>
                    <p>Bookings</p>
                </div>
                <div style={{ padding: '2rem', background: '#d1e7dd', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>₹{stats.revenue}</h3>
                    <p>Revenue</p>
                </div>
            </div>
        </div>
    );
}

export default AdminPortal;
