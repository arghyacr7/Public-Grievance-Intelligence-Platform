import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function OfficerProfile({ userName, userEmail, role, handleLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, resolution_rate: 0, notifications: [] });
  const [userInfo, setUserInfo] = useState(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user info and stats from backend
  const fetchData = useCallback(async () => {
    try {
      const [meRes, statsRes] = await Promise.all([
        api.getMe(),
        api.getMyStats()
      ]);
      setUserInfo(meRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh stats when dropdown opens
  useEffect(() => {
    if (profileOpen || notifOpen) {
      fetchData();
    }
  }, [profileOpen, notifOpen, fetchData]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = userInfo?.name || userName || 'User';
  const displayEmail = userInfo?.email || userEmail || '';
  const displayRole = userInfo?.role || role || 'citizen';
  const authProvider = userInfo?.auth_provider || 'local';
  const userId = userInfo?.id || 0;
  const createdAt = userInfo?.created_at ? new Date(userInfo.created_at) : null;
  const officerId = `OFF-${createdAt ? createdAt.getFullYear() : '2026'}-${String(userId).padStart(3, '0')}`;

  const timeAgo = (isoString) => {
    if (!isoString) return 'just now';
    const parseString = isoString.endsWith('Z') || isoString.includes('+') ? isoString : isoString + 'Z';
    const seconds = Math.floor((Date.now() - new Date(parseString).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const menuItemStyle = {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#334155',
    transition: 'background 0.15s ease',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ═══════════ NOTIFICATION BELL ═══════════ */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            position: 'relative',
            padding: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title="Notifications"
        >
          🔔
          {stats.notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              minWidth: '16px',
              height: '16px',
              background: '#EF4444',
              borderRadius: '99px',
              border: '2px solid white',
              fontSize: '9px',
              fontWeight: 700,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              animation: 'pulse-badge 2s ease-in-out infinite',
            }}>
              {stats.notifications.length}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {notifOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: '-10px',
            width: '340px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '14px',
            boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'dropdown-enter 0.2s ease-out',
          }}>
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Notifications</h3>
              {stats.notifications.length > 0 && (
                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.15rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {stats.notifications.length} New
                </span>
              )}
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {stats.notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                  No new notifications
                </div>
              ) : (
                stats.notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { setNotifOpen(false); navigate(`/track/${n.id}`); }}
                    style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #F8FAFC', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '1rem', marginTop: '0.1rem' }}>{n.icon}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 500, lineHeight: 1.4 }}>{n.text}</span>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.15rem' }}>{timeAgo(n.time)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {stats.notifications.length > 0 && (
              <div
                style={{ padding: '0.6rem', textAlign: 'center', background: '#FAFBFC', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#2563EB', transition: 'background 0.15s', borderTop: '1px solid #F1F5F9' }}
                onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                onMouseLeave={e => e.currentTarget.style.background = '#FAFBFC'}
              >
                View All Notifications
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════ PROFILE TRIGGER ═══════════ */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <div
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            padding: '0.25rem 0.6rem 0.25rem 0.25rem',
            borderRadius: '99px',
            transition: 'background 0.15s',
            background: profileOpen ? '#F1F5F9' : 'transparent',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
          onMouseLeave={e => e.currentTarget.style.background = profileOpen ? '#F1F5F9' : 'transparent'}
        >
          {/* Avatar */}
          <div style={{ position: 'relative', width: '38px', height: '38px' }}>
            {authProvider === 'google' ? (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563EB&color=fff&bold=true&size=76`}
                alt={displayName}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' }}>
                {getInitials(displayName)}
              </div>
            )}
            <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '11px', height: '11px', background: '#22C55E', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 1px rgba(34,197,94,0.2)' }} title="Online" />
          </div>

          {/* Name + Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem', textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.1 }}>{displayName}</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.2rem', lineHeight: 1 }}>
              {displayRole === 'officer' ? '🛡️' : '🟢'} {displayRole === 'officer' ? 'Field Officer' : 'Citizen'}
            </span>
          </div>

          {/* Chevron */}
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: '#94A3B8', transition: 'transform 0.2s ease', transform: profileOpen ? 'rotate(180deg)' : 'none' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {/* ═══════════ PROFILE DROPDOWN ═══════════ */}
        {profileOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '300px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            zIndex: 1000,
            overflow: 'hidden',
            padding: '0.5rem',
            animation: 'dropdown-enter 0.2s ease-out',
          }}>

            {/* ── Officer Info Card ── */}
            <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #F8FAFC, #EFF6FF)', borderRadius: '12px', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                  {authProvider === 'google' ? (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563EB&color=fff&bold=true&size=96`}
                      alt={displayName}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                      {getInitials(displayName)}
                    </div>
                  )}
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#22C55E', borderRadius: '50%', border: '2px solid white' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{displayName}</span>
                  <span style={{ fontSize: '0.73rem', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{displayEmail}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'white', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, color: '#64748B', fontFamily: 'monospace', border: '1px solid #E2E8F0' }}>
                  {officerId}
                </span>
                <span style={{ background: displayRole === 'officer' ? '#EFF6FF' : '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, color: displayRole === 'officer' ? '#2563EB' : '#10B981', border: `1px solid ${displayRole === 'officer' ? '#BFDBFE' : '#A7F3D0'}` }}>
                  {displayRole === 'officer' ? '🛡️ Field Officer' : '🟢 Citizen'}
                </span>
                {createdAt && (
                  <span style={{ background: 'white', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, color: '#94A3B8', border: '1px solid #E2E8F0' }}>
                    Joined {createdAt.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* ── Quick Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <div style={{ background: '#EFF6FF', padding: '0.6rem 0.4rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563EB', lineHeight: 1 }}>{stats.active}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.03em' }}>Active</div>
              </div>
              <div style={{ background: '#ECFDF5', padding: '0.6rem 0.4rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10B981', lineHeight: 1 }}>{stats.resolved}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6EE7B7', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.03em' }}>Resolved</div>
              </div>
              <div style={{ background: '#FFFBEB', padding: '0.6rem 0.4rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D97706', lineHeight: 1 }}>{stats.resolution_rate}%</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#FCD34D', textTransform: 'uppercase', marginTop: '0.2rem', letterSpacing: '0.03em' }}>Rate</div>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9', margin: '0.25rem 0' }} />



            {/* ── Logout ── */}
            <div
              onClick={handleLogout}
              style={{ ...menuItemStyle, color: '#EF4444', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>🚪</span> Logout
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ ANIMATIONS (injected once) ═══════════ */}
      <style>{`
        @keyframes dropdown-enter {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
