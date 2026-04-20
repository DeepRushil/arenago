import { useState } from 'react';
import TicketVerify from './TicketVerify';

const statusColor = (s) => ({ busy: '#ff4d6d', moderate: '#ff8c42', clear: '#00e676', open: '#4f9eff', avail: '#00e676', full: '#ff4d6d' }[s] || '#8892b0');

const AMENITIES = [
  { id: 'G-1',  type: 'gate',     emoji: '🚪', label: 'Gate 1',      x: 50,  y: -8,  status: 'busy',     wait: '~12m' },
  { id: 'G-2',  type: 'gate',     emoji: '🚪', label: 'Gate 2',      x: 100, y: 50,  status: 'clear',    wait: '~2m'  },
  { id: 'G-3',  type: 'gate',     emoji: '🚪', label: 'Gate 3',      x: 50,  y: 108, status: 'clear',    wait: '~1m'  },
  { id: 'G-4',  type: 'gate',     emoji: '🚪', label: 'Gate 4',      x: 0,   y: 50,  status: 'moderate', wait: '~6m'  },
  { id: 'F-1',  type: 'food',     emoji: '🍔', label: 'Stand 7',     x: 15,  y: 14,  status: 'clear',    wait: '~3m'  },
  { id: 'F-2',  type: 'food',     emoji: '🍚', label: 'Stand 12',    x: 78,  y: 14,  status: 'clear',    wait: '~1m'  },
  { id: 'F-3',  type: 'food',     emoji: '🍕', label: 'Stand 3',     x: 15,  y: 78,  status: 'busy',     wait: '~9m'  },
  { id: 'F-4',  type: 'food',     emoji: '🥗', label: 'Stand 16',    x: 78,  y: 78,  status: 'moderate', wait: '~5m'  },
  { id: 'R-1',  type: 'restroom', emoji: '🚻', label: 'Restroom A',  x: 8,   y: 50,  status: 'clear',    wait: '~1m'  },
  { id: 'R-2',  type: 'restroom', emoji: '🚻', label: 'Restroom B',  x: 92,  y: 50,  status: 'busy',     wait: '~7m'  },
  { id: 'R-3',  type: 'restroom', emoji: '🚻', label: 'Restroom C',  x: 50,  y: 94,  status: 'clear',    wait: '~2m'  },
  { id: 'FA-1', type: 'firstaid', emoji: '🏥', label: 'First Aid W', x: 22,  y: 5,   status: 'open',     wait: ''     },
  { id: 'FA-2', type: 'firstaid', emoji: '🏥', label: 'First Aid E', x: 78,  y: 95,  status: 'open',     wait: ''     },
  { id: 'P-1',  type: 'parking',  emoji: '🅿️', label: 'Parking N',  x: 30,  y: -12, status: 'avail',    wait: ''     },
  { id: 'P-2',  type: 'parking',  emoji: '🅿️', label: 'Parking S',  x: 70,  y: 112, status: 'full',     wait: ''     },
];

const TYPE_FILTERS = [
  { key: 'all',      emoji: '🗺️', label: 'All'        },
  { key: 'gate',     emoji: '🚪', label: 'Gates'      },
  { key: 'food',     emoji: '🍔', label: 'Food Stalls' },
  { key: 'restroom', emoji: '🚻', label: 'Restrooms'  },
  { key: 'firstaid', emoji: '🏥', label: 'First Aid'  },
  { key: 'parking',  emoji: '🅿️', label: 'Parking'    },
];

export default function MapPage({ addToast, stadium, isVerified, ticketRef, onVerified, onUnverify, profile }) {
  const [filter,  setFilter]  = useState('all');
  const [selected, setSelected] = useState(null);
  const [routing,  setRouting]  = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const visible     = AMENITIES.filter(a => filter === 'all' || a.type === filter);
  const teamColor   = stadium?.color || '#0057b8';
  const stadiumName = stadium?.name  || 'Mumbai Football Arena';

  const startRoute = (a) => {
    setRouting(true);
    addToast(`Routing to ${a.label}…`, '🗺️');
    setTimeout(() => setRouting(false), 2500);
  };

  return (
    <main className="page" aria-label="Stadium Map">
      {/* Header */}
      <header className="fade-in-up" style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 3 }}>🗺️ Stadium Map</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {stadiumName} · Tap any marker for wait time & directions
        </p>
      </header>

      {/* Legend + Filter */}
      <nav className="fade-in-up anim-delay-1" aria-label="Map filters" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
          {[{ color: '#00e676', label: 'Clear' }, { color: '#ff8c42', label: 'Moderate' }, { color: '#ff4d6d', label: 'Busy' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: l.color }} /> {l.label}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>📍</span> Your Seat
          </div>
        </div>
        <div className="tag-row">
          {TYPE_FILTERS.map(f => (
            <button key={f.key} className={`tag ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="fade-in-up anim-delay-1" style={{ marginBottom: 16 }}>
        {isVerified ? (
          <div className="ticket-verified-banner" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 22, marginRight: 12 }}>✅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>Location Verified via Ticket {ticketRef}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 Your assigned seat is shown as 'YOU' on the map</div>
            </div>
            <button onClick={onUnverify} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: 6, color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
              Remove
            </button>
          </div>
        ) : (
          <button className="ticket-gate" style={{ width: '100%', cursor: 'pointer', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }} onClick={() => setShowVerify(true)}>
            <div style={{ fontSize: 28 }}>🎟️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Verify Your Ticket</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>See exactly where you are sitting & nearest amenities</div>
            </div>
            <div className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>Verify Now</div>
          </button>
        )}
      </div>

      {/* Responsive: map + list side-by-side on desktop */}
      <div className="map-layout">
        {/* SVG Map */}
        <section className="fade-in-up anim-delay-2" aria-label="Interactive stadium map">
          <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: '#080c1a', overflow: 'hidden' }}>
            <svg viewBox="-18 -18 136 136" style={{ width: '100%', display: 'block', userSelect: 'none' }}>
              <rect x="-18" y="-18" width="136" height="136" fill="#060919" />
              {/* Outer ring */}
              <rect x="-6" y="-6" width="112" height="112" rx="12" fill="none" stroke={teamColor} strokeWidth="0.5" opacity="0.3" />
              <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke={teamColor} strokeWidth="0.5" opacity="0.15" />

              {/* Stands */}
              {[
                { label: 'A', x: 0,  y: 30, w: 20, h: 40 },
                { label: 'B', x: 80, y: 30, w: 20, h: 40 },
                { label: 'C', x: 20, y: 0,  w: 60, h: 28 },
                { label: 'D', x: 20, y: 72, w: 60, h: 28 },
              ].map(s => (
                <g key={s.label}>
                  <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="1.5" fill={`${teamColor}18`} stroke={teamColor} strokeWidth="0.5" strokeDasharray="2 1.5" />
                  <text x={s.x + s.w/2} y={s.y + s.h/2 + 2} textAnchor="middle" fill={teamColor} fontSize="5" fontWeight="800" opacity="0.6">STAND {s.label}</text>
                </g>
              ))}

              {/* Pitch */}
              <rect x="20" y="28" width="60" height="44" rx="2" fill="#12451e" stroke="#2d8c42" strokeWidth="0.6" />
              <line x1="50" y1="28" x2="50" y2="72" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
              <ellipse cx="50" cy="50" rx="9" ry="9" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
              <circle cx="50" cy="50" r="1.2" fill="white" opacity="0.4" />
              <rect x="22" y="43" width="8" height="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
              <rect x="70" y="43" width="8" height="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
              <text x="50" y="52.5" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="4" fontWeight="700">PITCH</text>

              {/* Your seat */}
              {isVerified && (
                <g>
                  <circle cx="12" cy="50" r="4" fill="rgba(255,215,0,0.2)" stroke="#ffd700" strokeWidth="0.8" />
                  <circle cx="12" cy="50" r="1.5" fill="#ffd700" />
                  <text x="12" y="59" textAnchor="middle" fill="#ffd700" fontSize="3.5" fontWeight="800">YOU</text>
                </g>
              )}

              {/* Amenity markers */}
              {visible.map(a => {
                const isSel = selected?.id === a.id;
                const col   = statusColor(a.status);
                return (
                  <g key={a.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(isSel ? null : a)}>
                    {isSel && <circle cx={a.x} cy={a.y} r="7.5" fill="none" stroke={col} strokeWidth="1.2" opacity="0.5" />}
                    <circle cx={a.x} cy={a.y} r={isSel ? 5.5 : 4.5} fill={isSel ? col : 'rgba(8,12,26,0.9)'} stroke={col} strokeWidth={isSel ? 1.2 : 0.9} />
                    <text x={a.x} y={a.y + 1.8} textAnchor="middle" fontSize={isSel ? 4.5 : 4}>{a.emoji}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected detail — below map */}
          {selected && (
            <div className="fade-in-up card" style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 32 }}>{selected.emoji}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{selected.label}</div>
                    {selected.wait && <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 2, fontWeight: 600 }}>⏱ Wait: {selected.wait}</div>}
                  </div>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(selected.status), boxShadow: `0 0 8px ${statusColor(selected.status)}`, marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: 13 }} onClick={() => startRoute(selected)}>
                  {routing ? <><span className="spinner" /> Routing…</> : '🧭 Get Directions'}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setSelected(null)}>Dismiss</button>
              </div>
            </div>
          )}
        </section>

        {/* Amenity List (right col on desktop) */}
        <section className="fade-in-up anim-delay-3" aria-label="Amenity list">
          <div className="section-header">
            <div className="section-title">All Amenities</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{visible.length} shown</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visible.map(a => (
              <button key={a.id} onClick={() => setSelected(a === selected ? null : a)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: selected?.id === a.id ? `${statusColor(a.status)}18` : 'var(--bg-card)', border: `1px solid ${selected?.id === a.id ? statusColor(a.status) : 'var(--border)'}`, borderLeft: `3px solid ${statusColor(a.status)}`, borderRadius: 'var(--radius-sm)', padding: '12px 14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
                <span style={{ fontSize: 22 }}>{a.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{a.label}</div>
                  {a.wait && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Wait: {a.wait}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(a.status) }} />
                  <span style={{ fontSize: 11, color: statusColor(a.status), fontWeight: 700, textTransform: 'capitalize' }}>{a.status}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {showVerify && (
        <TicketVerify stadium={stadium} seat={profile?.seat || 'Section A14, Row 3, Seat 9'}
          onVerified={(ref) => { onVerified(ref); setShowVerify(false); }}
          onClose={() => setShowVerify(false)} />
      )}
    </main>
  );
}
