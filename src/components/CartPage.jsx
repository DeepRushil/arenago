import { useState } from 'react';

const STEPS = [
  { label: 'Order placed',              done: true,  time: '',         icon: '✅' },
  { label: 'Being prepared by kitchen', done: true,  time: '',         icon: '👨‍🍳' },
  { label: 'On the way to your seat',   done: false, time: 'Est. ~6 min', icon: '🏃' },
  { label: 'Delivered to seat',         done: false, time: '',         icon: '📍' },
];

export default function CartPage({ cart, cartTotal, removeFromCart, clearCart, addToast, setActivePage, addOrder, stadium, profile, currentUser }) {
  const [placed,  setPlaced]  = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [placedAt, setPlacedAt] = useState('');

  const deliveryFee = cart.length > 0 ? 50 : 0;
  const totalBill   = cartTotal + deliveryFee;
  const seatLabel   = profile?.seat || 'Section A14, Row 3, Seat 9';
  const stadiumName = stadium?.name  || 'Mumbai Football Arena';

  const placeOrder = () => {
    if (!currentUser) {
      addToast('Please sign in to place an order', '🔒');
      setActivePage('profile');
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      const id = `#SG-${Math.floor(1000 + Math.random() * 8999)}`;
      const at = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setOrderId(id); setPlacedAt(at); setPlaced(true); setPlacing(false);
      addOrder({ id, placedAt: at, items: [...cart], total: totalBill, status: 'preparing', stadium: stadiumName, seat: seatLabel });
      addToast(`Order ${id} confirmed! 🎉`, '🎉');
    }, 1600);
  };

  const reset = () => { clearCart(); setPlaced(false); setOrderId(''); setActivePage('order'); };

  /* ---- Tracker ---- */
  if (placed) {
    return (
      <main className="page" aria-label="Order Tracker">
        <header className="fade-in-up" style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 3 }}>📦 Order Tracker</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your food is on its way — enjoy the match! ⚽</p>
        </header>

        <div className="cart-layout">
          {/* Left: ref + tracker */}
          <div>
            <div className="fade-in-up anim-delay-1 card" style={{ textAlign: 'center', marginBottom: 16, padding: 24 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Order Reference</div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2, color: 'var(--accent-cyan)' }}>{orderId}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Placed at {placedAt} · {stadiumName}</div>
            </div>

            <div className="fade-in-up anim-delay-2 card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3 }}>Delivering to</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>📍 {seatLabel}</div>
              <div style={{ fontSize: 11, color: 'var(--accent-green)', marginTop: 4, fontWeight: 600 }}>via Stand 12 (nearest)</div>
            </div>

            <div className="fade-in-up anim-delay-3 card">
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Delivery Progress</div>
              {STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < STEPS.length - 1 ? 14 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: step.done ? 'var(--accent-green)' : 'var(--bg-card)', border: `2px solid ${step.done ? 'var(--accent-green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: step.done ? '#000' : 'var(--text-muted)' }}>
                      {step.done ? '✓' : step.icon}
                    </div>
                    {i < STEPS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 18, background: step.done ? 'var(--accent-green)' : 'var(--border)', marginTop: 4, borderRadius: 1 }} />}
                  </div>
                  <div style={{ paddingTop: 6, paddingBottom: i < STEPS.length - 1 ? 14 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: step.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                    {step.time && <div style={{ fontSize: 11, color: 'var(--accent-orange)', marginTop: 2, fontWeight: 600 }}>{step.time}</div>}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)' }}>
                <div style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 700 }}>🚀 Estimated delivery: 6–8 minutes</div>
              </div>
            </div>
          </div>

          {/* Right: items summary */}
          <div>
            <div className="fade-in-up anim-delay-4 card">
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Items Ordered</div>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.emoji} {item.qty}× {item.name}</span>
                  <span style={{ fontWeight: 700 }}>₹{item.price * item.qty}</span>
                </div>
              ))}
              <div className="divider" style={{ margin: '10px 0' }} />
              <div className="info-row"><span className="label">Delivery fee</span><span className="val">₹{deliveryFee}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 15, fontWeight: 900 }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--accent-green)' }}>₹{totalBill}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-full" style={{ marginTop: 12 }} onClick={reset}>← Order More Food</button>
          </div>
        </div>
      </main>
    );
  }

  /* ---- Cart View ---- */
  return (
    <main className="page" aria-label="Shopping Cart">
      <header className="fade-in-up" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 3 }}>🛒 My Cart</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {cart.length === 0 ? 'Your cart is empty' : `${cart.reduce((s, i) => s + i.qty, 0)} items · ${stadiumName}`}
        </p>
      </header>

      {cart.length === 0 ? (
        <div className="fade-in-up card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🍽️</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Nothing here yet</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            Browse the ISL menu and order food at your seat — no stampedes, no queues!
          </p>
          <button className="btn btn-primary" onClick={() => setActivePage('order')}>🍔 Browse Menu</button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left: items */}
          <section aria-label="Cart items">
            <div className="fade-in-up anim-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cart.map(item => (
                <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 36, flexShrink: 0 }}>{item.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>₹{item.price} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="qty-counter">
                      <button className="qty-btn" onClick={() => removeFromCart(item.id)}>−</button>
                      <span className="qty-value">{item.qty}</span>
                      <button className="qty-btn" onClick={() => addToast('Tap menu item to add more', '💡')}>+</button>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--accent-green)', minWidth: 52, textAlign: 'right' }}>₹{item.price * item.qty}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right: summary + CTA */}
          <aside aria-label="Order summary">
            <div className="fade-in-up anim-delay-2 card" style={{ marginBottom: 14 }}>
              <div className="info-row"><span className="label">Subtotal</span><span className="val">₹{cartTotal}</span></div>
              <div className="info-row"><span className="label">Delivery to seat</span><span className="val" style={{ color: 'var(--accent-orange)' }}>₹{deliveryFee}</span></div>
              <div className="divider" style={{ margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ fontWeight: 900 }}>Total</span>
                <span style={{ fontWeight: 900, color: 'var(--accent-green)', fontSize: 20 }}>₹{totalBill}</span>
              </div>
            </div>

            <div className="fade-in-up anim-delay-3" style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 22 }}>📍</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{seatLabel}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Est. 6–8 min · No queue needed</div>
              </div>
            </div>

            <div className="fade-in-up anim-delay-4" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className={`btn ${currentUser ? 'btn-success' : 'btn-primary'} btn-full`} style={{ height: 52, fontSize: 16 }} onClick={placeOrder} disabled={placing}>
                {placing ? <><span className="spinner" style={{ color: '#001a0d' }} /> Placing Order…</> : currentUser ? `✅ Place Order · ₹${totalBill}` : '🔒 Sign in to place order'}
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => { clearCart(); addToast('Cart cleared', '🗑️'); }}>
                🗑️ Clear Cart
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
