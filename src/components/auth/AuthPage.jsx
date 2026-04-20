import { useState } from 'react';
import { useAuth, ISL_TEAMS } from '../../contexts/AuthContext';

/* ─── Field component ─── */
function Field({ label, type = 'text', value, onChange, placeholder, required, icon, rightEl, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--accent-red)', marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', transition: 'all 0.2s' }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
      >
        {icon && <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>}
        <input
          type={isPass ? (show ? 'text' : 'password') : type}
          value={value} onChange={onChange}
          placeholder={placeholder} required={required}
          autoComplete={autoComplete}
          style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: 14, width: '100%', fontWeight: 500 }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ background: 'none', color: 'var(--text-muted)', fontSize: 13, padding: '0 2px', flexShrink: 0 }}>
            {show ? '🙈' : '👁️'}
          </button>
        )}
        {rightEl}
      </div>
    </div>
  );
}


export default function AuthPage() {
  const { signup, login, resetPassword, setAuthError, friendlyError } = useAuth();

  const [tab,         setTab]         = useState('signin');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [showReset,   setShowReset]   = useState(false);
  const [resetEmail,  setResetEmail]  = useState('');
  const [resetSent,   setResetSent]   = useState(false);

  /* Sign-in fields */
  const [siEmail, setSiEmail] = useState('');
  const [siPass,  setSiPass]  = useState('');

  /* Sign-up fields */
  const [suName,  setSuName]  = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass,  setSuPass]  = useState('');
  const [suConf,  setSuConf]  = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suTeam,  setSuTeam]  = useState('');

  const clearError = () => { setError(''); setSuccess(''); };

  /* ── Sign In ── */
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!siEmail || !siPass) { setError('Please enter email and password'); return; }
    setLoading(true); clearError();
    try {
      await login(siEmail, siPass);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  /* ── Sign Up ── */
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!suName || !suEmail || !suPass) { setError('Name, email and password are required.'); return; }
    if (suPass.length < 6)              { setError('Password must be at least 6 characters.'); return; }
    if (suPass !== suConf)              { setError('Passwords do not match.'); return; }
    setLoading(true); clearError();
    try {
      await signup(suEmail, suPass, { name: suName, phone: suPhone, favouriteTeam: suTeam });
      setSuccess('Account created! Welcome to ArenaGO 🎉');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };


  /* ── Password Reset ── */
  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) { setError('Enter your email address.'); return; }
    setLoading(true); clearError();
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err) { setError(friendlyError(err.code)); }
    finally { setLoading(false); }
  };

  /* ─── Forgot password sheet ─── */
  if (showReset) {
    return (
      <AuthShell>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🔑</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Reset Password</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>We'll send a reset link to your email</p>
        </div>
        {resetSent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 8 }}>Reset email sent!</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>Check your inbox at <strong>{resetEmail}</strong> and follow the link to reset your password.</p>
            <button className="btn btn-ghost btn-full" onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); }}>← Back to Sign In</button>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <Field label="Email Address" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@example.com" required icon="📧" autoComplete="email" />
            {error && <ErrBox msg={error} />}
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ height: 48, marginBottom: 12, fontSize: 14 }}>
              {loading ? <><span className="spinner" /> Sending…</> : '📨 Send Reset Link'}
            </button>
            <button type="button" className="btn btn-ghost btn-full" onClick={() => { setShowReset(false); clearError(); }}>← Back to Sign In</button>
          </form>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 6, filter: 'drop-shadow(0 0 20px rgba(79,158,255,0.6))' }}>⚽</div>
        <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>
          <span className="gradient-text">ArenaGO</span>
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>ISL Edition · Fan Portal</p>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
        {['signin', 'signup'].map(t => (
          <button key={t} type="button" onClick={() => { setTab(t); clearError(); }}
            style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: tab === t ? 'var(--accent-blue)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s', border: 'none', cursor: 'pointer', boxShadow: tab === t ? '0 4px 16px rgba(79,158,255,0.35)' : 'none' }}>
            {t === 'signin' ? '🔑 Sign In' : '🆕 Create Account'}
          </button>
        ))}
      </div>


      {/* ── SIGN IN ── */}
      {tab === 'signin' && (
        <form onSubmit={handleSignIn}>
          <Field label="Email Address" type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)} placeholder="you@example.com" required icon="📧" autoComplete="email" />
          <Field label="Password" type="password" value={siPass} onChange={e => setSiPass(e.target.value)} placeholder="Your password" required icon="🔒" autoComplete="current-password" />
          {error   && <ErrBox msg={error} />}
          {success && <SuccessBox msg={success} />}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ height: 50, fontSize: 15, marginBottom: 14 }}>
            {loading ? <><span className="spinner" /> Signing in…</> : '🚀 Sign In'}
          </button>
          <button type="button" onClick={() => { setShowReset(true); clearError(); }}
            style={{ background: 'none', color: 'var(--accent-blue)', fontSize: 13, fontWeight: 600, width: '100%', textAlign: 'center', padding: '4px 0' }}>
            Forgot password?
          </button>
        </form>
      )}

      {/* ── SIGN UP ── */}
      {tab === 'signup' && (
        <form onSubmit={handleSignUp}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 12 }}>Account Details</div>
          <Field label="Full Name"    type="text"     value={suName}  onChange={e => setSuName(e.target.value)}  placeholder="Rohan Sharma"         required icon="👤" autoComplete="name" />
          <Field label="Email"        type="email"    value={suEmail} onChange={e => setSuEmail(e.target.value)} placeholder="you@example.com"       required icon="📧" autoComplete="email" />
          <Field label="Password"     type="password" value={suPass}  onChange={e => setSuPass(e.target.value)}  placeholder="Min 6 characters"      required icon="🔒" autoComplete="new-password" />
          <Field label="Confirm Password" type="password" value={suConf} onChange={e => setSuConf(e.target.value)} placeholder="Repeat password"    required icon="🔒" autoComplete="new-password" />

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', margin: '18px 0 12px' }}>Fan Profile <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
          <Field label="Phone Number" type="tel"      value={suPhone} onChange={e => setSuPhone(e.target.value)} placeholder="+91 98765 43210"   icon="📱" autoComplete="tel" />

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Favourite ISL Team</label>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>⚽</span>
              <select value={suTeam} onChange={e => setSuTeam(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', color: suTeam ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'var(--font)', fontSize: 14, width: '100%', cursor: 'pointer' }}>
                <option value="" style={{ background: '#0b0d22', color: 'var(--text-muted)' }}>Choose your team…</option>
                {ISL_TEAMS.map(t => <option key={t} value={t} style={{ background: '#0b0d22', color: 'var(--text-primary)' }}>{t}</option>)}
              </select>
            </div>
          </div>

          {error   && <ErrBox msg={error} />}
          {success && <SuccessBox msg={success} />}
          <button className="btn btn-success btn-full" type="submit" disabled={loading} style={{ height: 50, fontSize: 15 }}>
            {loading ? <><span className="spinner" style={{ color: '#001a0d' }} /> Creating account…</> : '🎉 Create Fan Account'}
          </button>
        </form>
      )}

      {/* Footer */}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
        By continuing you agree to ArenaGO's Terms of Service.<br />
        Your data is stored securely with Firebase.
      </p>
    </AuthShell>
  );
}

/* ─── Auth shell (centered card) ─── */
function AuthShell({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', padding: '0 0 24px' }}>
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 460,
        background: 'rgba(10,13,34,0.6)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px 28px',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Error / Success boxes ─── */
const ErrBox = ({ msg }) => (
  <div style={{ background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
    <span>❌</span>
    <span style={{ fontSize: 13, color: '#ff4d6d', fontWeight: 600, lineHeight: 1.4 }}>{msg}</span>
  </div>
);
const SuccessBox = ({ msg }) => (
  <div style={{ background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
    <span>✅</span>
    <span style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 600, lineHeight: 1.4 }}>{msg}</span>
  </div>
);
