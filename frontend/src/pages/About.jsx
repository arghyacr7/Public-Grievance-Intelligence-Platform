import React from 'react';

export default function About() {
  const COLOR = {
    bg: '#F1F5F9',
    card: '#FFFFFF',
    text: '#0F172A',
    muted: '#475569',
    border: '#E2E8F0',
    primary: '#1E3A8A', // Dark Navy
    green: '#10B981',
    lightBlue: '#EFF6FF',
    lightGreen: '#ECFDF5',
    lightPurple: '#F5F3FF',
    lightOrange: '#FFF7ED',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', background: COLOR.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* HEADER BANNER */}
      <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', alignItems: 'center', padding: '0 4rem', overflow: 'hidden', background: COLOR.card }}>
        
        {/* Background Image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <img src="/about-hero.png" alt="City Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }} />
          {/* Fading gradient from left so text is readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0) 70%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '2rem', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          
          {/* Logo Badge */}
          <div style={{ width: '140px', height: '140px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', flexShrink: 0, border: '4px solid #10B981' }}>
            <span style={{ fontSize: '4rem' }}>🏙️</span>
          </div>

          <div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 0.25rem', color: COLOR.primary, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Public Grievance <br />
              <span style={{ color: COLOR.green }}>Intelligence Platform</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: COLOR.muted, margin: '0 0 1rem', fontWeight: 600 }}>
              AI-Powered Civic Issue Detection and Management System
            </p>
            <div style={{ display: 'inline-block', background: COLOR.primary, color: 'white', padding: '0.5rem 1.5rem', borderRadius: '999px', fontSize: '1rem', fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              Smart Reporting. Intelligent Detection. Faster Resolution.
            </div>
          </div>

        </div>
      </div>

      {/* 3-COLUMN MASONRY/GRID CONTENT */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', flex: 1 }}>
        
        {/* ================= COLUMN 1 ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* About The Application */}
          <div style={{ background: COLOR.card, borderRadius: '16px', border: `1px solid ${COLOR.border}`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ background: COLOR.primary, padding: '0.75rem 1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>About the Application</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem', color: COLOR.text, fontSize: '0.95rem', lineHeight: 1.6 }}>
                The <strong>Public Grievance Intelligence Platform</strong> is an AI-powered civic issue management system designed to bridge the gap between citizens and local authorities. The platform enables citizens to report civic problems such as potholes, garbage accumulation, water leakage, damaged roads, and broken public infrastructure through a simple and user-friendly interface.
              </p>
              <p style={{ margin: '0 0 1rem', color: COLOR.text, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Using advanced technologies like <strong>Computer Vision, Machine Learning, and Geospatial Mapping</strong>, the system automatically analyzes uploaded images, identifies the type of issue, predicts its severity, and assigns priority levels for faster resolution.
              </p>
              <p style={{ margin: 0, color: COLOR.text, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Citizens can track the status of their complaints in real-time, while authorities gain access to a centralized dashboard for monitoring, managing, and resolving grievances efficiently.
              </p>
            </div>
          </div>

          {/* Our Vision */}
          <div style={{ background: '#F0FDF4', borderRadius: '16px', border: `1px solid #A7F3D0`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '1.5rem', display: 'flex', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', color: COLOR.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Our Vision</h2>
              <p style={{ margin: 0, color: '#064E3B', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>
                To create smarter cities by empowering citizens and enabling authorities through intelligent technology, transparency, and efficient grievance management.
              </p>
            </div>
          </div>


        </div>

        {/* ================= COLUMN 2 ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Key Features */}
          <div style={{ background: COLOR.card, borderRadius: '16px', border: `1px solid ${COLOR.border}`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flex: 1 }}>
            <div style={{ background: COLOR.green, padding: '0.75rem 1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>Key Features</h2>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${COLOR.border}`, display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: COLOR.lightBlue, color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#1E293B', fontWeight: 700 }}>Citizen Portal</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: COLOR.muted, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    <li>Submit complaints with photo evidence</li>
                    <li>Automatic GPS location detection</li>
                    <li>AI-based issue classification</li>
                    <li>Real-time complaint tracking</li>
                    <li>User-friendly interface</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${COLOR.border}`, display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: COLOR.lightGreen, color: COLOR.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M21.18 8.02c-1-2.3-2.85-4.17-5.16-5.18"></path></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#1E293B', fontWeight: 700 }}>AI Engine</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: COLOR.muted, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    <li>Image-based issue detection using YOLOv8</li>
                    <li>Automatic complaint categorization</li>
                    <li>Severity prediction and prioritization</li>
                    <li>Duplicate complaint identification</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${COLOR.border}`, display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: COLOR.lightOrange, color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#1E293B', fontWeight: 700 }}>Officer Dashboard</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: COLOR.muted, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    <li>Real-time complaint monitoring</li>
                    <li>Interactive map visualization</li>
                    <li>Complaint review and assignment</li>
                    <li>Severity-based issue management</li>
                    <li>Resolution tracking and analytics</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>


        </div>

        {/* ================= COLUMN 3 ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Benefits */}
          <div style={{ background: COLOR.card, borderRadius: '16px', border: `1px solid ${COLOR.border}`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#7C3AED', padding: '0.75rem 1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>Benefits</h2>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${COLOR.border}`, display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: COLOR.lightBlue, color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#1E293B', fontWeight: 700 }}>For Citizens</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: COLOR.muted, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    <li>Easy reporting of civic issues</li>
                    <li>Faster grievance resolution</li>
                    <li>Transparent complaint tracking</li>
                    <li>Improved communication with authorities</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${COLOR.border}`, display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: COLOR.lightGreen, color: COLOR.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#1E293B', fontWeight: 700 }}>For Authorities</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: COLOR.muted, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    <li>Efficient complaint management</li>
                    <li>Reduced manual workload</li>
                    <li>Better resource allocation</li>
                    <li>Data-driven decision making</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${COLOR.border}`, display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: COLOR.lightPurple, color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#1E293B', fontWeight: 700 }}>For Smart Cities</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: COLOR.muted, fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
                    <li>Improved urban governance</li>
                    <li>Enhanced civic engagement</li>
                    <li>Better infrastructure maintenance</li>
                    <li>Increased transparency and accountability</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* Project Team */}
          <div style={{ background: COLOR.card, borderRadius: '16px', border: `1px solid ${COLOR.border}`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flex: 1 }}>
            <div style={{ background: COLOR.primary, padding: '0.75rem 1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>Project Team</h2>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {[
                { name: 'Arghyadeep Das', role: 'MCA Final Year Student', color: '#3B82F6' },
                { name: 'Anoushka Saha', role: 'MCA Final Year Student', color: '#10B981' },
                { name: 'Prerna K. Shaw', role: 'MCA Final Year Student', color: '#8B5CF6' },
                { name: 'Mitodru Mridha', role: 'MCA Final Year Student', color: '#F59E0B' },
              ].map(member => (
                <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: member.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 700, color: COLOR.text }}>{member.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: COLOR.primary, fontWeight: 600 }}>{member.role}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM BANNER */}
      <div style={{ background: COLOR.primary, padding: '1.5rem', color: 'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#60A5FA' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
        <span style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.02em' }}>
          Empowering citizens through AI-driven civic reporting and enabling authorities to build cleaner, safer, and smarter cities.
        </span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#60A5FA' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </div>

    </div>
  );
}
