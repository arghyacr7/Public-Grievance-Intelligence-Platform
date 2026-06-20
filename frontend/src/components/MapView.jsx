import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix leaflet icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ complaints = [] }) {
  const navigate = useNavigate();
  // Default to center if no complaints, else center on first
  const center = complaints.length > 0 
    ? [complaints[0].latitude, complaints[0].longitude] 
    : [28.6139, 77.2090]; // Default New Delhi

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {complaints.map(c => (
          <Marker key={c.id} position={[c.latitude, c.longitude]}>
            <Popup>
              <strong>{c.title}</strong><br/>
              Severity: {c.severity}<br/>
              Status: {c.status}<br/>
              <button 
                onClick={() => navigate(`/track/${c.id}`)}
                style={{ marginTop: '0.5rem', cursor: 'pointer', padding: '0.25rem' }}
              >View Details</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
