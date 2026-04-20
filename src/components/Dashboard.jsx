import { useState, useEffect } from 'react';
import StadiumSelector from './StadiumSelector';
import TicketVerify from './TicketVerify';
import { getISLMatches } from '../services/islApi';

const ANNOUNCEMENTS = [
  { icon: '🚨', text: 'Gate 3 is crowded — use Gate 5 for faster entry.' },
  { icon: '⚽', text: 'Goal! Mumbai City FC scores in the 71st minute!' },
  { icon: '🍕', text: 'Express pickup live at Stand 7 — 0 min wait.' },
  { icon: '🅿️', text: 'Parking Zone B has available spots.' },
];

export default function Dashboard({ setActivePage, addToast, stadium, onSelectStadium, profile, isVerified, ticketRef, onVerified, onUnverify }) {
  const [time, setTime] = useState(new Date());
  const [showVerify, setShowVerify] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchIdx, setMatchIdx] = useState(0);

  useEffect(() => {
    getISLMatches().then(data => {
      setMatches(data);
      const activeIdx = data.findIndex(m => m.status === 'LIVE' || m.status === 'UPCOMING');
      setMatchIdx(activeIdx >= 0 ? activeIdx : 0);
    });
  }, []);

  useEffect(() => {
    if (!isVerified) {
      setTimeout(() => setShowVerify(true), 400); // Slight delay for smooth load
    }
  }, [isVerified]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayStadium = stadium || { name: 'Select Stadium', city: 'Tap to choose your venue', team: '', emoji: '🏟️' };

  return (
    <main className="page" aria-label="ArenaGO Dashboard">
      {/* Header */}
      <header className="fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2, fontWeight: 500 }}>
            {greeting()}, {profile?.name?.split(' ')[0] || 'Fan'} 👋
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px' }}>
            <span className="gradient-text">ArenaGO</span>
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>
            ISL Edition · {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button onClick={() => setActivePage('profile')} aria-label="Open profile"
          style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #0057b8, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 20px rgba(0,87,184,0.4)', border: '2px solid rgba(255,255,255,0.12)', position: 'relative' }}>
          {profile?.avatar || '😄'}
          <span style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-green)', border: '2px solid #06081a' }} />
        </button>
      </header>

      {/* Verified Venue Details Header */}
      {isVerified && stadium && (
        <div className="fade-in-up anim-delay-1" style={{ marginBottom: 18, background: 'rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28 }}>{stadium.emoji}</div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--accent-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✓ Venue Confirmed</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{stadium.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stadium.city} · {stadium.team}</div>
          </div>
        </div>
      )}

      {/* 2-col on desktop */}
      <div className="dashboard-cols">
        {/* LEFT col */}
        <div>
          {/* ISL Match Carousel */}
          <div style={{ marginBottom: 20 }}>
            {matches.length === 0 ? (
               <div className="card match-card" style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
                 <span className="spinner" style={{ color: 'var(--accent-blue)' }} />
               </div>
            ) : (
              <div className="card match-card" style={{ position: 'relative', padding: '20px 18px' }}>
                {/* Arrows */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  {matches[matchIdx].status === 'LIVE' ? (
                     <span className="badge badge-red"><span className="live-dot" /> LIVE · ISL</span>
                  ) : (
                     <span className="badge badge-blue">ISL · {matches[matchIdx].status}</span>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{matches[matchIdx].date} · {matches[matchIdx].time}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <button onClick={() => setMatchIdx(i => Math.max(0, i - 1))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: matchIdx === 0 ? 'not-allowed' : 'pointer', opacity: matchIdx === 0 ? 0.3 : 1 }}>
                    ←
                  </button>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: 32, marginBottom: 4 }}>{matches[matchIdx].team1.crest}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{matches[matchIdx].team1.shortName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{matches[matchIdx].team1.name}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.1)', animation: matches[matchIdx].status === 'LIVE' ? 'scorePulse 3s infinite' : 'none' }}>
                      <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 2, color: '#fff', lineHeight: 1 }}>{matches[matchIdx].score1} – {matches[matchIdx].score2}</div>
                      {matches[matchIdx].type === 'current' && <div style={{ fontSize: 11, color: 'var(--accent-orange)', fontWeight: 700, marginTop: 4 }}>⏱️ {matches[matchIdx].time}</div>}
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: 32, marginBottom: 4 }}>{matches[matchIdx].team2.crest}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{matches[matchIdx].team2.shortName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{matches[matchIdx].team2.name}</div>
                    </div>
                  </div>

                  <button onClick={() => setMatchIdx(i => Math.min(matches.length - 1, i + 1))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: matchIdx === matches.length - 1 ? 'not-allowed' : 'pointer', opacity: matchIdx === matches.length - 1 ? 0.3 : 1 }}>
                    →
                  </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
                  📍 Venue: <strong style={{ color: '#fff' }}>{matches[matchIdx].venue}</strong>
                </div>
              </div>
            )}
            
            {/* Verification Seat Status globally */}
            <div style={{ marginTop: 12, paddingLeft: 4 }}>
               {isVerified ? (
                 <div className="ticket-verified-banner" style={{ marginBottom: 0, padding: '10px 14px' }}>
                   🎟️ <span style={{ fontSize: 13, fontWeight: 700 }}>Verified Seat:</span>
                   <strong style={{ color: 'var(--accent-green)', marginLeft: 6 }}>{profile?.seat || 'Section A14, Row 3'}</strong>
                   <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={onUnverify}>Remove</button>
                 </div>
               ) : (
                 <div style={{ fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                   🔒 <span onClick={() => setShowVerify(true)} style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>Verify your ticket</span> to view seat details
                 </div>
               )}
            </div>
          </div>

          {/* Announcements */}
          <section className="fade-in-up anim-delay-4" aria-label="Venue announcements" style={{ marginBottom: 20 }}>
            <div className="section-header"><div className="section-title">📢 Announcements</div></div>
            <div className="announcements-grid">
              {ANNOUNCEMENTS.map((a, i) => (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>{a.text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT col */}
        <div>
          {/* Quick Actions */}
          <div className="fade-in-up anim-delay-3" style={{ marginBottom: 20 }}>
            <div className="section-header">
              <div className="section-title">Quick Actions</div>
              <span className="badge badge-blue">4 options</span>
            </div>
            <div className="quick-actions-grid">
              {[
                { icon: '🍔', label: 'Order Food',  sub: 'Skip the queue', page: 'order',  glow: 'rgba(255,140,66,0.12)' },
                { icon: '🗺️', label: 'Arena Map',   sub: 'Navigate venue', page: 'map',    glow: 'rgba(79,158,255,0.12)' },
                { icon: '🛒', label: 'My Cart',     sub: 'View orders',    page: 'cart',   glow: 'rgba(0,230,118,0.12)' },
                { icon: '📢', label: 'Alerts',      sub: '4 active now',   page: null,     glow: 'rgba(168,85,247,0.12)' },
              ].map((a, i) => (
                <button key={i} className="card"
                  onClick={() => a.page ? setActivePage(a.page) : addToast('4 venue alerts active — see Announcements', '📢')}
                  style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', background: a.glow }}>
                  <div style={{ fontSize: 30 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{a.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Venue Stats */}
          <section className="fade-in-up anim-delay-5" aria-label="Live venue statistics">
            <div className="section-header">
              <div className="section-title">🔴 Live Venue Stats</div>
              <span className="badge badge-green"><span className="live-dot" style={{ width: 6, height: 6 }} /> Real-time</span>
            </div>
            
            <div className="stats-grid">
              {!stadium ? (
                <>
                  {[
                    { label: 'Concession Wait', icon: '🍔' },
                    { label: 'Restroom Wait',   icon: '🚻' },
                    { label: 'Gates Busy',      icon: '🚪' },
                    { label: 'Attendance',      icon: '👥' },
                  ].map((s, i) => (
                    <div key={i} className="card" style={{ opacity: 0.6 }}>
                      <div style={{ fontSize: 24, marginBottom: 6, filter: 'grayscale(1)' }}>{s.icon}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-muted)' }}>-</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Select stadium</div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {(() => {
                    const capRaw = parseInt((stadium.capacity || '20000').replace(/,/g, ''), 10);
                    const factor = 0.65 + (Math.random() * 0.30); // Randomly 65% to 95% full
                    const attNum = Math.floor(capRaw * factor);
                    
                    return [
                      { label: 'Concession Wait', value: '~4 min', icon: '🍔', color: 'var(--accent-green)', sub: 'Stand 12 nearest' },
                      { label: 'Restroom Wait',   value: '~2 min', icon: '🚻', color: 'var(--accent-blue)',  sub: 'Section A west' },
                      { label: 'Gates Busy',      value: '3 / 8',  icon: '🚪', color: 'var(--accent-orange)', sub: 'Gate 5 open' },
                      { label: 'Attendance',      value: attNum.toLocaleString(), icon: '👥', color: 'var(--accent-gold)',  sub: `Cap: ${stadium.capacity || '20,000'}` },
                    ].map((s, i) => (
                      <div key={i} className="card">
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
                      </div>
                    ));
                  })()}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
      
      {showVerify && (
        <TicketVerify 
          stadium={stadium}
          onVerified={(ref) => { setShowVerify(false); onVerified(ref); }}
          onClose={() => setShowVerify(false)} 
        />
      )}
    </main>
  );
}
