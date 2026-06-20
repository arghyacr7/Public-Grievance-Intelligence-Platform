import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import MapView from '../components/MapView';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const SEVERITY_COLORS = {
  Low:      '#22C55E', // Success
  Medium:   '#FACC15', // Yellow
  High:     '#F59E0B', // Warning
  Critical: '#EF4444', // Danger
};

const SHADCN = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#2563EB',
};

// --- SVG Icons ---
const SearchIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const BellIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const UserIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CloseIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anRes, compRes] = await Promise.all([
          api.getAnalytics(),
          api.getComplaints(),
        ]);
        setAnalytics(anRes.data);
        setComplaints(compRes.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth');
  };

  const handleDeleteComplaint = async (id) => {
    if (window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      try {
        await api.deleteComplaint(id);
        setComplaints(prev => prev.filter(c => c.id !== id));
        // Also update analytics if needed, but for now just let it be or it'll refresh on next load
      } catch (err) {
        alert("Failed to delete complaint");
        console.error(err);
      }
    }
  };

  const severityData = useMemo(() => {
    if (!analytics) return [];
    return Object.entries(analytics.severity_counts).map(([name, count]) => ({ name, count }));
  }, [analytics]);

  const statCards = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        label: 'Total Reports',
        value: complaints.length,
        trend: '+12% from last month',
        icon: <svg width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
        color: '#2563EB',
        bg: '#EFF6FF',
      },
      {
        label: 'Resolved',
        value: complaints.filter(c => c.status === 'Resolved').length,
        trend: '+4% this week',
        icon: <svg width="24" height="24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
        color: '#22C55E',
        bg: '#F0FDF4',
      },
      {
        label: 'Critical Issues',
        value: analytics?.severity_counts?.Critical || 0,
        trend: '-2% since yesterday',
        icon: <svg width="24" height="24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
        color: '#EF4444',
        bg: '#FEF2F2',
      },
      {
        label: 'Accepted Cases',
        value: complaints.filter(c => c.status === 'Accepted').length,
        trend: '+8% steady',
        icon: <svg width="24" height="24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
        color: '#F59E0B',
        bg: '#FFFBEB',
      },
    ];
  }, [analytics, complaints]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: SHADCN.bg }}>
        <div style={{ color: SHADCN.muted, fontFamily: 'sans-serif', fontSize: '18px' }}>Loading dashboard...</div>
      </div>
    );
  }

  const API_BASE_URL = 'http://127.0.0.1:8000';

  return (
    <div style={{ display: 'flex', height: '100%', width: '100vw', background: SHADCN.bg, fontFamily: 'Inter, system-ui, sans-serif', color: SHADCN.text, overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR (200px) */}
      <aside style={{ width: '200px', background: SHADCN.card, borderRight: `1px solid ${SHADCN.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        <div style={{ height: '50px', display: 'flex', alignItems: 'center', padding: '0 1rem', borderBottom: `1px solid ${SHADCN.border}` }}>
          <div style={{ width: '28px', height: '28px', background: SHADCN.primary, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', marginRight: '0.5rem', fontSize: '15px' }}>G</div>
          <span style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-0.01em' }}>Grievance Portal</span>
        </div>
        
        <nav style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1 }}>
          {[
            { id: 'Dashboard', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg> },
            { id: 'Reports', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
            { id: 'Map View', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg> },
            { id: 'My Tasks', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> },
            { id: 'Profile', icon: <UserIcon /> },
            { id: 'Settings', icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> }
          ].map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                padding: '0.5rem 0.75rem', 
                background: activeTab === tab.id ? '#F1F5F9' : 'transparent', 
                borderRadius: '6px', 
                fontWeight: activeTab === tab.id ? 600 : 500, 
                fontSize: '15px', 
                color: activeTab === tab.id ? SHADCN.text : SHADCN.muted, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                cursor: 'pointer' 
              }}>
              {tab.icon}
              {tab.id}
            </div>
          ))}
        </nav>

        <div style={{ padding: '0.5rem', borderTop: `1px solid ${SHADCN.border}` }}>
          <div onClick={handleLogout} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', fontWeight: 500, fontSize: '15px', color: SHADCN.muted, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        
        {/* STICKY TOP NAVBAR */}
        <header style={{ height: '50px', background: SHADCN.card, borderBottom: `1px solid ${SHADCN.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '0.3rem 0.6rem', borderRadius: '6px', width: '280px' }}>
            <span style={{ color: SHADCN.muted, marginRight: '0.5rem', display: 'flex' }}><SearchIcon /></span>
            <input type="text" placeholder="Search complaints..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', width: '100%', color: SHADCN.text }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: SHADCN.muted }}>
              <BellIcon />
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: SHADCN.primary, color: 'white', fontSize: '10px', fontWeight: 'bold', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👨🏻‍💼</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: SHADCN.text, fontSize: '14px', lineHeight: 1.1 }}>Arghyadeep Das</span>
                <span style={{ color: SHADCN.muted, fontSize: '12px' }}>Field Officer</span>
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC DASHBOARD CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {activeTab === 'Dashboard' && (
            <>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 0.1rem', letterSpacing: '-0.02em', color: SHADCN.text }}>Officer Dashboard</h1>
            <p style={{ color: SHADCN.muted, fontSize: '14px', margin: 0 }}>Real-time overview of civic issues, severity and resolution progress.</p>
          </div>

          {/* STATS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {statCards.map((card, i) => (
              <div key={card.label} style={{ background: SHADCN.card, border: `1px solid ${SHADCN.border}`, borderRadius: '8px', padding: '0.75rem 1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: card.color }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: SHADCN.muted }}>{card.label}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: SHADCN.text, marginBottom: '0.1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{card.value}</div>
                <div style={{ fontSize: '13px', color: SHADCN.muted, fontWeight: 500 }}>{card.trend}</div>
              </div>
            ))}
          </div>

          {/* 70/30 MAP AND CHART ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '0.75rem' }}>
            
            {/* MAP (70%) */}
            <div style={{ background: SHADCN.card, border: `1px solid ${SHADCN.border}`, borderRadius: '10px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${SHADCN.border}` }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: SHADCN.text }}>Interactive Complaint Map</h3>
              </div>
              <div style={{ height: '250px', position: 'relative', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', overflow: 'hidden' }}>
                <MapView complaints={complaints} />
                
                {/* Map Legend Overlay */}
                <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.95)', padding: '0.5rem 0.75rem', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${SHADCN.border}`, zIndex: 1000, fontSize: '13px', fontWeight: 600 }}>
                  <div style={{ marginBottom: '0.25rem', color: SHADCN.muted }}>Severity Legend</div>
                  {Object.entries(SEVERITY_COLORS).map(([sev, col]) => (
                    <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem', color: SHADCN.text }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col }} /> {sev}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DOUGHNUT CHART (30%) */}
            <div style={{ background: SHADCN.card, border: `1px solid ${SHADCN.border}`, borderRadius: '10px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${SHADCN.border}` }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: SHADCN.text }}>Issues by Severity</h3>
              </div>
              <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '150px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={severityData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="count">
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || SHADCN.muted} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: `1px solid ${SHADCN.border}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Breakdown List */}
                <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {['Critical', 'High', 'Medium', 'Low'].map(sev => (
                    <div key={sev} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: SHADCN.muted }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: SEVERITY_COLORS[sev] }} />
                        {sev}
                      </span>
                      <span style={{ color: SHADCN.text, fontSize: '14px' }}>{analytics?.severity_counts?.[sev] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 70/30 TABLE AND ACTIVITY ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '0.75rem' }}>
            
            {/* RECENT REPORTS TABLE (70%) */}
            <div style={{ background: SHADCN.card, border: `1px solid ${SHADCN.border}`, borderRadius: '10px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${SHADCN.border}` }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: SHADCN.text }}>Recent Reports</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead style={{ background: '#F8FAFC', borderBottom: `1px solid ${SHADCN.border}` }}>
                    <tr>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.muted, whiteSpace: 'nowrap' }}>ID</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.muted, whiteSpace: 'nowrap' }}>Title</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.muted, whiteSpace: 'nowrap' }}>Submitted By</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.muted, whiteSpace: 'nowrap' }}>Category</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.muted, whiteSpace: 'nowrap' }}>Severity</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.muted, whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.muted, whiteSpace: 'nowrap' }}>Time</th>
                      <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.muted, whiteSpace: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.slice(0, 8).map(c => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${SHADCN.border}` }}>
                        <td style={{ padding: '0.5rem 0.75rem', color: SHADCN.muted, fontWeight: 600 }}>#{c.id}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.text }}>{c.title.length > 25 ? c.title.substring(0,25)+'...' : c.title}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: SHADCN.muted, fontWeight: 500 }}>{c.submitted_by || 'Anonymous'}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: SHADCN.muted, fontWeight: 500 }}>{c.category}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span style={{ 
                            padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                            background: c.severity === 'Critical' ? '#FEF2F2' : c.severity === 'High' ? '#FFFBEB' : c.severity === 'Medium' ? '#FEF9C3' : '#F0FDF4',
                            color: SEVERITY_COLORS[c.severity] || SHADCN.muted,
                            border: `1px solid ${c.severity === 'Critical' ? '#FCA5A5' : c.severity === 'High' ? '#FCD34D' : c.severity === 'Medium' ? '#FEF08A' : '#86EFAC'}`
                          }}>
                            {c.severity}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span style={{ 
                            padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                            background: '#F1F5F9', color: SHADCN.text, border: `1px solid ${SHADCN.border}`
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: SHADCN.muted, fontSize: '13px', fontWeight: 500 }}>
                          {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <button onClick={() => setSelectedComplaint(c)} style={{ background: '#fff', border: `1px solid ${SHADCN.border}`, borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '13px', fontWeight: 600, color: SHADCN.text, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {complaints.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: SHADCN.muted, fontSize: '14px' }}>No reports yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LATEST ACTIVITY (30%) */}
            <div style={{ background: SHADCN.card, border: `1px solid ${SHADCN.border}`, borderRadius: '10px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${SHADCN.border}` }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: SHADCN.text }}>Latest Activity</h3>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: SHADCN.primary, marginTop: '4px' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: SHADCN.text, margin: '0 0 0.1rem' }}>Complaint #102 Reported</p>
                    <p style={{ fontSize: '13px', color: SHADCN.muted, margin: 0 }}>Citizen reported a critical pothole on MG Road.</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0.15rem 0 0', fontWeight: 500 }}>10 mins ago</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: SEVERITY_COLORS.Low, marginTop: '4px' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: SHADCN.text, margin: '0 0 0.1rem' }}>Officer Assigned</p>
                    <p style={{ fontSize: '13px', color: SHADCN.muted, margin: 0 }}>Arghyadeep Das assigned to Complaint #98.</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0.15rem 0 0', fontWeight: 500 }}>45 mins ago</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: SEVERITY_COLORS.High, marginTop: '4px' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: SHADCN.text, margin: '0 0 0.1rem' }}>Status Updated</p>
                    <p style={{ fontSize: '13px', color: SHADCN.muted, margin: 0 }}>Complaint #95 marked as 'In Progress'.</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0.15rem 0 0', fontWeight: 500 }}>2 hours ago</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
            </>
          )}

          {activeTab === 'Map View' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 0.1rem', letterSpacing: '-0.02em', color: SHADCN.text }}>Full Map View</h1>
                <p style={{ color: SHADCN.muted, fontSize: '14px', margin: 0 }}>Explore complaints interactively on a full-size map.</p>
              </div>
              <div style={{ flex: 1, background: SHADCN.card, border: `1px solid ${SHADCN.border}`, borderRadius: '10px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden', minHeight: '500px' }}>
                <MapView complaints={complaints} />
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(255,255,255,0.95)', padding: '0.5rem 0.75rem', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${SHADCN.border}`, zIndex: 1000, fontSize: '13px', fontWeight: 600 }}>
                  <div style={{ marginBottom: '0.25rem', color: SHADCN.muted }}>Severity Legend</div>
                  {Object.entries(SEVERITY_COLORS).map(([sev, col]) => (
                    <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem', color: SHADCN.text }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col }} /> {sev}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 0.1rem', letterSpacing: '-0.02em', color: SHADCN.text }}>All Reports</h1>
                <p style={{ color: SHADCN.muted, fontSize: '14px', margin: 0 }}>Browse through all submitted civic issues.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {complaints.map(c => (
                  <div key={c.id} style={{ background: SHADCN.card, border: `1px solid ${SHADCN.border}`, borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: SHADCN.muted, background: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          ID: #{c.id}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: SHADCN.text, margin: 0 }}>
                          {c.title}
                        </h3>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: SHADCN.muted, background: '#FEF2F2', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #FEE2E2' }}>
                          By: {c.submitted_by || 'Anonymous'}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: SHADCN.muted, margin: '0.5rem 0 0', lineHeight: 1.5 }}>
                        {c.description}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0, flexDirection: 'column' }}>
                      <button 
                        onClick={() => setSelectedComplaint(c)} 
                        style={{ background: '#fff', border: `1px solid ${SHADCN.border}`, borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '13px', fontWeight: 600, color: SHADCN.text, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDeleteComplaint(c.id)} 
                        style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '13px', fontWeight: 600, color: '#EF4444', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                
                {complaints.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: SHADCN.muted, border: `1px dashed ${SHADCN.border}`, borderRadius: '10px' }}>
                    No reports found.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'Dashboard' && activeTab !== 'Map View' && activeTab !== 'Reports' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column' }}>
              <svg width="48" height="48" fill="none" stroke={SHADCN.muted} strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: SHADCN.text, margin: '0 0 0.5rem' }}>{activeTab}</h2>
              <p style={{ color: SHADCN.muted, margin: 0 }}>This section is currently under development.</p>
            </div>
          )}

        </div>
      </div>

      {/* DRAWER COMPONENT */}
      {selectedComplaint && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setSelectedComplaint(null)} />
          
          {/* Drawer Panel */}
          <div style={{ width: '380px', background: SHADCN.card, height: '100%', position: 'relative', zIndex: 101, boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s ease-out' }}>
            
            <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${SHADCN.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: SHADCN.text }}>Complaint Details</h2>
              <button onClick={() => setSelectedComplaint(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: SHADCN.muted }}><CloseIcon /></button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Image */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evidence</span>
                <div style={{ marginTop: '0.4rem', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${SHADCN.border}` }}>
                  <img src={selectedComplaint.image_path.includes('http') ? selectedComplaint.image_path : `${API_BASE_URL}/${selectedComplaint.image_path.replace(/\\/g, '/')}`} alt="Complaint Evidence" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</span>
                  <p style={{ fontSize: '16px', fontWeight: 600, margin: '0.15rem 0 0', color: SHADCN.text }}>#{selectedComplaint.id}</p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity</span>
                  <p style={{ margin: '0.15rem 0 0' }}>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: selectedComplaint.severity === 'Critical' ? '#FEF2F2' : '#F0FDF4', color: SEVERITY_COLORS[selectedComplaint.severity] || SHADCN.muted, border: `1px solid ${selectedComplaint.severity === 'Critical' ? '#FCA5A5' : '#86EFAC'}` }}>
                      {selectedComplaint.severity}
                    </span>
                  </p>
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Title</span>
                <p style={{ fontSize: '16px', fontWeight: 600, margin: '0.15rem 0 0', color: SHADCN.text, lineHeight: 1.4 }}>{selectedComplaint.title}</p>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</span>
                <p style={{ fontSize: '14px', color: SHADCN.muted, lineHeight: 1.5, margin: '0.15rem 0 0', fontWeight: 500 }}>{selectedComplaint.description}</p>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coordinates</span>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: '0.15rem 0 0', color: SHADCN.text }}>{selectedComplaint.latitude}, {selectedComplaint.longitude}</p>
              </div>

              {/* Officer Notes Mock */}
              <div style={{ background: '#F8FAFC', border: `1px solid ${SHADCN.border}`, borderRadius: '8px', padding: '1rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Officer Notes</span>
                <textarea 
                  placeholder="Add resolution notes here..." 
                  style={{ width: '100%', minHeight: '60px', marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '6px', border: `1px solid ${SHADCN.border}`, fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontWeight: 500 }}
                />
                <button onClick={() => alert('Notes saved successfully!')} style={{ marginTop: '0.5rem', width: '100%', background: SHADCN.primary, color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Save Notes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Slide in animation definition */}
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}
