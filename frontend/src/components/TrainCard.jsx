import React from 'react';
import { useNavigate } from 'react-router-dom';

const TrainCard = ({ train, date, onViewRoute }) => {
    const navigate = useNavigate();

    return (
        <div className="card train-card">
            <div className="train-header">
                <span className="train-name">{train.trainName}</span>
                <span className="train-number">#{train.trainNumber}</span>
            </div>
            <div className="train-body">
                <div className="train-time">
                    <div className="time-group">
                        <span className="label">Departs</span>
                        <span className="time">{train.sourceTime || train.departureTime}</span>
                    </div>
                    <div className="arrow">→</div>
                    <div className="time-group">
                        <span className="label">Arrives</span>
                        <span className="time">{train.destTime || train.arrivalTime}</span>
                    </div>
                </div>
                <div className="train-price">
                    ₹{train.price}
                </div>
            </div>

            {/* Layover Card / Segments Display */}
            {train.segments && train.segments.length > 1 && (
                <div className="segments-container" style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '4px', margin: '1rem 0', fontSize: '0.9rem' }}>
                    <strong>Journey Details:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {train.segments.map((segment, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                                <span>
                                    {segment.trainName} ({segment.sourceStation}→{segment.destStation})
                                </span>
                                {idx < train.segments.length - 1 && (
                                    <span style={{ margin: '0 0.5rem', color: 'var(--danger-color)', fontWeight: 'bold' }}>
                                        -- {segment.waitTimeAtDest || "Layover"} {"-->"}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!train.direct && !train.segments && (
                <div className="train-alert" style={{ marginBottom: '1rem', color: 'orange' }}>
                    ⚠️ Layover at {train.layoverStation}
                </div>
            )}

            <div className="card-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                    className="btn btn-secondary btn-block"
                    onClick={() => onViewRoute(train)}
                >
                    View Route
                </button>
                <button
                    className="btn btn-primary btn-block"
                    onClick={() => navigate(`/book/${train.trainId || train.trainNumber}?date=${date}`, { state: { train } })}
                    style={{ marginTop: 0 }}
                >
                    Select Seats
                </button>
            </div>
        </div>
    );
};

export default TrainCard;
