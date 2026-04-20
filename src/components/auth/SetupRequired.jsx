

const STEPS = [
  { n: 1, title: 'Create Firebase Project', detail: 'Go to console.firebase.google.com → Add project → Name it "stadiumgo"', icon: '🔆' },
  { n: 2, title: 'Enable Email/Password Auth', detail: 'Build → Authentication → Sign-in method → Enable Email/Password', icon: '🔐' },
  { n: 3, title: 'Create Firestore Database', detail: 'Build → Firestore Database → Create database → Start in test mode', icon: '🗄️' },
  { n: 4, title: 'Copy Config Keys', detail: 'Project Settings → Your Apps → Web → Register app → Copy firebaseConfig', icon: '📋' },
  { n: 5, title: 'Add Keys to .env File', detail: 'Paste the 6 values into venue_flow/.env (use .env.example as template)', icon: '📝' },
  { n: 6, title: 'Restart Dev Server', detail: 'Stop Vite (Ctrl+C) then run: npm run dev', icon: '🚀' },
];

export default function SetupRequired() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative' }}>


      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, background: 'rgba(10,13,34,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)', padding: '36px 28px', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>⚙️</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Firebase Setup Required</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            ArenaGO uses <strong style={{ color: 'var(--accent-blue)' }}>Firebase</strong> for real-time authentication and cloud database.
            Follow these 6 steps to get started — it takes less than <strong style={{ color: 'var(--accent-green)' }}>5 minutes</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 14, padding: '13px 14px', background: 'rgba(79,158,255,0.06)', border: '1px solid rgba(79,158,255,0.15)', borderRadius: 'var(--radius-md)', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(79,158,255,0.15)', border: '1.5px solid rgba(79,158,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: 'var(--accent-blue)', flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{s.icon} {s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer"
          className="btn btn-primary btn-full" style={{ height: 50, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          🔆 Open Firebase Console →
        </a>

        <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 4 }}>📄 .env file location</div>
          <code style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            venue_flow/.env
          </code>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Copy <code style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>.env.example</code> → rename to <code style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>.env</code> → fill in your keys
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
          See <strong>FIREBASE_SETUP.md</strong> in the project root for the full guide.
        </p>
      </div>
    </div>
  );
}
