import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import '../styles/HomePage.css';

function HomePage() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [stations, setStations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/stations`)
            .then(res => setStations(res.data.map(s => s.code)))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (from && to && date) {
            navigate(`/search?from=${from}&to=${to}&date=${date}`);
        } else {
            alert("Please fill in all fields");
        }
    };

    return (
        <div className="home-container">
            {/* Hero Section */}
            <div className="hero-section">
                {/* Search Card */}
                <div className="search-card">
                    <h2 className="search-title">Book Your Train Ticket</h2>
                    <form onSubmit={handleSubmit} className="search-form">

                        <div className="form-group">
                            <label htmlFor="from" className="form-label">From Station</label>
                            <div className="input-container">
                                <select
                                    id="from"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">Select Station</option>
                                    {stations.map((code) => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <span className="select-icon">↕</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="to" className="form-label">To Station</label>
                            <div className="input-container">
                                <select
                                    id="to"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">Select Station</option>
                                    {stations.map((code) => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <span className="select-icon">↕</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="date" className="form-label">Departure Date</label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="form-control"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-search">
                            <span style={{ marginRight: '6px' }}>🎫</span> Search Trains
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
