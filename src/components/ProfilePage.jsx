import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthPage from './auth/AuthPage';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import PropTypes from 'prop-types';

const STATUS_COLOR = { preparing: 'var(--accent-orange)', en_route: 'var(--accent-blue)', delivered: 'var(--accent-green)', placed: 'var(--accent-purple)' };
const STATUS_LABEL = { placed: 'Order Placed', preparing: 'Preparing', en_route: 'En Route', delivered: 'Delivered' };

export default function ProfilePage({ profile, orders: localOrders, onLogout, currentUser }) {
  const { loadOrders, updateUserProfile } = useAuth();
  const [subPage,      setSubPage]      = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [avatarUrl,    setAvatarUrl]    = useState(profile?.avatarUrl || null);
  const fileInputRef = useRef(null);

  /**
   * Uploads a profile photo to Firebase Storage and saves the download URL
   * to the user's Firestore profile document.
   * @param {File} file - Image file selected by the user
   */
  const handleAvatarUpload = async (file) => {
    if (!file || !currentUser || !storage) return;
    setUploading(true);
    try {
      const fileRef = storageRef(storage, `avatars/${currentUser.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateUserProfile({ avatarUrl: url });
      setAvatarUrl(url);
    } catch (e) {
      console.warn('[ArenaGO] Avatar upload failed:', e.message);
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser) return <AuthPage />;

  /* ─── My Orders sub-page ─── */
  if (subPage === 'orders') {
    return <MyOrdersPage profile={profile} loadOrders={loadOrders} localOrders={localOrders} onBack={() => setSubPage(null)} />;
  }

  /* ─── Help sub-page ─── */
  if (subPage === 'help') {
    return <HelpPage onBack={() => setSubPage(null)} />;
  }

  const menuItems = [
    { icon: '📋', bg: 'rgba(79,158,255,0.15)',  label: 'My Orders',          sub: 'View order history',              action: () => setSubPage('orders')  },
    { icon: '⚽', bg: 'rgba(0,87,184,0.2)',       label: 'Favourite Team',     sub: profile.favouriteTeam || 'Not set', action: () => {} },
    { icon: '🔔', bg: 'rgba(255,140,66,0.15)',   label: 'Notifications',      sub: 'Game alerts, order updates',      action: () => {} },
    { icon: '🎟️', bg: 'rgba(168,85,247,0.15)',  label: 'My Tickets',         sub: 'View booked matches',             action: () => {} },
    { icon: '🏆', bg: 'rgba(255,215,0,0.15)',    label: 'Fan Rewards',        sub: `${profile.fanPoints || 0} points`, action: () => {} },
    { icon: '❓', bg: 'rgba(0,230,118,0.15)',    label: 'Help & Support',     sub: 'FAQs, contact us',                action: () => setSubPage('help') },
    { icon: '🔒', bg: 'rgba(255,77,109,0.15)',   label: 'Privacy & Security', sub: 'Data, passwords',                 action: () => {} },
  ];

  return (
    <div className="page">
      <div className="fade-in-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>👤 Profile</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>Signed in as {currentUser?.email}</p>
      </div>

      <div className="profile-layout">
        {/* Left — avatar + info */}
        <div className="fade-in-up anim-delay-1">
          <div className="card" style={{ textAlign: 'center', marginBottom: 14, padding: '28px 18px' }}>
            {/* Avatar with Firebase Storage upload */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${profile.name} profile photo`}
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-blue)' }}
                />
              ) : (
                <div className="profile-avatar" aria-label={`${profile.name} avatar`}>{profile.avatar || '😄'}</div>
              )}
              <button
                aria-label="Upload profile photo to Firebase Storage"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-blue)', border: '2px solid #06081a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}
              >
                {uploading ? '⏳' : '📷'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="Choose profile photo"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleAvatarUpload(e.target.files[0])}
              />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{profile.name}</h2>
            <p style={{ fontSize: 12, color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 12 }}>
              Fan ID: {profile.fanId}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-gold">⭐ {profile.fanPoints} pts</span>
              <span className="badge badge-blue">📧 {profile.email?.split('@')[0]}</span>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Personal Info</div>
            {[
              { label: '📱 Phone',          val: profile.phone       || 'Not set' },
              { label: '📧 Email',          val: profile.email        },
              { label: '🏟️ Home Stadium',  val: profile.homeStadium || 'Not set' },
              { label: '⚽ Favourite Team', val: profile.favouriteTeam || 'Not set' },
            ].map((row, i, arr) => (
              <div key={i} className="info-row" style={{ paddingBottom: 8, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className="label">{row.label}</span>
                <span className="val" style={{ fontSize: 12, textAlign: 'right', maxWidth: '52%', wordBreak: 'break-word' }}>{row.val}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-danger btn-full" onClick={onLogout}>🚪 Sign Out</button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
            ArenaGO v2.0 · ISL Edition · ©2025
          </p>
        </div>

        {/* Right — menu items */}
        <div className="fade-in-up anim-delay-2">
          <div className="card" style={{ padding: '4px 16px' }}>
            {menuItems.map((item, i) => (
              <button key={i} className="profile-menu-item" onClick={item.action}>
                <div className="profile-menu-icon" style={{ background: item.bg }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="profile-menu-label">{item.label}</div>
                  <div className="profile-menu-sub">{item.sub}</div>
                </div>
                <span className="profile-menu-arrow">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── My Orders page (loads real Firestore data) ─── */
function MyOrdersPage({ loadOrders, localOrders, onBack }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders().then(dbOrders => {
      // Merge Firestore orders with any local (session) orders, deduplicated by id
      const merged = [...dbOrders];
      localOrders.forEach(lo => {
        if (!merged.find(o => o.id === lo.id)) merged.unshift(lo);
      });
      setOrders(merged);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: 18 }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>📋 My Orders</h1>
        {!loading && <span className="badge badge-blue">{orders.length}</span>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px', color: 'var(--accent-blue)' }} />
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading your orders…</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">No orders yet</div>
          <div className="empty-sub">Your order history will appear here after you place an order</div>
        </div>
      ) : (
        orders.map((o, i) => (
          <div key={i} className="order-history-item">
            <div style={{ fontSize: 28, flexShrink: 0 }}>🧾</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-cyan)' }}>{o.id}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[o.status] || 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {STATUS_LABEL[o.status] || o.status}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{o.stadium} · {o.placedAt}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.items?.map(it => `${it.qty}× ${it.name}`).join(', ')}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-green)' }}>₹{o.total}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Help page ─── */
function HelpPage({ onBack }) {
  const faqs = [
    { q: 'How do I verify my ticket?', a: 'Go to Order Food → enter your booking reference. Use "ISL2024" for demo.' },
    { q: 'How does seat delivery work?', a: 'After placing an order, a stadium runner brings it to your exact seat within 6–10 minutes.' },
    { q: 'Can I switch stadiums?', a: 'Yes! Tap the stadium bar on the Home page and select any ISL venue.' },
    { q: 'Is there a delivery charge?', a: 'Yes, ₹50 convenience fee per order for in-seat delivery.' },
    { q: 'How do I track my order?', a: 'Go to Cart → after placing, view the tracker. Or check My Orders in Profile.' },
    { q: 'How do I change my password?', a: 'Sign out, then click "Forgot password?" on the sign-in page to get a reset link.' },
  ];
  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: 18 }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>❓ Help & Support</h1>
      </div>
      <div className="card" style={{ marginBottom: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>💬</span>
        <div><div style={{ fontSize: 14, fontWeight: 700 }}>Chat with Support</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Available 9 AM – 11 PM</div></div>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>Chat</button>
      </div>
      <div className="section-title" style={{ marginBottom: 12 }}>Frequently Asked</div>
      {faqs.map((f, i) => (
        <details key={i} style={{ marginBottom: 8 }}>
          <summary style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {f.q} <span style={{ color: 'var(--accent-blue)' }}>›</span>
          </summary>
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {f.a}
          </div>
        </details>
      ))}
    </div>
  );
}
