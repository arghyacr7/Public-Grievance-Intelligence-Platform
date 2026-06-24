import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://formspree.io/f/xwpwnero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert("Failed to send message. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      alert("Error sending message. Please try again later.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: 'calc(100vh - 70px)', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* HEADER BANNER */}
      <div style={{ background: '#1E3A8A', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, rgba(37,99,235,0.8), rgba(16,185,129,0.8))', zIndex: 1, opacity: 0.9 }}></div>
        <div style={{ position: 'relative', zIndex: 2, color: 'white' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem', letterSpacing: '-0.02em', color: 'white' }}>Contact Us</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', fontWeight: 500, lineHeight: 1.5, color: 'white' }}>
            We're here to help. Reach out to our support team for any inquiries regarding the Public Grievance Intelligence Platform.
          </p>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div style={{ maxWidth: '1200px', margin: '-3rem auto 3rem', width: '100%', padding: '0 2rem', position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* CONTACT INFO CARD */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1.5rem', color: '#0F172A' }}>Get in Touch</h2>
            <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '1rem', margin: 0 }}>
              Our dedicated support team is available from Monday to Friday, 9:00 AM to 6:00 PM to assist you with your civic reports and platform usage.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#1E293B' }}>Phone</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '1rem' }}>+91 1800-123-4567</p>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Toll-free Citizen Helpline</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#1E293B' }}>Email</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '1rem' }}>support@grievanceplatform.gov</p>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Expect a reply within 24 hours</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#1E293B' }}>Headquarters</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '1rem', lineHeight: 1.5 }}>
                  Department of Public Grievances<br/>
                  Smart City IT Park, Block A<br/>
                  Sector 5, Kolkata 700091
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
              Check our <a href="#" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>FAQ Section</a> before reaching out—you might find the answer you need instantly!
            </p>
          </div>

        </div>

        {/* CONTACT FORM CARD */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0F172A' }}>Send a Message</h2>
          <p style={{ color: '#64748B', fontSize: '1rem', margin: '0 0 2rem' }}>Fill out the form below and we will get back to you.</p>

          {submitted ? (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065F46', margin: '0 0 0.5rem' }}>Message Sent!</h3>
              <p style={{ color: '#047857', margin: '0 0 1.5rem' }}>Thank you for reaching out. We will review your message and reply shortly.</p>
              <button onClick={() => setSubmitted(false)} style={{ background: 'transparent', border: '1px solid #10B981', color: '#10B981', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Your Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Subject</label>
                <select name="subject" value={formData.subject} onChange={handleChange} required style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', background: 'white' }}>
                  <option value="" disabled>Select a topic</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Feedback">Feedback/Suggestions</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="How can we help you?" style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}></textarea>
              </div>

              <button type="submit" style={{ background: '#2563EB', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>
                Send Message
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
