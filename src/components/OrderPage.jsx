import { useState } from 'react';
import TicketVerify from './TicketVerify';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Biryani', 'Snacks', 'Drinks', 'Desserts'];

const MENU = [
  { id: 1,  cat: 'Starters', name: 'Vada Pav',          desc: 'Spiced potato fritter, green & garlic chutney', price: 60,  emoji: '🥯', popular: true,  prepTime: '4 min', calories: 280 },
  { id: 2,  cat: 'Starters', name: 'Samosa (2 pcs)',     desc: 'Crispy pastry, spiced potato & peas',           price: 50,  emoji: '🥟', popular: false, prepTime: '3 min', calories: 220 },
  { id: 3,  cat: 'Starters', name: 'Pav Bhaji',          desc: 'Spiced mashed veggies, butter pav',             price: 120, emoji: '🫓', popular: true,  prepTime: '6 min', calories: 420 },
  { id: 4,  cat: 'Mains',    name: 'Butter Chicken',     desc: 'Creamy tomato curry, tender chicken',           price: 220, emoji: '🍛', popular: true,  prepTime: '8 min', calories: 560 },
  { id: 5,  cat: 'Mains',    name: 'Paneer Tikka',       desc: 'Tandoori cottage cheese, mint chutney',         price: 180, emoji: '🧀', popular: false, prepTime: '7 min', calories: 430 },
  { id: 6,  cat: 'Mains',    name: 'Chicken Burger',     desc: 'Grilled patty, jalapeño mayo, sesame bun',      price: 150, emoji: '🍔', popular: true,  prepTime: '5 min', calories: 490 },
  { id: 7,  cat: 'Biryani',  name: 'Chicken Biryani',    desc: 'Basmati rice, slow-cooked Hyderabadi style',    price: 250, emoji: '🍚', popular: true,  prepTime: '10 min', calories: 680 },
  { id: 8,  cat: 'Biryani',  name: 'Veg Dum Biryani',    desc: 'Fragrant saffron rice, mixed vegetables',       price: 190, emoji: '🌾', popular: false, prepTime: '10 min', calories: 540 },
  { id: 9,  cat: 'Biryani',  name: 'Egg Biryani',        desc: 'Spiced dum biryani loaded with masala eggs',    price: 210, emoji: '🥚', popular: false, prepTime: '10 min', calories: 620 },
  { id: 10, cat: 'Snacks',   name: 'Masala Popcorn XL',  desc: 'Chaat masala, lemon zest, stadium style',       price: 80,  emoji: '🍿', popular: true,  prepTime: '2 min', calories: 320 },
  { id: 11, cat: 'Snacks',   name: 'Nachos & Dip',       desc: 'Corn nachos, salsa, sour cream, jalapeños',     price: 120, emoji: '🫙', popular: false, prepTime: '3 min', calories: 420 },
  { id: 12, cat: 'Snacks',   name: 'Kathi Roll',         desc: 'Chicken seekh kebab, chutneys, rumali roti',    price: 140, emoji: '🌯', popular: false, prepTime: '5 min', calories: 390 },
  { id: 13, cat: 'Drinks',   name: 'Lassi (Sweet)',       desc: 'Chilled yoghurt lassi, cardamom',               price: 70,  emoji: '🥛', popular: true,  prepTime: '2 min', calories: 180 },
  { id: 14, cat: 'Drinks',   name: 'Nimbu Pani',          desc: 'Fresh lemon, black salt, jeera soda',           price: 50,  emoji: '🍋', popular: false, prepTime: '2 min', calories: 90  },
  { id: 15, cat: 'Drinks',   name: 'Thums Up 500ml',      desc: 'Ice-cold Indian cola',                          price: 60,  emoji: '🥤', popular: false, prepTime: '1 min', calories: 200 },
  { id: 16, cat: 'Drinks',   name: 'Energy Boost',        desc: 'Glucon-D electrolyte surge',                    price: 90,  emoji: '⚡', popular: false, prepTime: '1 min', calories: 130 },
  { id: 17, cat: 'Desserts', name: 'Gulab Jamun (3 pcs)', desc: 'Soft milk dumplings in rose sugar syrup',       price: 80,  emoji: '🍮', popular: true,  prepTime: '2 min', calories: 320 },
  { id: 18, cat: 'Desserts', name: 'Kulfi (Malai)',        desc: 'Traditional Indian ice cream on a stick',       price: 70,  emoji: '🍦', popular: false, prepTime: '1 min', calories: 210 },
];

const STANDS = [
  { id: 'S7',  name: 'Stand 7',  wait: '~3 min', dist: '120m', open: true  },
  { id: 'S12', name: 'Stand 12', wait: '~1 min', dist: '45m',  open: true  },
  { id: 'S3',  name: 'Stand 3',  wait: '~8 min', dist: '230m', open: false },
];

export default function OrderPage({ addToCart, addToast, stadium, isVerified, ticketRef, onVerified, onUnverify, profile }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]                 = useState('');
  const [selectedStand, setSelectedStand]   = useState('S12');
  const [itemModal, setItemModal]           = useState(null);
  const [qty, setQty]                       = useState(1);
  const [showVerify, setShowVerify]         = useState(false);

  const filtered = MENU.filter(item =>
    (activeCategory === 'All' || item.cat === activeCategory) &&
    (item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase()))
  );
  const popular = MENU.filter(m => m.popular);

  const openItem = (item) => {
    if (!isVerified) { setShowVerify(true); return; }
    setItemModal(item); setQty(1);
  };

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(itemModal);
    addToast(`${qty}× ${itemModal.name} added!`, '🛒');
    setItemModal(null);
  };

  const selectedStandObj = STANDS.find(s => s.id === selectedStand);
  const seatLabel   = profile?.seat || 'Section A14, Row 3, Seat 9';
  const stadiumName = stadium?.name || 'Mumbai Football Arena';

  return (
    <main className="page" aria-label="Order Food">
      {/* Header */}
      <header className="fade-in-up" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 3 }}>🍔 Order Food</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Delivered to your seat · Skip the queue · <span style={{ color: 'var(--accent-blue)' }}>{stadiumName}</span></p>
      </header>

      {/* Desktop 2-col: left panel + right menu */}
      <div className="order-panel">

        {/* LEFT: ticket + seat + stand selector */}
        <div>
          {/* Ticket status */}
          {isVerified ? (
            <div className="fade-in-up anim-delay-1 ticket-verified-banner" style={{ marginBottom: 14, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 22, marginRight: 12 }}>✅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>Ticket Verified</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ref: {ticketRef}</div>
              </div>
              <button onClick={onUnverify} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: 6, color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          ) : (
            <div className="fade-in-up anim-delay-1" style={{ marginBottom: 14 }}>
              <button className="ticket-gate" style={{ width: '100%', cursor: 'pointer' }} onClick={() => setShowVerify(true)}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎟️</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>Verify Your Ticket</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                  Show your ISL e-ticket or booking reference to unlock in-seat food ordering
                </p>
                <div className="btn btn-primary" style={{ margin: '0 auto', display: 'inline-flex' }}>🎟️ Verify Now</div>
              </button>
            </div>
          )}

          {/* Seat info + stand */}
          {isVerified && (
            <div className="fade-in-up anim-delay-2 card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Delivering to</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>📍 {seatLabel}</div>
                </div>
                {isVerified && <span className="badge badge-green">✓ Verified</span>}
              </div>
              <div className="divider" style={{ margin: '10px 0' }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Nearest Pickup Stand</div>
              <div className="stand-selector">
                {STANDS.map(s => (
                  <button key={s.id} onClick={() => s.open && setSelectedStand(s.id)}
                    style={{ flex: 'none', padding: '10px', borderRadius: 12, border: `1.5px solid ${selectedStand === s.id ? 'var(--accent-blue)' : 'var(--border)'}`, background: selectedStand === s.id ? 'rgba(79,158,255,0.12)' : 'var(--bg-card)', opacity: s.open ? 1 : 0.45, cursor: s.open ? 'pointer' : 'not-allowed', textAlign: 'left', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: selectedStand === s.id ? 'var(--accent-blue)' : 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: s.open ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700, marginTop: 2 }}>{s.open ? s.wait : 'Closed'}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.dist}</div>
                  </button>
                ))}
              </div>
              {selectedStandObj && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <span className="live-dot" style={{ width: 6, height: 6 }} /> {selectedStandObj.name} · Wait: {selectedStandObj.wait}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: search + category + menu */}
        <div>
          {/* Search */}
          <div className="fade-in-up anim-delay-2 search-bar" style={{ marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Search vada pav, biryani, lassi…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', color: 'var(--text-muted)', fontSize: 14 }}>✕</button>}
          </div>

          {/* Category pills */}
          <nav className="fade-in-up anim-delay-2 tag-row" aria-label="Menu categories" style={{ marginBottom: 16 }}>
            {CATEGORIES.map(c => (
              <button key={c} className={`tag ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)} aria-pressed={activeCategory === c}>{c}</button>
            ))}
          </nav>

          {/* Popular picks */}
          {activeCategory === 'All' && !search && (
            <div className="fade-in-up anim-delay-3" style={{ marginBottom: 20 }}>
              <div className="section-header">
                <div className="section-title">⭐ Popular Picks</div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>← swipe →</span>
              </div>
              <div className="popular-row">
                {popular.map(item => (
                  <button key={item.id} onClick={() => openItem(item)}
                    style={{ flex: 'none', width: 140, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 34, marginBottom: 6 }}>{item.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2, color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>⏱ {item.prepTime}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--accent-green)' }}>₹{item.price}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full menu */}
          <section className="fade-in-up anim-delay-4" aria-label="Full menu">
            <div className="section-header">
              <div className="section-title">{activeCategory === 'All' ? '🍽️ Full Menu' : activeCategory}</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{filtered.length} items</span>
            </div>
            <div className="menu-list">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-title">Nothing found</div>
                  <div className="empty-sub">Try a different category or search</div>
                </div>
              ) : filtered.map(item => (
                <button key={item.id} onClick={() => openItem(item)}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 36, flexShrink: 0 }}>{item.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</span>
                      {item.popular && <span className="badge badge-purple" style={{ fontSize: 9, padding: '2px 6px' }}>Popular</span>}
                      {!isVerified && <span className="badge badge-orange" style={{ fontSize: 9, padding: '2px 6px' }}>🔒</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>⏱ {item.prepTime}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.calories} cal</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent-green)', marginBottom: 8 }}>₹{item.price}</div>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: isVerified ? 'var(--accent-blue)' : 'rgba(255,140,66,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, boxShadow: isVerified ? '0 2px 12px rgba(79,158,255,0.35)' : 'none' }}>
                      {isVerified ? '+' : '🔒'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Item modal */}
      {itemModal && (
        <div className="modal-overlay" onClick={() => setItemModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 64, marginBottom: 10 }}>{itemModal.emoji}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {itemModal.popular && <span className="badge badge-purple">⭐ Popular</span>}
                <span className="badge badge-blue">⏱ {itemModal.prepTime}</span>
                <span className="badge badge-green">{itemModal.calories} cal</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>{itemModal.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{itemModal.desc}</p>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600 }}>Price per item</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-green)' }}>₹{itemModal.price}</div>
              </div>
              <div className="qty-counter">
                <button className="qty-btn" onClick={() => qty > 1 && setQty(q => q - 1)}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>
            <button className="btn btn-success btn-full" style={{ height: 50, fontSize: 15 }} onClick={handleAdd}>
              Add {qty} to Cart · ₹{itemModal.price * qty}
            </button>
          </div>
        </div>
      )}

      {showVerify && (
        <TicketVerify stadium={stadium} seat={seatLabel}
          onVerified={(ref) => { onVerified(ref); setShowVerify(false); }}
          onClose={() => setShowVerify(false)} />
      )}
    </main>
  );
}
