import { useState, useEffect } from 'react';

const VALID_REFS = ['ISL2024', 'MCFC001', 'KBFC007', 'FAN2024', 'TICKET1', 'VIP0001'];

export default function TicketVerify({ stadium, onVerified, onClose }) {
  const [ref, setRef]   = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const verify = () => {
    if (ref.trim().length < 4) { setError('Enter a valid booking reference'); return; }
    setChecking(true);
    setError('');
    setTimeout(() => {
      setChecking(false);
      // Accept any ref for demo or specific ones
      onVerified(ref.trim().toUpperCase());
    }, 1500);
  };



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎟️</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Verify Your Ticket</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Confirm your entry to <strong style={{ color: 'var(--text-secondary)' }}>{stadium?.name || 'the stadium'}</strong> to unlock in-seat ordering
          </p>
        </div>

        <div style={{ marginTop: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
              Booking / Ticket Reference
            </label>
            <div className="search-bar" style={{ marginBottom: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                placeholder="e.g. ISL2024, MCFC001…"
                value={ref}
                onChange={e => { setRef(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && verify()}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            {error && <p style={{ fontSize: 12, color: 'var(--accent-red)', marginBottom: 8 }}>{error}</p>}
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
              💡 For demo, use: <strong>ISL2024</strong> or <strong>MCFC001</strong> or any 4+ character code
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button className="btn btn-success" style={{ flex: 2 }} onClick={verify} disabled={checking}>
                {checking ? <><span className="spinner" /> Verifying…</> : '✓ Verify Ticket'}
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
