import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to fit bounds
function SetBounds({ stations, routeStations }) {
    const map = useMap();

    useEffect(() => {
        if (routeStations && routeStations.length > 0) {
            const bounds = L.latLngBounds(routeStations.map(s => [s.lat, s.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (stations && stations.length > 0) {
            // Optional: Fit bounds to all stations initially if needed, or stick to default center
        }
    }, [stations, routeStations, map]);

    return null;
}

function StationMap({ routeStations, onStationSelect, className, style }) {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/stations`)
            .then(res => setStations(res.data))
            .catch(err => console.error("Failed to load stations", err));
    }, []);

    // Center of Karnataka roughly
    const center = [14.0, 76.0];

    const polylinePositions = routeStations ? routeStations.map(s => [s.lat, s.lng]) : [];

    return (
        <div className={className} style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', ...style }}>
            <h3 style={{ padding: '0.5rem 1rem', margin: 0, background: '#fff', borderBottom: '1px solid #eee' }}>
                {routeStations ? 'Journey Route' : 'Station Network'}
            </h3>
            <MapContainer center={center} zoom={7} style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Fit bounds logic */}
                <SetBounds stations={stations} routeStations={routeStations} />

                {/* All Stations Markers (or just route stations if active? Let's show all for context) */}
                {stations.map(station => (
                    <Marker
                        key={station.code}
                        position={[station.lat, station.lng]}
                        eventHandlers={{
                            click: () => {
                                if (onStationSelect) {
                                    onStationSelect(station.code);
                                }
                            }
                        }}
                    >
                        <Popup>
                            <strong>{station.name} ({station.code})</strong>
                        </Popup>
                    </Marker>
                ))}

                {/* Route Polyline */}
                {routeStations && (
                    <Polyline
                        positions={polylinePositions}
                        color="red"
                        weight={4}
                        opacity={0.8}
                    />
                )}
            </MapContainer>
        </div>
    );
}

export default StationMap;
