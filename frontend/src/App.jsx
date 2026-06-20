import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';
import CitizenPortal from './pages/CitizenPortal';
import Dashboard from './pages/Dashboard';
import TrackComplaint from './pages/TrackComplaint';
import Home from './pages/Home';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/auth');
  };

  const navLinkStyle = ({ isActive }) =>
    isActive
      ? { color: 'var(--text-primary)', fontWeight: 600 }
      : {};

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuth = location.pathname.startsWith('/auth');
  const isAbout = location.pathname.startsWith('/about');
  const isContact = location.pathname.startsWith('/contact');
  const isFullWidth = isDashboard || isAuth || isAbout || isContact;

  return (
    <>
        <nav className={scrolled ? 'nav-scrolled' : ''}>
          <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
            <div className="nav-brand-icon" aria-hidden="true" style={{ background: 'transparent', width: 'auto', fontSize: '1.5rem' }}>🏢</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1rem', color: '#0f2b3e', lineHeight: 1 }}>Public Grievance</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, lineHeight: 1 }}>Intelligence Platform</span>
            </div>
          </Link>

          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} style={navLinkStyle}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} style={navLinkStyle}>About</NavLink>
            <NavLink to="/submit" className={({ isActive }) => isActive ? 'active' : ''} style={navLinkStyle}>Submit Complaint</NavLink>
            <NavLink to="/track" className={({ isActive }) => isActive ? 'active' : ''} style={navLinkStyle}>Track Complaint</NavLink>
            {role === 'officer' && (
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} style={navLinkStyle}>Dashboard</NavLink>
            )}
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} style={navLinkStyle}>Contact</NavLink>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {token ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                    {userName ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f2b3e', display: window.innerWidth > 768 ? 'block' : 'none' }}>
                    Welcome, {userName || 'User'}
                  </span>
                </div>
                <button id="logout-btn" onClick={handleLogout} className="btn btn-outline btn-sm">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/auth" className="btn btn-sm">Register</Link>
              </>
            )}
          </div>
        </nav>

      <div className={isFullWidth ? '' : 'app-container'} style={isDashboard ? { width: '100vw', height: 'calc(100vh - 70px)', margin: 0, padding: 0, overflow: 'hidden' } : isAuth ? { padding: 0, margin: 0, height: 'calc(100vh - 70px)' } : isAbout || isContact ? { padding: 0, margin: 0 } : {}}>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/submit"     element={<CitizenPortal />} />
          <Route path="/auth"       element={<Auth />} />
          <Route path="/about"      element={<About />} />
          <Route path="/contact"    element={<Contact />} />
          <Route path="/track"      element={<TrackComplaint />} />
          <Route path="/track/:id"  element={<TrackComplaint />} />
          <Route path="/dashboard"  element={<Dashboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
