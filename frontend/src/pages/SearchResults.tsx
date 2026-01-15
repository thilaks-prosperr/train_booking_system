import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StationMap from '../components/StationMap';
import TrainCard from '../components/TrainCard';

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

    const [showDirectOnly, setShowDirectOnly] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/search', {
                    params: { from, to, date },
                });
                setResults(response.data);
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

    // Helpers for date navigation
    const handleDateChange = (days) => {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + days);
        const newDate = currentDate.toISOString().split('T')[0];

        // Update URL params
        const newParams = new URLSearchParams(searchParams);
        newParams.set('date', newDate);
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
        <div className="container mx-auto px-4 max-w-[1400px] py-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <Link to="/" className="btn btn-secondary text-sm">← Back to Search</Link>
                <h2 className="text-2xl font-bold">Search Results</h2>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg mb-6 text-center text-lg">
                Showing trains from <strong className="text-primary">{from}</strong> to <strong className="text-primary">{to}</strong>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
                {/* Left Column: List */}
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Filter Controls */}
                    <div className="bg-muted p-3 rounded-md flex items-center mb-4">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={showDirectOnly}
                                onChange={(e) => setShowDirectOnly(e.target.checked)}
                            />
                            Show Direct Trains Only
                        </label>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {loading && <div className="text-center py-8 text-muted-foreground">Loading trains...</div>}
                        {error && <div className="text-center py-8 text-destructive bg-destructive/10 rounded-lg">{error}</div>}

                        {!loading && !error && filteredResults.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                                No trains found for this criteria.
                            </div>
                        )}

                        {filteredResults.map((train, index) => (
                            <TrainCard
                                key={index}
                                train={train}
                                date={date}
                                onViewRoute={handleViewRoute}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Map */}
                <div className="hidden lg:flex flex-col h-full">
                    {/* Date Navigator */}
                    <div className="bg-card border border-border p-3 rounded-t-lg flex justify-between items-center mb-0">
                        <button
                            onClick={() => handleDateChange(-1)}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-3 py-1 rounded text-sm transition-colors"
                        >
                            &lt; Prev Day
                        </button>
                        <span className="font-bold text-foreground">{date}</span>
                        <button
                            onClick={() => handleDateChange(1)}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-3 py-1 rounded text-sm transition-colors"
                        >
                            Next Day &gt;
                        </button>
                    </div>

                    <div className="flex-1 border border-border border-t-0 rounded-b-lg overflow-hidden shadow-sm relative">
                        <StationMap
                            routeStations={selectedTrainRoute}
                            onStationSelect={() => { }}
                            className="w-full h-full"
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchResults;
