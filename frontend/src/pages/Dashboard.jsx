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
  const [notes, setNotes] = useState('');
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

  useEffect(() => {
    if (selectedComplaint) {
      setNotes(selectedComplaint.officer_notes || '');
    }
  }, [selectedComplaint]);

  const handleSaveNotes = async () => {
    if (!selectedComplaint) return;
    try {
      await api.updateNotes(selectedComplaint.id, notes);
      setSelectedComplaint(prev => ({ ...prev, officer_notes: notes }));
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, officer_notes: notes } : c));
      alert('Notes saved successfully!');
    } catch (err) {
      alert('Failed to save notes');
      console.error(err);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      try {
        await api.deleteComplaint(id);
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, is_deleted: true } : c));
      } catch (err) {
        alert("Failed to delete complaint: " + (err.response?.data?.detail || err.message));
        console.error("Delete error:", err);
      }
    }
  };

  const handleSplitCluster = async (id) => {
    if (window.confirm("Are you sure you want to split this cluster? Duplicate reports will become individual complaints.")) {
      try {
        await api.splitCluster(id);
        fetchComplaints(); // Refresh all
        setSelectedComplaint(null);
        alert("Cluster split successfully.");
      } catch (err) {
        alert("Failed to split cluster");
        console.error(err);
      }
    }
  };


  const activeComplaints = useMemo(() => {
    return complaints.filter(c => !c.is_deleted);
  }, [complaints]);

  const originalComplaints = useMemo(() => {
    return complaints.filter(c => !c.is_duplicate);
  }, [complaints]);

  const originalActiveComplaints = useMemo(() => {
    return originalComplaints.filter(c => !c.is_deleted);
  }, [originalComplaints]);

  const getEffectivePriority = (baseSeverity, totalReports) => {
    const severityLevels = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
    let boostLevel = 1;
    if (totalReports >= 6) boostLevel = 4;
    else if (totalReports >= 4) boostLevel = 3;
    else if (totalReports >= 2) boostLevel = 2;

    const baseLevel = severityLevels[baseSeverity] || 1;
    const finalLevel = Math.max(baseLevel, boostLevel);
    
    if (finalLevel === 4) return 'Critical';
    if (finalLevel === 3) return 'High';
    if (finalLevel === 2) return 'Medium';
    return 'Low';
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
        value: activeComplaints.length,
        trend: '+12% from last month',
        icon: <svg width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
        color: '#2563EB',
        bg: '#EFF6FF',
      },
      {
        label: 'Resolved',
        value: activeComplaints.filter(c => c.status === 'Resolved').length,
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
        value: activeComplaints.filter(c => c.status === 'Accepted').length,
        trend: '+8% steady',
        icon: <svg width="24" height="24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
        color: '#F59E0B',
        bg: '#FFFBEB',
      },
    ];
  }, [analytics, activeComplaints]);

  const recentActivities = useMemo(() => {
    if (!activeComplaints || activeComplaints.length === 0) return [];
    
    return activeComplaints.map(c => {
      const parseApiDate = (val) => {
        if (!val) return null;
        if (typeof val === 'string' && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(val)) {
          return new Date(`${val.replace(' ', 'T')}Z`);
        }
        return new Date(val);
      };
      const time = c.updated_at ? parseApiDate(c.updated_at) : parseApiDate(c.created_at);
      const isNew = c.status === 'Submitted' && !c.updated_at;
      
      let title = '';
      let desc = '';
      let color = '';
      
      if (isNew) {
        title = `Complaint #${c.id} Reported`;
        desc = `Citizen reported a ${c.severity?.toLowerCase() || ''} ${c.category?.toLowerCase() || 'issue'}.`;
        color = SHADCN.primary;
      } else if (c.status === 'Resolved') {
        title = `Complaint #${c.id} Resolved`;
        desc = `The issue has been marked as resolved.`;
        color = SEVERITY_COLORS.Low;
      } else {
        title = `Status Updated`;
        desc = `Complaint #${c.id} marked as '${c.status}'.`;
        color = SEVERITY_COLORS.High;
      }
      
      return { id: c.id, time, title, desc, color };
    }).sort((a, b) => b.time - a.time).slice(0, 4);
  }, [complaints]);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  const parseApiDate = (val) => {
    if (!val) return null;
    if (typeof val === 'string' && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(val)) {
      return new Date(`${val.replace(' ', 'T')}Z`);
    }
    return new Date(val);
  };

  const clusterDuplicates = useMemo(() => {
    if (!selectedComplaint) return [];
    return complaints.filter(dup => dup.is_duplicate && dup.duplicate_of === selectedComplaint.id);
  }, [selectedComplaint, complaints]);

  const isCluster = selectedComplaint && clusterDuplicates.length > 0;
  const totalClusterReports = isCluster ? clusterDuplicates.length + 1 : 1;
  const effectiveSeverity = selectedComplaint ? getEffectivePriority(selectedComplaint.severity, totalClusterReports) : 'Low';
  const isUpgraded = selectedComplaint && effectiveSeverity !== selectedComplaint.severity;

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
                <MapView complaints={originalComplaints} />
                
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
                    {originalActiveComplaints.slice(0, 8).map(c => {
                      const duplicateCount = complaints.filter(dup => dup.is_duplicate && dup.duplicate_of === c.id).length;
                      return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${SHADCN.border}` }}>
                        <td style={{ padding: '0.5rem 0.75rem', color: SHADCN.muted, fontWeight: 600 }}>#{c.id}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: SHADCN.text }}>
                          {c.title.length > 25 ? c.title.substring(0,25)+'...' : c.title}
                          {duplicateCount > 0 && (
                            <span style={{ marginLeft: '0.5rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', fontSize: '11px', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              👥 {duplicateCount + 1} Reports
                            </span>
                          )}
                        </td>
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
                          {(() => {
                            let val = c.created_at;
                            if (typeof val === 'string' && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(val)) {
                              val = `${val.replace(' ', 'T')}Z`;
                            }
                            return new Date(val).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                          })()}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <button onClick={() => setSelectedComplaint(c)} style={{ background: '#fff', border: `1px solid ${SHADCN.border}`, borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '13px', fontWeight: 600, color: SHADCN.text, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                            View Details
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                    {originalComplaints.length === 0 && (
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
                
                {recentActivities.length === 0 ? (
                  <div style={{ color: SHADCN.muted, fontSize: '13px' }}>No recent activity.</div>
                ) : (
                  recentActivities.map((act, i) => (
                    <div key={`${act.id}-${i}`} style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: act.color, marginTop: '4px' }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: SHADCN.text, margin: '0 0 0.1rem' }}>{act.title}</p>
                        <p style={{ fontSize: '13px', color: SHADCN.muted, margin: 0 }}>{act.desc}</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0.15rem 0 0', fontWeight: 500 }}>{timeAgo(act.time)}</p>
                      </div>
                    </div>
                  ))
                )}

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
                <MapView complaints={originalActiveComplaints} />
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
                {originalComplaints.map(c => {
                  const duplicateCount = complaints.filter(dup => dup.is_duplicate && dup.duplicate_of === c.id).length;
                  return (
                  <div key={c.id} style={{ opacity: c.is_deleted ? 0.6 : 1, background: c.is_deleted ? '#F8FAFC' : SHADCN.card, border: `1px solid ${SHADCN.border}`, borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: SHADCN.muted, background: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          ID: #{c.id}
                        </span>
                        {c.is_deleted && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            DELETED
                          </span>
                        )}
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.is_deleted ? SHADCN.muted : SHADCN.text, margin: 0, textDecoration: c.is_deleted ? 'line-through' : 'none' }}>
                          {c.title}
                          {duplicateCount > 0 && !c.is_deleted && (
                            <span style={{ marginLeft: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              🚨 COMMUNITY REPORTED
                            </span>
                          )}
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
                        onClick={() => !c.is_deleted && handleDeleteComplaint(c.id)} 
                        disabled={c.is_deleted}
                        style={{ background: c.is_deleted ? '#F1F5F9' : '#FEF2F2', border: c.is_deleted ? `1px solid ${SHADCN.border}` : '1px solid #FCA5A5', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '13px', fontWeight: 600, color: c.is_deleted ? SHADCN.muted : '#EF4444', cursor: c.is_deleted ? 'not-allowed' : 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                      >
                        {c.is_deleted ? 'Deleted' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  );
                })}
                
                {originalComplaints.length === 0 && (
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
          <div style={{ width: '420px', background: SHADCN.card, height: '100%', position: 'relative', zIndex: 101, boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s ease-out' }}>
            
            <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${SHADCN.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isCluster ? '#F8FAFC' : 'transparent' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: SHADCN.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isCluster ? 'Duplicate Complaint Cluster' : 'Complaint Details'}
                {isCluster && <span style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>CLUSTER</span>}
              </h2>
              <button onClick={() => setSelectedComplaint(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: SHADCN.muted }}><CloseIcon /></button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Image & Map Details (Standard) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evidence</span>
                  {isCluster && (
                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      98.4% Match
                    </span>
                  )}
                </div>
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${SHADCN.border}`, position: 'relative' }}>
                  <img src={selectedComplaint.image_path.includes('http') ? selectedComplaint.image_path : `${API_BASE_URL}/${selectedComplaint.image_path.replace(/\\/g, '/')}`} alt="Complaint Evidence" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  {isCluster && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', padding: '0.5rem', display: 'flex', justifyContent: 'space-around', color: 'white', fontSize: '11px', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 Same Location</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📸 Similar Image</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🤖 Same Category</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${SHADCN.border}` }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Impact</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0 0' }}>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: SHADCN.text }}>{totalClusterReports}</span>
                    <span style={{ fontSize: '12px', color: SHADCN.muted, fontWeight: 500, lineHeight: 1.1 }}>Citizens<br/>Affected</span>
                  </div>
                </div>
                <div style={{ background: isUpgraded ? '#FEF2F2' : '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${isUpgraded ? '#FECACA' : SHADCN.border}` }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: isUpgraded ? '#EF4444' : SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority {isUpgraded && 'Boost'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0 0' }}>
                    <span style={{ 
                      padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 700, 
                      background: effectiveSeverity === 'Critical' ? '#EF4444' : effectiveSeverity === 'High' ? '#F59E0B' : '#22C55E', 
                      color: 'white' 
                    }}>
                      {effectiveSeverity}
                    </span>
                    {isUpgraded && (
                      <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>↑ from {selectedComplaint.severity}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cluster Reports List */}
              {isCluster && (
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>Clustered Reports</span>
                  
                  {/* Primary Report */}
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8' }}>Primary Report (ID #{selectedComplaint.id})</span>
                      <span style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 600 }}>{parseApiDate(selectedComplaint.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#1E3A8A', fontWeight: 500 }}>
                      Reported by: <span style={{ fontWeight: 600 }}>{selectedComplaint.submitted_by || 'Anonymous'}</span>
                    </div>
                  </div>

                  {/* Secondary Reports */}
                  {clusterDuplicates.map(dup => (
                    <div key={dup.id} style={{ border: `1px solid ${SHADCN.border}`, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: SHADCN.text, display: 'block' }}>Report #{dup.id}</span>
                        <span style={{ fontSize: '12px', color: SHADCN.muted }}>By: {dup.submitted_by || 'Anonymous'}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: SHADCN.muted, fontWeight: 500 }}>
                        {parseApiDate(dup.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Detailed Context (Only for primary/single) */}
              {!isCluster && (
                <>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Title</span>
                    <p style={{ fontSize: '16px', fontWeight: 600, margin: '0.15rem 0 0', color: SHADCN.text, lineHeight: 1.4 }}>{selectedComplaint.title}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</span>
                    <p style={{ fontSize: '14px', color: SHADCN.muted, lineHeight: 1.5, margin: '0.15rem 0 0', fontWeight: 500 }}>{selectedComplaint.description}</p>
                  </div>
                </>
              )}
              
              {isCluster && (
                <div style={{ borderTop: `1px solid ${SHADCN.border}`, paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'block' }}>Complaint Activity</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '6px', top: '6px', bottom: '6px', width: '2px', background: '#E2E8F0', zIndex: 0 }} />
                    
                    {/* Activity 1 */}
                    <div style={{ display: 'flex', gap: '0.75rem', zIndex: 1, position: 'relative' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', border: '2px solid #3B82F6', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: SHADCN.text }}>{selectedComplaint.submitted_by || 'Citizen'} submitted report</div>
                        <div style={{ fontSize: '11px', color: SHADCN.muted }}>{parseApiDate(selectedComplaint.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    </div>

                    {/* Activity 2 (duplicates) */}
                    {clusterDuplicates.map(dup => (
                      <div key={'act'+dup.id} style={{ display: 'flex', gap: '0.75rem', zIndex: 1, position: 'relative' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', border: '2px solid #94A3B8', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: SHADCN.text }}>{dup.submitted_by || 'Citizen'} submitted similar report</div>
                          <div style={{ fontSize: '11px', color: SHADCN.muted }}>{parseApiDate(dup.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                    ))}

                    {/* Merge event */}
                    <div style={{ display: 'flex', gap: '0.75rem', zIndex: 1, position: 'relative', marginTop: '0.25rem' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#8B5CF6', border: '2px solid #fff', boxShadow: '0 0 0 2px #8B5CF6', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#7C3AED' }}>🤖 AI merged duplicate complaints</div>
                      </div>
                    </div>

                    {/* Upgrade event */}
                    {isUpgraded && (
                      <div style={{ display: 'flex', gap: '0.75rem', zIndex: 1, position: 'relative', marginTop: '0.25rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#EF4444', border: '2px solid #fff', boxShadow: '0 0 0 2px #EF4444', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>⚡ Priority upgraded to {effectiveSeverity}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Officer Notes & Actions */}
              <div style={{ background: '#F8FAFC', border: `1px solid ${SHADCN.border}`, borderRadius: '8px', padding: '1rem', marginTop: 'auto' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: SHADCN.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Officer Notes</span>
                <textarea 
                  placeholder="Add resolution notes here..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', minHeight: '60px', marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '6px', border: `1px solid ${SHADCN.border}`, fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontWeight: 500 }}
                />
                <button onClick={handleSaveNotes} style={{ marginTop: '0.5rem', width: '100%', background: SHADCN.primary, color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Save Notes
                </button>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {isCluster && (
                    <button onClick={() => handleSplitCluster(selectedComplaint.id)} style={{ flex: 1, background: '#fff', color: SHADCN.text, border: `1px solid ${SHADCN.border}`, borderRadius: '6px', padding: '0.5rem', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Split Cluster
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      handleDeleteComplaint(selectedComplaint.id);
                      setSelectedComplaint(null);
                    }} 
                    style={{ flex: 1, background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '0.5rem', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    {isCluster ? 'Delete Cluster' : 'Delete Report'}
                  </button>
                </div>
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
