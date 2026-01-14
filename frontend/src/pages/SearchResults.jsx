import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import StationMap from '../components/StationMap';
import TrainCard from '../components/TrainCard';
import '../styles/SearchResults.css';

function SearchResults() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTrainRoute, setSelectedTrainRoute] = useState(null);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/search`, {
                    params: { from, to, date },
                });
                setResults(response.data);

                // Optional: Select the first train's route by default if results exist? 
                // Or keep it null to show general map. Let's keep it null or set to first one.
                // User requirement: "If no train is selected, it can show a default view or the direct path"
                // Let's not auto-select to let user choose, but we could.
            } catch (err) {
                console.error('Error fetching search results:', err);
                setError('Failed to fetch train results. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (from && to && date) {
            fetchResults();
        }
    }, [from, to, date]);

    const [showDirectOnly, setShowDirectOnly] = useState(false);

    // Helpers for date navigation
    const handleDateChange = (days) => {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + days);
        const newDate = currentDate.toISOString().split('T')[0];

        // Update URL params
        const newParams = new URLSearchParams(searchParams);
        newParams.set('date', newDate);
        // We need to use navigate to update the URL, which will trigger the useEffect
        // Reconstruct the search string
        navigate(`/search?${newParams.toString()}`);
    };

    const handleViewRoute = (train) => {
        if (train.path) {
            setSelectedTrainRoute(train.path);
        }
    };

    // Derived state for filtered results
    const filteredResults = showDirectOnly
        ? results.filter(t => t.direct || (!t.segments && !t.layoverStation))
        : results;

    return (
        <div className="container results-container" style={{ maxWidth: '1400px' }}> {/* Increased max-width for 2 columns */}
            <div className="header-actions">
                <Link to="/" className="btn btn-secondary">← Back to Search</Link>
                <h2>Search Results</h2>
            </div>

            <div className="search-summary">
                Showing trains from <strong>{from}</strong> to <strong>{to}</strong>
            </div>

            <div className="results-layout">
                {/* Left Column: List */}
                <div className="results-list-container">

                    {/* Filter Controls */}
                    <div className="filters-bar" style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                            <input
                                type="checkbox"
                                checked={showDirectOnly}
                                onChange={(e) => setShowDirectOnly(e.target.checked)}
                            />
                            Show Direct Trains Only
                        </label>
                    </div>

                    {loading && <div className="loading">Loading trains...</div>}
                    {error && <div className="error">{error}</div>}

                    {!loading && !error && filteredResults.length === 0 && (
                        <div className="no-results">No trains found for this criteria.</div>
                    )}

                    <div className="results-list">
                        {filteredResults.map((train, index) => (
                            <TrainCard
                                key={index}
                                train={train}
                                onViewRoute={handleViewRoute}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Map */}
                <div className="results-map-container">
                    {/* Date Navigator */}
                    <div className="date-navigator" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem', background: '#333', color: '#fff', borderRadius: '4px' }}>
                        <button onClick={() => handleDateChange(-1)} className="btn btn-sm" style={{ color: '#fff', padding: '0 0.5rem' }}>&lt; Prev Day</button>
                        <span style={{ fontWeight: 'bold' }}>{date}</span>
                        <button onClick={() => handleDateChange(1)} className="btn btn-sm" style={{ color: '#fff', padding: '0 0.5rem' }}>Next Day &gt;</button>
                    </div>

                    <StationMap
                        routeStations={selectedTrainRoute}
                        className="map-wrapper"
                        style={{ height: 'calc(100% - 60px)' }} // adjust for navigator height
                    />
                </div>
            </div>
        </div>
    );
}

export default SearchResults;
