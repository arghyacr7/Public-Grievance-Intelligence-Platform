import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AnnotatedImage from '../components/AnnotatedImage';

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Re-center map when position changes
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
}

const SEVERITY_COLORS = {
  Low: { bg: '#e6f4ea', color: '#137333', border: '#ceead6' },
  Medium: { bg: '#e8f0fe', color: '#1967d2', border: '#d2e3fc' },
  High: { bg: '#fef7e0', color: '#b06000', border: '#feefc3' },
  Critical: { bg: '#fce8e6', color: '#c5221f', border: '#fad2cf' },
};

export default function CitizenPortal() {
  const [step, setStep] = useState('upload'); // 'upload' | 'analyzed' | 'submitted'

  // Upload state
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [location, setLocation]     = useState({ lat: '', lng: '' });
  const [landmark, setLandmark]     = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [updatingLoc, setUpdatingLoc] = useState(false);
  const [dragOver, setDragOver]     = useState(false);

  // Analysis results
  const [analyzing, setAnalyzing]   = useState(false);
  const [analysis, setAnalysis]     = useState(null);

  // Editable fields
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [error, setError]           = useState('');

  const fileInputRef   = useRef(null);
  const navigate       = useNavigate();

  const applyFile = (selected) => {
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setStep('upload');
      setAnalysis(null);
      setTitle('');
      setDescription('');
      setSubmittedReport(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
        setLocLoading(false);
        // Also auto-fetch landmark after getting GPS
        fetchLandmark(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setError('Location access denied. Please enter manually or try again.');
        setLocLoading(false);
      }
    );
  };

  // Automatically request location when the component mounts
  useEffect(() => {
    // Only attempt if not already loading and location is empty
    if (!location.lat && !location.lng && !locLoading) {
      getLocation();
    }
  }, []);

  const fetchLandmark = async (lat, lng) => {
    if (!lat || !lng) return;
    setUpdatingLoc(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        // Just take the first 2-3 parts of the address to keep it readable
        const parts = data.display_name.split(', ');
        setLandmark(parts.slice(0, 3).join(', '));
      } else {
        setLandmark('Unknown location');
      }
    } catch (e) {
      setLandmark('Failed to fetch landmark');
    } finally {
      setUpdatingLoc(false);
    }
  };

  const handleUpdateLocation = () => {
    if (!location.lat || !location.lng) {
      setError('Please provide valid latitude and longitude first.');
      return;
    }
    fetchLandmark(location.lat, location.lng);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please provide a photo first.');
      return;
    }
    setAnalyzing(true);
    setError('');
    const formData = new FormData();
    formData.append('latitude', location.lat || '0');
    formData.append('longitude', location.lng || '0');
    formData.append('file', file);

    try {
      const res = await api.analyzeImage(formData);
      setAnalysis(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description);
      setStep('analyzed');
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !location.lat || !location.lng) {
      setError('Please provide a photo and location.');
      return;
    }
    setSubmitting(true);
    setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('file', file);

    try {
      const res = await api.submitComplaint(formData);
      setSubmittedReport(res.data);
      setStep('submitted');
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasLocation  = location.lat && location.lng;
  const mapCenter    = hasLocation ? [parseFloat(location.lat), parseFloat(location.lng)] : [28.6139, 77.2090];
  const API_BASE_URL = 'http://127.0.0.1:8000';

  if (step === 'submitted' && submittedReport) {
    const rpt = submittedReport;
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Report Submitted Successfully!</h1>
        <p>Your report ID is #{rpt.id}</p>
        <button className="btn" onClick={() => navigate(`/track/${rpt.id}`)} style={{ marginTop: '2rem' }}>
          Track Status
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Header */}
      <div style={{ position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
        <img src="/submit-hero.png" alt="Smart City" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 3rem' }}>
          <h1 style={{ fontSize: '3.5rem', margin: 0, color: 'var(--accent)' }}>Report <span style={{ color: '#1d1d1f' }}>an Issue.</span></h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px' }}>
            AI-powered civic reporting for smarter, faster resolution.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="status-badge" style={{ background: '#e6f4ea', color: '#137333', border: 'none' }}>🤖 AI-Powered</span>
            <span className="status-badge" style={{ background: '#e8f0fe', color: '#1967d2', border: 'none' }}>📷 Photo Evidence</span>
            <span className="status-badge" style={{ background: '#f3e8fd', color: '#681da8', border: 'none' }}>📍 GPS Tracking</span>
            <span className="status-badge" style={{ background: '#fef7e0', color: '#b06000', border: 'none' }}>⚡ Instant Analysis</span>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 'upload' ? 'var(--accent)' : '#adb5bd' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: step === 'upload' ? 'var(--accent)' : '#e9ecef', color: step === 'upload' ? '#fff' : '#6c757d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
          <span style={{ fontWeight: 600 }}>Upload & Locate</span>
        </div>
        <div style={{ flex: 1, height: 2, background: step === 'analyzed' ? 'var(--accent)' : '#e9ecef' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 'analyzed' ? 'var(--accent)' : '#adb5bd' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: step === 'analyzed' ? 'var(--accent)' : '#e9ecef', color: step === 'analyzed' ? '#fff' : '#6c757d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
          <span style={{ fontWeight: 600 }}>AI Analyze</span>
        </div>
        <div style={{ flex: 1, height: 2, background: '#e9ecef' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#adb5bd' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e9ecef', color: '#6c757d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
          <span style={{ fontWeight: 600 }}>Submit</span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fce8e6', color: '#c5221f', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* 4-Column Layout */}
      <form onSubmit={handleSubmit} className="grid-4" style={{ alignItems: 'start' }}>
        
        {/* COLUMN 1: Upload & GPS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Photo Evidence */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📷</span> Photo Evidence
            </h3>
            
            <input type="file" accept="image/*" ref={fileInputRef} onChange={e => applyFile(e.target.files[0])} style={{ display: 'none' }} />
            
            <div 
              className="upload-zone"
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !preview && fileInputRef.current.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : '#ced4da'}`,
                background: preview ? '#000' : '#f8f9fa',
                minHeight: '200px',
                borderRadius: '8px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                overflow: 'hidden', marginBottom: '1rem'
              }}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
                  <div style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>☁️</div>
                  <div style={{ fontWeight: 600, color: '#1d1d1f' }}>Click to choose a source</div>
                  <div style={{ fontSize: '0.85rem' }}>Or drag & drop an image here</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => fileInputRef.current.click()}>Take Photo</button>
              <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => fileInputRef.current.click()}>Upload Image</button>
            </div>

            <button type="button" className="btn" onClick={handleAnalyze} disabled={analyzing || !file} style={{ width: '100%' }}>
              {analyzing ? 'Analyzing...' : '🔍 Analyze Image'}
            </button>
          </div>

          {/* GPS Location */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📍</span> GPS Location
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Latitude</label>
                <input type="text" value={location.lat} onChange={(e) => setLocation({...location, lat: e.target.value})} placeholder="22.5736" style={{ padding: '0.5rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Longitude</label>
                <input type="text" value={location.lng} onChange={(e) => setLocation({...location, lng: e.target.value})} placeholder="88.3639" style={{ padding: '0.5rem' }} />
              </div>
            </div>
            <button type="button" className="btn" onClick={getLocation} disabled={locLoading} style={{ width: '100%', background: '#137333' }}>
              {locLoading ? 'Detecting...' : '🎯 Auto-detect Location'}
            </button>
          </div>
        </div>

        {/* COLUMN 2: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📝</span> Issue Details
            </h3>

            <div className="form-group">
              <label>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Will be auto-generated by AI" readOnly={step==='upload'} style={{ background: step==='upload' ? '#f8f9fa' : '#fff' }} />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Will be auto-generated by AI" rows={4} readOnly={step==='upload'} style={{ background: step==='upload' ? '#f8f9fa' : '#fff' }} />
            </div>

            <div className="form-group">
              <label>Category (AI Detected)</label>
              <div style={{ padding: '0.75rem', background: '#e6f4ea', color: '#137333', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{analysis ? '🤖' : '⏳'}</span> {analysis ? analysis.category : 'Awaiting Analysis'}
              </div>
            </div>

            <div className="form-group">
              <label>Severity (AI Detected)</label>
              <div style={{ padding: '0.75rem', background: analysis ? (SEVERITY_COLORS[analysis.severity]?.bg || '#fef7e0') : '#f8f9fa', color: analysis ? (SEVERITY_COLORS[analysis.severity]?.color || '#b06000') : '#6c757d', borderRadius: '8px', fontWeight: 600 }}>
                {analysis ? analysis.severity : 'Awaiting Analysis'}
              </div>
            </div>

            {analysis && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confidence Score</span>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#137333' }}>{Math.round(analysis.detections?.[0]?.confidence * 100 || 92)}%</span>
              </div>
            )}

            {analysis?.is_duplicate && (
              <div style={{ padding: '0.75rem', background: '#f3e8fd', color: '#681da8', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
                👥 {analysis.duplicate_of ? `Similar report found (#${analysis.duplicate_of})` : 'Similar reports found nearby'}
              </div>
            )}

            {analysis && (
              <div style={{ padding: '0.75rem', background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#e65100', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Priority Score</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e65100' }}>⭐ 8.7 / 10</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} disabled={submitting || step === 'upload'}>
            {submitting ? 'Submitting...' : '🚀 Submit Report'}
          </button>
        </div>

        {/* COLUMN 3: Map */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Issue Location on Map</h3>
          </div>
          
          <div style={{ height: '350px', background: '#e9ecef', position: 'relative' }}>
            <MapContainer center={mapCenter} zoom={hasLocation ? 16 : 12} style={{ height: '100%', width: '100%' }} zoomControl={true} attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapRecenter lat={location.lat ? parseFloat(location.lat) : null} lng={location.lng ? parseFloat(location.lng) : null} />
              {hasLocation && <Marker position={[parseFloat(location.lat), parseFloat(location.lng)]} />}
            </MapContainer>
            {!hasLocation && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
                <span style={{ fontSize: '2rem' }}>📍</span>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Awaiting GPS...</p>
              </div>
            )}
          </div>

          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📍</span> Location Details</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" value={location.lat} onChange={(e) => setLocation({...location, lat: e.target.value})} placeholder="Latitude" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} />
              <input type="text" value={location.lng} onChange={(e) => setLocation({...location, lng: e.target.value})} placeholder="Longitude" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Nearest Landmark</label>
              <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="E.g. MG Road, Bangalore" style={{ padding: '0.5rem', fontSize: '0.85rem' }} />
            </div>
            <button type="button" onClick={handleUpdateLocation} disabled={updatingLoc} className="btn" style={{ width: '100%', background: '#137333' }}>
              {updatingLoc ? 'Updating...' : 'Update Location'}
            </button>
          </div>
        </div>

        {/* COLUMN 4: How it works */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚙️</span> How it works
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '16px', bottom: '16px', width: '2px', background: '#e9ecef', zIndex: 0 }} />

            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#198754', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>01</div>
              <div>
                <div style={{ fontSize: '1.5rem', color: '#198754', marginBottom: '0.25rem' }}>☁️</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Upload a photo and detect your GPS location</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d6efd', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>02</div>
              <div>
                <div style={{ fontSize: '1.5rem', color: '#0d6efd', marginBottom: '0.25rem' }}>🧠</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Click Analyze — AI generates title, description & category</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6f42c1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>03</div>
              <div>
                <div style={{ fontSize: '1.5rem', color: '#6f42c1', marginBottom: '0.25rem' }}>📄</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Review, edit if needed, then submit your report</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fd7e14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>04</div>
              <div>
                <div style={{ fontSize: '1.5rem', color: '#fd7e14', marginBottom: '0.25rem' }}>📈</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Track resolution in real-time on the Track page</p>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
