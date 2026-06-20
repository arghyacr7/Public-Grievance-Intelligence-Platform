import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '2rem 5%' }}>
      {/* HERO SECTION */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', minHeight: '70vh', gap: '3rem' }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: '#e6f4ea', 
            color: '#137333', 
            padding: '0.4rem 1rem', 
            borderRadius: '999px',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🍃</span> Building Better Cities Together
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#1d1d1f', marginBottom: '0.5rem', lineHeight: '1.1' }}>
            Report. Detect. Resolve.
          </h1>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'var(--accent)', marginBottom: '1.5rem', lineHeight: '1.1' }}>
            For a Better Tomorrow.
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '540px' }}>
            Upload civic issues, get AI-powered detection, and help authorities resolve problems faster and smarter.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/submit" className="btn" style={{ padding: '0.8rem 2rem', fontSize: '1rem', borderRadius: '8px' }}>
              <span style={{ marginRight: '0.5rem' }}>📷</span> Submit Complaint
            </Link>
            <Link to="/track" className="btn btn-outline" style={{ padding: '0.8rem 2rem', fontSize: '1rem', borderRadius: '8px', background: '#fff' }}>
              <span style={{ marginRight: '0.5rem' }}>📍</span> View Issues on Map
            </Link>
          </div>
        </div>
        
        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <img src="/hero-illustration.png" alt="App detecting pothole on street" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: '#e6f4ea', padding: '1rem', borderRadius: '12px', height: 'fit-content' }}>📷</div>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>AI-Powered Detection</h3>
            <p style={{ fontSize: '0.85rem' }}>Automatically detects and categorizes civic issues from uploaded images.</p>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: '#e8f0fe', padding: '1rem', borderRadius: '12px', height: 'fit-content' }}>📍</div>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Location-Based Reporting</h3>
            <p style={{ fontSize: '0.85rem' }}>Pinpoint issues with GPS location for accurate identification.</p>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: '#fef7e0', padding: '1rem', borderRadius: '12px', height: 'fit-content' }}>📈</div>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Smart Prioritization</h3>
            <p style={{ fontSize: '0.85rem' }}>AI assigns severity scores to prioritize high-impact issues first.</p>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: '#e8f0fe', padding: '1rem', borderRadius: '12px', height: 'fit-content' }}>📑</div>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Track & Stay Updated</h3>
            <p style={{ fontSize: '0.85rem' }}>Track the status of your complaints in real-time transparently.</p>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div style={{ background: '#f8f9fa', borderRadius: '24px', padding: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '2rem', marginTop: '4rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e6f4ea', padding: '1rem', borderRadius: '50%' }}>👥</div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>12,458+</h2>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Total Complaints</p>
          </div>
        </div>
        <div style={{ width: '1px', background: '#dee2e6' }} className="hide-on-mobile"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e8f0fe', padding: '1rem', borderRadius: '50%' }}>✅</div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>9,842+</h2>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Resolved Issues</p>
          </div>
        </div>
        <div style={{ width: '1px', background: '#dee2e6' }} className="hide-on-mobile"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fef7e0', padding: '1rem', borderRadius: '50%' }}>⚠️</div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>2,616+</h2>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Active Complaints</p>
          </div>
        </div>
        <div style={{ width: '1px', background: '#dee2e6' }} className="hide-on-mobile"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#f3e8fd', padding: '1rem', borderRadius: '50%' }}>🏛️</div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>28</h2>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Departments Onboarded</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '4rem 0 2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1d1d1f' }}>Your city. Your voice. Our priority.</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Together, we can build cleaner, safer and smarter cities.</p>
      </footer>
    </div>
  );
}
