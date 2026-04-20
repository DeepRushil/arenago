import { useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAuth }        from './contexts/AuthContext';
import { IS_FIREBASE_CONFIGURED, trackEvent } from './firebase';
import ToastManager  from './components/ToastManager';
import AnimatedBackground from './components/AnimatedBackground';
import SetupRequired from './components/auth/SetupRequired';
import { STADIUMS }  from './components/StadiumSelector';
import PropTypes     from 'prop-types';

/* ── Lazy-loaded page components (code splitting) ── */
const Dashboard  = lazy(() => import('./components/Dashboard'));
const OrderPage  = lazy(() => import('./components/OrderPage'));
const MapPage    = lazy(() => import('./components/MapPage'));
const CartPage   = lazy(() => import('./components/CartPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));

/* ─── Icons ─── */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const FoodIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8h1a4 4 0 010 8h-1"/>
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);
const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const CartIconSvg = ({ count }) => (
  <div style={{ position: 'relative', display: 'inline-flex' }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 21, height: 21 }} aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.42H6"/>
    </svg>
    {count > 0 && (
      <span aria-label={`${count} items in cart`} style={{ position:'absolute', top:-6, right:-6, background:'#ff4d6d', color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid #06081a' }}>
        {count > 9 ? '9+' : count}
      </span>
    )}
  </div>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PAGE_ORDER = ['home', 'order', 'map', 'cart', 'profile'];
const NAV_ITEMS  = [
  { key: 'home',    label: 'Home',    Icon: HomeIcon    },
  { key: 'order',   label: 'Order',   Icon: FoodIcon    },
  { key: 'map',     label: 'Map',     Icon: MapIcon     },
  { key: 'cart',    label: 'Cart',    Icon: null        },
  { key: 'profile', label: 'Profile', Icon: ProfileIcon },
];

/** Minimal spinner shown while lazy page chunks load */
function PageLoader() {
  return (
    <div role="status" aria-label="Loading page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <span className="spinner" style={{ color: 'var(--accent-blue)', width: 32, height: 32 }} />
    </div>
  );
}

export default function App() {
  const { currentUser, userProfile, logout, saveOrder } = useAuth();

  /* ─── If Firebase not configured, show setup screen ─── */
  if (!IS_FIREBASE_CONFIGURED) return <SetupRequired />;

  return <AppShell userProfile={userProfile} currentUser={currentUser} logout={logout} saveOrder={saveOrder} />;
}

function AppShell({ userProfile, currentUser, logout, saveOrder }) {
  const [activePage, setActivePage] = useState('home');
  const [slideDir,   setSlideDir]   = useState('left');
  const [cart,       setCart]       = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [toasts,     setToasts]     = useState([]);
  const [stadium,    setStadium]    = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [ticketRef,  setTicketRef]  = useState('');

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  /* ── Derived values (memoised) ── */
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  /* Build profile object from Firestore or Firebase user */
  const profile = userProfile ? {
    name:        userProfile.name        || currentUser?.displayName || 'Fan',
    phone:       userProfile.phone       || '',
    email:       userProfile.email       || currentUser?.email || '',
    fanId:       userProfile.fanId       || 'FAN-ISL-000',
    homeStadium: userProfile.homeStadium || '',
    avatar:      userProfile.avatar      || '😄',
    fanPoints:   userProfile.fanPoints   || 0,
    favouriteTeam: userProfile.favouriteTeam || '',
  } : {
    name:    currentUser ? (currentUser.displayName || 'Fan') : 'Guest',
    email:   currentUser?.email || '',
    fanId:   currentUser ? 'FAN-ISL-000' : 'Guest',
    avatar:  '😄',
    fanPoints: 0,
  };

  /* ── Toasts ── */
  const addToast = useCallback((message, icon = '✅') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  /* ── Navigation ── */
  const navigate = useCallback((page) => {
    const ci = PAGE_ORDER.indexOf(activePage);
    const ni = PAGE_ORDER.indexOf(page);
    setSlideDir(ni >= ci ? 'left' : 'right');
    setActivePage(page);
    trackEvent('page_view', { page_title: page, page_path: `/${page}` });
  }, [activePage]);

  /* ── Swipe gestures ── */
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 60 && dy < 80) {
      const ci = PAGE_ORDER.indexOf(activePage);
      if (dx > 0 && ci < PAGE_ORDER.length - 1) navigate(PAGE_ORDER[ci + 1]);
      if (dx < 0 && ci > 0)                     navigate(PAGE_ORDER[ci - 1]);
    }
    touchStartX.current = null;
  }, [activePage, navigate]);

  /* ── Cart ── */
  const addToCart = useCallback((item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    addToast(`${item.name} added to cart`, '🛒');
    trackEvent('add_to_cart', { item_name: item.name, value: item.price, currency: 'INR' });
  }, [addToast]);

  const removeFromCart = useCallback((id) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === id);
      if (ex?.qty > 1) return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter(c => c.id !== id);
    });
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  /* ── Orders (local state + Firestore) ── */
  const addOrder = useCallback(async (order) => {
    setOrders(prev => [...prev, order]);
    await saveOrder(order);
    trackEvent('purchase', { transaction_id: order.id, value: order.total, currency: 'INR' });
  }, [saveOrder]);

  const handleStadiumSelect = useCallback((s) => {
    setStadium(s);
    setIsVerified(false);
    setTicketRef('');
    addToast(`Stadium set to ${s.name}`, '🏟️');
    trackEvent('select_venue', { venue_name: s.name, venue_id: s.id });
  }, [addToast]);

  const handleVerified = useCallback((ref) => {
    setIsVerified(true);
    setTicketRef(ref);
    const randomStad = STADIUMS[Math.floor(Math.random() * STADIUMS.length)];
    setStadium(randomStad);
    addToast(`Ticket verified for ${randomStad.name}! 🎉`, '🎟️');
    trackEvent('ticket_verified', { ticket_ref: ref, venue_name: randomStad.name });
  }, [addToast]);

  /* ── Logout ── */
  const handleLogout   = useCallback(() => { logout(); addToast('Signed out', '👋'); }, [logout, addToast]);
  const handleUnverify = useCallback(() => { setIsVerified(false); setTicketRef(''); addToast('Ticket removed', '🗑️'); }, [addToast]);

  const slideAnim = slideDir === 'left' ? 'pageSlideLeft 0.28s ease both' : 'pageSlideRight 0.28s ease both';

  /* ─── Sidebar ─── */
  const SideNav = () => (
    <aside className="side-nav-wrapper" aria-label="Main navigation">
      <div className="side-nav-logo">
        <span className="side-nav-logo-emoji" aria-hidden="true">🏟️</span>
        <span className="side-nav-logo-text">ArenaGO</span>
      </div>
      <nav className="side-nav-items" aria-label="Page navigation">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isCart = key === 'cart';
          return (
            <button key={key} id={`sidenav-${key}`}
              className={`side-nav-item ${activePage === key ? 'active' : ''}`}
              onClick={() => navigate(key)}
              aria-current={activePage === key ? 'page' : undefined}
              aria-label={isCart && cartCount > 0 ? `${label} (${cartCount} items)` : label}>
              {isCart ? <CartIconSvg count={cartCount} /> : <Icon />}
              <span className="side-nav-label">{label}{isCart && cartCount > 0 ? ` (${cartCount})` : ''}</span>
            </button>
          );
        })}
      </nav>
      <button className="side-nav-profile" onClick={() => navigate('profile')} aria-label="Go to profile">
        <div className="side-nav-avatar" aria-hidden="true">{profile.avatar}</div>
        <div className="side-nav-profile-info">
          <div className="pname">{profile.name}</div>
          <div className="pid">{profile.fanId}</div>
        </div>
      </button>
    </aside>
  );

  /* ─── Page mapping ─── */
  const pages = {
    home:    <Dashboard setActivePage={navigate} addToast={addToast} stadium={stadium} onSelectStadium={handleStadiumSelect} profile={profile} isVerified={isVerified} ticketRef={ticketRef} onVerified={handleVerified} onUnverify={handleUnverify} />,
    order:   <OrderPage addToCart={addToCart} addToast={addToast} stadium={stadium} isVerified={isVerified} ticketRef={ticketRef} onVerified={handleVerified} onUnverify={handleUnverify} profile={profile} />,
    map:     <MapPage   addToast={addToast} stadium={stadium} isVerified={isVerified} ticketRef={ticketRef} onVerified={handleVerified} onUnverify={handleUnverify} profile={profile} />,
    cart:    <CartPage  cart={cart} cartTotal={cartTotal} removeFromCart={removeFromCart} clearCart={clearCart} addToast={addToast} setActivePage={navigate} addOrder={addOrder} stadium={stadium} profile={profile} currentUser={currentUser} />,
    profile: <ProfilePage profile={profile} orders={orders} onLogout={handleLogout} currentUser={currentUser} />,
  };

  return (
    <div className="app-root" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <AnimatedBackground />
      <ToastManager toasts={toasts} removeToast={removeToast} />

      <SideNav />

      <div className="content-wrapper" id="main-content">
        <Suspense fallback={<PageLoader />}>
          <div key={activePage} style={{ animation: slideAnim }}>
            {pages[activePage]}
          </div>
        </Suspense>
      </div>

      {/* Swipe dots — mobile */}
      <div className="swipe-hint" role="tablist" aria-label="Page indicators">
        <div className="swipe-dots">
          {PAGE_ORDER.map(p => (
            <div key={p} className={`swipe-dot ${activePage === p ? 'active' : ''}`}
              onClick={() => navigate(p)}
              role="tab"
              aria-selected={activePage === p}
              aria-label={p}
              style={{ cursor: 'pointer' }} />
          ))}
        </div>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isCart = key === 'cart';
          return (
            <button key={key} id={`nav-${key}`}
              className={`nav-item ${activePage === key ? 'active' : ''}`}
              onClick={() => navigate(key)}
              aria-current={activePage === key ? 'page' : undefined}
              aria-label={isCart && cartCount > 0 ? `${label}, ${cartCount} items` : label}>
              {isCart ? <CartIconSvg count={cartCount} /> : <Icon />}
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

AppShell.propTypes = {
  userProfile: PropTypes.object,
  currentUser: PropTypes.object,
  logout:      PropTypes.func.isRequired,
  saveOrder:   PropTypes.func.isRequired,
};

CartIconSvg.propTypes = {
  count: PropTypes.number.isRequired,
};
