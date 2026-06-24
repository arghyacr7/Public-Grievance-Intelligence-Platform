import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api/client';

export default function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await api.register({ name, email, password });
      } else {
        res = await api.login(email, password);
      }
      localStorage.setItem('token', res.data.access_token);
      const userRes = await api.getMe();
      localStorage.setItem('role', userRes.data.role);
      localStorage.setItem('userName', userRes.data.name);
      localStorage.setItem('userEmail', userRes.data.email);
      localStorage.setItem('authProvider', userRes.data.auth_provider);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.googleLogin(credentialResponse.credential);
      localStorage.setItem('token', res.data.access_token);
      const userRes = await api.getMe();
      localStorage.setItem('role', userRes.data.role);
      localStorage.setItem('userName', userRes.data.name);
      localStorage.setItem('userEmail', userRes.data.email);
      localStorage.setItem('authProvider', userRes.data.auth_provider);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Login was unsuccessful. Try again.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100vw', fontFamily: 'Inter, system-ui, sans-serif', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Vector Image covering the full auth page */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.15, pointerEvents: 'none' }}>
        <img src="/auth-hero.png" alt="City Vector Background" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 2, maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        
        {/* LEFT COLUMN (HERO & FEATURES) - 60% */}
        <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 4rem 4rem 6rem' }}>
          
          <h1 style={{ fontSize: '4.5rem', fontWeight: 800, margin: '0 0 1.5rem', lineHeight: 1.1, color: '#0F172A', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#2563EB' }}>Public Grievance</span><br />
            <span style={{ color: '#059669' }}>Intelligence Platform</span>
          </h1>
          
          <p style={{ fontSize: '1.5rem', color: '#334155', maxWidth: '650px', lineHeight: 1.4, margin: '0 0 1rem', fontWeight: 500 }}>
            AI-powered civic reporting for smarter, faster, and transparent issue resolution.
          </p>

          <p style={{ fontSize: '1.15rem', color: '#475569', maxWidth: '600px', lineHeight: 1.5, margin: '0 0 3.5rem' }}>
            Upload civic issues, track complaint progress, and help authorities build better cities.
          </p>

          {/* 2x2 Feature Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', maxWidth: '700px' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(209, 250, 229, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0, backdropFilter: 'blur(10px)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#0F172A' }}>Report Issues</h3>
                <p style={{ fontSize: '1.05rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>Capture and report civic problems instantly</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(237, 233, 254, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0, backdropFilter: 'blur(10px)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#0F172A' }}>Track Complaints</h3>
                <p style={{ fontSize: '1.05rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>Monitor complaint progress in real-time</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(219, 234, 254, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0, backdropFilter: 'blur(10px)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#0F172A' }}>Smart Analytics</h3>
                <p style={{ fontSize: '1.05rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>AI-powered insights and prioritization</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255, 237, 213, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', flexShrink: 0, backdropFilter: 'blur(10px)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#0F172A' }}>Transparent Governance</h3>
                <p style={{ fontSize: '1.05rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>Improved accountability and citizen engagement</p>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (LOGIN CARD) - 40% */}
        <div style={{ flex: '0 0 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4rem 4rem 0', position: 'relative', zIndex: 10 }}>
          
          <div style={{ width: '100%', maxWidth: '520px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '24px', padding: '3rem 3.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 30px rgba(37, 99, 235, 0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
              {isRegister ? 'Create an Account' : 'Welcome Back!'}
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', margin: '0 0 2rem', lineHeight: 1.5 }}>
              {isRegister ? 'Sign up to report issues and track your complaints.' : 'Sign in to your account to continue.'}
            </p>

            {error && (
              <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.95rem', width: '100%', border: '1px solid #FCA5A5' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleEmailAuth} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {isRegister && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', background: '#fff' }}
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', background: '#fff' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', background: '#fff' }}
              />
              
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: '#2563EB', color: 'white', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background 0.2s' }}
              >
                {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Log In')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '0 0 1.5rem', color: '#94A3B8', fontSize: '0.9rem', fontWeight: 500 }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
              <span style={{ padding: '0 1rem' }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1.5rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            </div>

            <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748B' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button 
                type="button" 
                onClick={() => { setIsRegister(!isRegister); setError(''); }} 
                style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.95rem' }}
              >
                {isRegister ? 'Log In' : 'Sign Up'}
              </button>
            </p>

          </div>
        </div>
      </div>

      {/* FOOTER FEATURE BAR */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5rem', zIndex: 10, padding: '0 2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0F172A', fontWeight: 600, fontSize: '1.1rem' }}>
          <span style={{ color: '#059669', fontSize: '1.25rem' }}>✓</span> Secure & Protected
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0F172A', fontWeight: 600, fontSize: '1.1rem' }}>
          <span style={{ color: '#2563EB', fontSize: '1.25rem' }}>✓</span> Community Driven
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0F172A', fontWeight: 600, fontSize: '1.1rem' }}>
          <span style={{ color: '#7C3AED', fontSize: '1.25rem' }}>✓</span> Faster Resolutions
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0F172A', fontWeight: 600, fontSize: '1.1rem' }}>
          <span style={{ color: '#EA580C', fontSize: '1.25rem' }}>✓</span> Trusted by Citizens
        </div>

      </div>

    </div>
  );
}
