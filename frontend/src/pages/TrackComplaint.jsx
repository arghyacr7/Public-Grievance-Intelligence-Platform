import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import AnnotatedImage from '../components/AnnotatedImage';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const STATUS_STEPS = ['Submitted', 'Seen', 'Verified', 'Accepted', 'Resolved'];

export default function TrackComplaint() {
  const { id } = useParams();
  const [complaintId, setComplaintId] = useState(id || '');
  const [complaint, setComplaint]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const [myComplaints, setMyComplaints] = useState([]);

  const fetchComplaint = async (searchId) => {
    if (!searchId) return;
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const res = await api.getComplaint(searchId);
      setComplaint(res.data);
      if (!id) navigate(`/track/${searchId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Complaint not found. Please check the ID or your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyComplaints = async () => {
    try {
      const res = await api.getComplaints();
      setMyComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) fetchComplaint(id);
    else fetchMyComplaints();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const res = await api.updateStatus(complaint.id, newStatus);
      setComplaint(res.data);
    } catch {
      alert('Failed to update status');
    }
  };

  const API_BASE_URL = 'http://127.0.0.1:8000';
  const imageUrl = complaint
    ? (complaint.image_path.includes('http')
        ? complaint.image_path
        : `${API_BASE_URL}/${complaint.image_path.replace(/\\/g, '/')}`)
    : '';

  const lat = complaint?.latitude ? parseFloat(complaint.latitude) : 22.5736;
  const lng = complaint?.longitude ? parseFloat(complaint.longitude) : 88.3639;

  const handleDownloadReceipt = () => {
    if (!complaint) return;
    const receiptContent = `
========================================
  PUBLIC GRIEVANCE INTELLIGENCE PLATFORM
========================================
               RECEIPT

Complaint ID : CMP-2025-${String(complaint.id).padStart(5, '0')}
Status       : ${complaint.status}
Category     : ${complaint.category}
Severity     : ${complaint.severity}
Reported On  : ${new Date(complaint.created_at).toLocaleString()}
Location     : Lat: ${complaint.latitude}, Lng: ${complaint.longitude}
Title        : ${complaint.title}

Description  : 
${complaint.description}

========================================
Thank you for helping us build a smarter city.
`;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_CMP-2025-${String(complaint.id).padStart(5, '0')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Hero Header */}
      <div style={{ position: 'relative', height: '260px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
        <img src="/track-hero.png" alt="Smart City" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 3rem' }}>
          <h1 style={{ fontSize: '3.5rem', margin: 0, color: '#198754' }}>Track <span style={{ color: '#1d1d1f' }}>Your Complaint</span></h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px' }}>
            Stay updated with real-time status of your reported issue.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fff', padding: '0.5rem', borderRadius: '8px', width: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '0 0.5rem', color: 'var(--text-tertiary)' }}>
              <SearchIcon />
            </div>
            <input 
              type="text" 
              placeholder="Enter Complaint ID" 
              value={complaintId}
              onChange={e => setComplaintId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchComplaint(complaintId)}
              style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: 0, minWidth: '250px', fontSize: '1rem', outline: 'none' }} 
            />
            <button className="btn" onClick={() => fetchComplaint(complaintId)} disabled={loading} style={{ padding: '0.6rem 1.5rem' }}>
              {loading ? 'Searching...' : 'Track Complaint'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fce8e6', color: '#c5221f', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* List of User's Complaints (shown when no specific complaint is searched) */}
      {!complaint && !loading && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem', color: '#1d1d1f' }}>Your Submitted Complaints</h2>
          {myComplaints.length === 0 ? (
            <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)' }}>
              You haven't submitted any complaints yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ID</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Title</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Severity</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myComplaints.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>#{c.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.title.length > 30 ? c.title.substring(0,30)+'...' : c.title}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{c.category}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`severity-badge severity-${c.severity || 'low'}`} style={{ padding: '0.2rem 0.5rem', fontSize: '12px' }}>{c.severity}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="status-badge" style={{ padding: '0.2rem 0.5rem', fontSize: '12px' }}>{c.status}</span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-tertiary)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => navigate(`/track/${c.id}`)} className="btn btn-outline btn-sm">Track</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {complaint && (
        <div className="grid-3" style={{ alignItems: 'start', animation: 'fadeSlideIn 350ms ease both' }}>
          
          {/* COLUMN 1: Complaint Details */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <span>📄</span> Complaint Details
            </h3>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.25rem' }}>Complaint ID</p>
              <p style={{ fontSize: '1.1rem', color: '#198754', fontWeight: 'bold', margin: '0 0 0.5rem' }}>CMP-2025-{String(complaint.id).padStart(5, '0')}</p>
              <span className="status-badge" style={{ background: '#e6f4ea', color: '#137333', border: 'none' }}>{complaint.status}</span>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.25rem' }}>Category</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🤖</span> {complaint.category}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.25rem' }}>Title</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-secondary)' }}>
                {complaint.title}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.25rem' }}>Severity</p>
              <span className={`severity-badge severity-${complaint.severity}`}>{complaint.severity}</span>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.25rem' }}>Reported On</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📅</span> {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(complaint.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 0.25rem' }}>Location</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📍</span> Lat: {complaint.latitude}, Lng: {complaint.longitude}
              </p>
            </div>

            {/* Photo Evidence */}
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Photo Evidence</p>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '0.5rem', maxHeight: '180px' }}>
                <AnnotatedImage src={imageUrl} detections={complaint.detections} />
              </div>
              <button onClick={handleDownloadReceipt} className="btn btn-outline" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', gap: '0.5rem' }}>
                <span>📥</span> Download Receipt
              </button>
            </div>

            {/* Officer Status Update */}
            {role === 'officer' && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Update Status (Officer)</label>
                <select value={complaint.status} onChange={handleStatusChange} style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                  {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* COLUMN 2: Complaint Progress */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📈</span> Complaint Progress
            </h3>

            {/* Horizontal Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', left: '24px', right: '24px', height: '2px', background: 'var(--border)', zIndex: 0 }} />
              
              {STATUS_STEPS.map((step, idx) => {
                const currentIdx = STATUS_STEPS.indexOf(complaint.status);
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '0.5rem', flex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#198754' : '#fff', border: done ? 'none' : '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#fff' : 'var(--text-tertiary)', fontWeight: 'bold' }}>
                      {done ? '✓' : idx + 1}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: 0, color: done ? '#1d1d1f' : 'var(--text-tertiary)' }}>{step}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 1.5rem' }} />

            <h4 style={{ fontSize: '0.9rem', margin: '0 0 1rem' }}>Timeline</h4>

            {/* Vertical Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '16px', bottom: '16px', width: '2px', background: '#e9ecef', zIndex: 0 }} />

              {STATUS_STEPS.map((step, idx) => {
                const currentIdx = STATUS_STEPS.indexOf(complaint.status);
                if (idx > currentIdx) return null; // Only show reached steps
                const isLast = idx === currentIdx;
                
                // Mock text for steps
                let desc = '';
                if (step === 'Submitted') desc = 'Your complaint has been successfully submitted.';
                if (step === 'Seen') desc = 'Your complaint has been viewed by the authorities.';
                if (step === 'Verified') desc = 'The issue has been verified and logged.';
                if (step === 'Accepted') desc = 'The issue has been assigned to a field officer and work is in progress.';
                if (step === 'Resolved') desc = 'The issue has been completely resolved.';

                return (
                  <div key={step} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e6f4ea', border: '2px solid #198754', color: '#198754', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      ✓
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#1d1d1f' }}>{step}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: 0 }}>{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: '#e6f4ea', color: '#137333', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>ℹ️</span> You will receive a notification when the status is updated.
            </div>
          </div>

          {/* COLUMN 3: Map & Updates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Map Card */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📍</span> Issue Location</h3>
              </div>
              <div style={{ height: '200px' }}>
                <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapRecenter lat={lat} lng={lng} />
                  <Marker position={[lat, lng]} />
                </MapContainer>
              </div>
            </div>

            {/* Latest Update Card */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🔄</span> Latest Update</h3>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #198754' }}>
                <p style={{ fontSize: '0.85rem', margin: '0 0 0.25rem', fontWeight: 600 }}>Status changed to {complaint.status}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>Updated recently</p>
              </div>
            </div>

            {/* Assigned To Card */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>👤</span> Assigned To</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e9ecef', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👨🏻‍💼</div>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.1rem' }}>Arghyadeep Das</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem' }}>Field Officer</p>
                  <p style={{ fontSize: '0.85rem', color: '#198754', margin: 0, fontWeight: 500 }}>📞 +91 98765 43220</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer Banner */}
      <div style={{ background: '#e8f0fe', padding: '1.5rem', borderRadius: '12px', marginTop: '3rem', textAlign: 'center', color: '#1967d2', fontSize: '0.9rem', fontWeight: 500 }}>
        <span>❓</span> Need help? Contact our support team at <strong style={{ color: '#0d6efd' }}>support@publicgrievance.gov.in</strong> or call <strong>1800-123-4567</strong>
      </div>
    </div>
  );
}
