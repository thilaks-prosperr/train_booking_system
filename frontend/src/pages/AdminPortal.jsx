import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminPortal.css';

function AdminPortal() {
    const [activeTab, setActiveTab] = useState('stats'); // Default view 'stats'
    const { user } = useAuth(); // Need user for token

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <h3>Dashboard</h3>
                <ul className="sidebar-menu">
                    <SidebarItem label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <SidebarItem label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                    <SidebarItem label="Add Station" active={activeTab === 'station'} onClick={() => setActiveTab('station')} />
                    <SidebarItem label="Add Train" active={activeTab === 'train'} onClick={() => setActiveTab('train')} />
                </ul>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                {activeTab === 'stats' && <StatsView user={user} />}
                {activeTab === 'bookings' && <BookingsView user={user} />}
                {activeTab === 'station' && <AddStationView user={user} />}
                {activeTab === 'train' && <AddTrainView user={user} />}
            </div>
        </div>
    );
}

function SidebarItem({ label, active, onClick }) {
    return (
        <li
            className={`sidebar-item ${active ? 'active' : ''}`}
            onClick={onClick}
        >
            {label}
        </li>
    );
}

function StatsView({ user }) {
    const [stats, setStats] = useState({ users: 0, trains: 0, stations: 0 });

    useEffect(() => {
        if (!user) return;
        // Mock endpoints if backend doesn't support them all yet exactly as required
        axios.get(`${API_BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to load stats", err));
    }, [user]);

    return (
        <div>
            <h2>Overview</h2>
            <div className="stats-grid">
                <StatCard title="Total Users" value={stats.users} color="#e0f2fe" borderColor="#bae6fd" />
                <StatCard title="Total Trains" value={stats.trains || 0} color="#fef9c3" borderColor="#fde047" />
                <StatCard title="stations" value={stats.stations || 0} color="#dcfce7" borderColor="#86efac" />
            </div>
        </div>
    );
}

function StatCard({ title, value, color, borderColor }) {
    return (
        <div className="stat-card" style={{ backgroundColor: color, borderColor: borderColor }}>
            <h3>{value}</h3>
            <p>{title}</p>
        </div>
    );
}

function AddStationView({ user }) {
    const [formData, setFormData] = useState({ code: '', name: '', city: '', latitude: '', longitude: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/admin/stations`, {
                code: formData.code,
                name: formData.name,
                city: formData.city,
                // Ensure backend expects lat/lng or latitude/longitude. api_tests calls them latitude/longitude? NO, api_tests says latitude/longitude
                // Wait, let's double check api_tests
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude)
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert("Station added successfully!");
            setFormData({ code: '', name: '', city: '', latitude: '', longitude: '' });
        } catch (err) {
            alert("Failed to add station");
            console.error(err);
        }
    };

    return (
        <div className="admin-form-container">
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Station</h2>
            <form onSubmit={handleSubmit}>
                <InputField label="Station Code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                <InputField label="Station Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <InputField label="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <InputField label="Latitude" type="number" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
                    <InputField label="Longitude" type="number" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Add Station</button>
            </form>
        </div>
    );
}

function AddTrainView({ user }) {
    const [formData, setFormData] = useState({ name: '', number: '', seats: 60 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/admin/trains`, {
                trainName: formData.name,
                trainNumber: formData.number,
                totalSeatsPerCoach: parseInt(formData.seats)
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert("Train added successfully!");
            setFormData({ name: '', number: '', seats: 60 });
        } catch (err) {
            alert("Failed to add train");
        }
    };

    return (
        <div className="admin-form-container">
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Train</h2>
            <form onSubmit={handleSubmit}>
                <InputField label="Train Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <InputField label="Train Number" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                <InputField label="Seats per Coach" type="number" value={formData.seats} onChange={e => setFormData({ ...formData, seats: e.target.value })} />
                <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Add Train</button>
            </form>
        </div>
    );
}

function InputField({ label, type = "text", value, onChange }) {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                type={type}
                className="form-control"
                value={value}
                onChange={onChange}
                required
            />
        </div>
    );
}

export default AdminPortal;
function BookingsView({ user }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        // Fetch all bookings
        api.get('/admin/bookings')
            .then(res => setBookings(res.data))
            .catch(err => console.error("Failed to load bookings", err))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <div>Loading bookings...</div>;

    return (
        <div>
            <h2>All Bookings</h2>
            <div className="bookings-table-container " style={{ overflowX: 'auto' }}>
                <table className="bookings-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f3f4f6' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Train</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Route</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.bookingId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '0.75rem' }}>#{b.bookingId}</td>
                                <td style={{ padding: '0.75rem' }}>{b.trainName} ({b.trainNumber})</td>
                                <td style={{ padding: '0.75rem' }}>{b.source} → {b.dest}</td>
                                <td style={{ padding: '0.75rem' }}>{b.date}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem',
                                        background: b.status === 'CONFIRMED' ? '#dcfce7' : '#fee2e2',
                                        color: b.status === 'CONFIRMED' ? '#166534' : '#991b1b'
                                    }}>
                                        {b.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <p style={{ margin: '1rem', color: '#666' }}>No bookings found.</p>}
            </div>
        </div>
    );
}
