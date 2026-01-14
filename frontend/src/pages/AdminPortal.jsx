import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

function AdminPortal() {
    const [activeTab, setActiveTab] = useState('stats'); // Default view 'stats'

    return (
        <div className="container" style={{ display: 'flex', minHeight: '80vh', marginTop: '20px' }}>
            {/* Sidebar */}
            <div className="sidebar" style={{ width: '250px', borderRight: '1px solid #ddd', paddingRight: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Dashboard</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <SidebarItem label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <SidebarItem label="Add Station" active={activeTab === 'station'} onClick={() => setActiveTab('station')} />
                    <SidebarItem label="Add Train" active={activeTab === 'train'} onClick={() => setActiveTab('train')} />
                </ul>
            </div>

            {/* Main Content */}
            <div className="content" style={{ flex: 1, paddingLeft: '40px' }}>
                {activeTab === 'stats' && <StatsView />}
                {activeTab === 'station' && <AddStationView />}
                {activeTab === 'train' && <AddTrainView />}
            </div>
        </div>
    );
}

function SidebarItem({ label, active, onClick }) {
    return (
        <li
            style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: active ? '#e3f2fd' : 'transparent',
                color: active ? '#0d47a1' : 'inherit',
                borderRadius: '8px',
                marginBottom: '8px',
                fontWeight: active ? 'bold' : 'normal'
            }}
            onClick={onClick}
        >
            {label}
        </li>
    );
}

function StatsView() {
    const [stats, setStats] = useState({ users: 0, trains: 0, stations: 0 });

    useEffect(() => {
        // Mock endpoints if backend doesn't support them all yet exactly as required
        axios.get(`${API_BASE_URL}/api/admin/stats`)
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to load stats", err));
    }, []);

    return (
        <div>
            <h2>Overview</h2>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <StatCard title="Total Users" value={stats.users} color="#e3f2fd" />
                <StatCard title="Total Trains" value={stats.trains || 0} color="#fff3cd" />
                <StatCard title="Stations Agent" value={stats.stations || 0} color="#d1e7dd" />
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div style={{
            background: color,
            padding: '2rem',
            borderRadius: '12px',
            width: '200px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <h3 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>{value}</h3>
            <p style={{ margin: 0, color: '#666', fontWeight: 500 }}>{title}</p>
        </div>
    );
}

function AddStationView() {
    const [formData, setFormData] = useState({ code: '', name: '', city: '', latitude: '', longitude: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/admin/stations`, {
                code: formData.code,
                name: formData.name,
                city: formData.city,
                lat: parseFloat(formData.latitude),
                lng: parseFloat(formData.longitude)
            });
            alert("Station added successfully!");
            setFormData({ code: '', name: '', city: '', latitude: '', longitude: '' });
        } catch (err) {
            alert("Failed to add station");
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '500px' }}>
            <h2>Add New Station</h2>
            <form onSubmit={handleSubmit}>
                <InputField label="Station Code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                <InputField label="Station Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <InputField label="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <InputField label="Latitude" type="number" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
                    <InputField label="Longitude" type="number" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
                </div>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Add Station</button>
            </form>
        </div>
    );
}

function AddTrainView() {
    const [formData, setFormData] = useState({ name: '', number: '', seats: 60 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/admin/trains`, {
                trainName: formData.name,
                trainNumber: formData.number,
                totalSeatsPerCoach: parseInt(formData.seats)
            });
            alert("Train added successfully!");
            setFormData({ name: '', number: '', seats: 60 });
        } catch (err) {
            alert("Failed to add train");
        }
    };

    return (
        <div style={{ maxWidth: '500px' }}>
            <h2>Add New Train</h2>
            <form onSubmit={handleSubmit}>
                <InputField label="Train Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <InputField label="Train Number" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                <InputField label="Seats per Coach" type="number" value={formData.seats} onChange={e => setFormData({ ...formData, seats: e.target.value })} />
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Add Train</button>
            </form>
        </div>
    );
}

function InputField({ label, type = "text", value, onChange }) {
    return (
        <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{label}</label>
            <input
                type={type}
                className="form-control"
                value={value}
                onChange={onChange}
                required
                style={{ width: '100%', padding: '0.5rem' }}
            />
        </div>
    );
}

export default AdminPortal;
