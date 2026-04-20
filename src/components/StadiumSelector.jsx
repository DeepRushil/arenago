import { useState, useEffect } from 'react';

/* ISL Stadiums with coordinates */
export const STADIUMS = [
  { id: 'mum', name: 'Mumbai Football Arena', city: 'Mumbai, Maharashtra', team: 'Mumbai City FC', color: '#0057b8', lat: 19.0583, lng: 72.8333, capacity: '8,000', emoji: '🔵' },
  { id: 'koc', name: 'Jawaharlal Nehru Stadium', city: 'Kochi, Kerala', team: 'Kerala Blasters FC', color: '#ffd700', lat: 9.9715, lng: 76.2724, capacity: '60,000', emoji: '🟡' },
  { id: 'kol', name: 'Salt Lake Stadium', city: 'Kolkata, West Bengal', team: 'ATK Mohun Bagan', color: '#10b981', lat: 22.5726, lng: 88.3639, capacity: '68,000', emoji: '🟢' },
  { id: 'blr', name: 'Sree Kanteerava Stadium', city: 'Bengaluru, Karnataka', team: 'Bengaluru FC', color: '#1e40af', lat: 12.9763, lng: 77.5713, capacity: '24,000', emoji: '🔵' },
  { id: 'goa', name: 'Jawaharlal Nehru Stadium', city: 'Fatorda, Goa', team: 'FC Goa', color: '#f97316', lat: 15.2994, lng: 74.0088, capacity: '19,500', emoji: '🟠' },
  { id: 'hyd', name: 'GMC Balayogi Stadium', city: 'Hyderabad, Telangana', team: 'Hyderabad FC', capacity: '16,000', color: '#7c3aed', lat: 17.4936, lng: 78.3906, emoji: '🟣' },
  { id: 'che', name: 'Jawaharlal Nehru Stadium', city: 'Chennai, Tamil Nadu', team: 'Chennaiyin FC', color: '#0ea5e9', lat: 13.0735, lng: 80.2609, capacity: '40,000', emoji: '🔵' },
  { id: 'neu', name: 'Indira Gandhi Athletic Stadium', city: 'Guwahati, Assam', team: 'NorthEast United FC', color: '#f59e0b', lat: 26.1445, lng: 91.7362, capacity: '35,000', emoji: '🟡' },
  { id: 'pun', name: 'Shiv Chhatrapati Sports Complex', city: 'Pune, Maharashtra', team: 'FC Pune City (Legacy)', color: '#dc2626', lat: 18.5204, lng: 73.8567, capacity: '12,000', emoji: '🔴' },
  { id: 'del', name: 'Ambedkar Stadium', city: 'New Delhi', team: 'Delhi FC', color: '#6d28d9', lat: 28.6448, lng: 77.2167, capacity: '20,000', emoji: '🟣' },
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const d = (a, b) => (b - a) * Math.PI / 180;
  const dLat = d(lat1, lat2), dLon = d(lon1, lon2);
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function StadiumSelector({ selected, onSelect, onClose }) {
  const [detecting, setDetecting]     = useState(false);
  const [nearestId, setNearestId]     = useState(null);
  const [locationErr, setLocationErr] = useState('');
  const [search, setSearch]           = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) { setLocationErr('Geolocation not supported'); return; }
    setDetecting(true);
    setLocationErr('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const nearest = STADIUMS.reduce((best, s) => {
          const d = haversine(lat, lng, s.lat, s.lng);
          return d < best.dist ? { id: s.id, dist: d } : best;
        }, { id: null, dist: Infinity });
        setNearestId(nearest.id);
        setDetecting(false);
      },
      () => {
        setLocationErr('Could not get location. Select manually below.');
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  const filtered = STADIUMS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase()) ||
    s.team.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet modal-sheet-full" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🏟️ Select Stadium</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Choose your home ground for tonight</p>
        </div>

        {/* Auto-detect */}
        <button className="btn btn-primary btn-full" style={{ marginBottom: 12 }} onClick={detectLocation} disabled={detecting}>
          {detecting
            ? <><span className="spinner" />  Detecting location…</>
            : <> 📍 Auto-detect My Location</>}
        </button>
        {locationErr && <p style={{ fontSize: 12, color: 'var(--accent-red)', marginBottom: 10, textAlign: 'center' }}>{locationErr}</p>}

        <div className="divider" style={{ margin: '12px 0' }} />

        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Search stadium, city, or team…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} style={{ background:'none', color:'var(--text-muted)', fontSize:14 }}>✕</button>}
        </div>

        {/* Stadium list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(s => {
            const isNearest  = s.id === nearestId;
            const isSelected = selected?.id === s.id;
            return (
              <button key={s.id} onClick={() => { onSelect(s); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${isSelected ? s.color : isNearest ? 'rgba(79,158,255,0.5)' : 'var(--border)'}`,
                  background: isSelected ? `${s.color}22` : isNearest ? 'rgba(79,158,255,0.08)' : 'var(--bg-card)',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{s.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</span>
                    {isNearest  && <span className="badge badge-blue"  style={{ fontSize: 9 }}>📍 Near You</span>}
                    {isSelected && <span className="badge badge-green" style={{ fontSize: 9 }}>✓ Selected</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.city}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2 }}>{s.team}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                  👥 {s.capacity}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
