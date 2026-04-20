/**
 * Test Suite 3 – AuthContext helpers (pure logic, no Firebase calls)
 * Tests the friendlyError map and buildUserDoc defaults that are
 * exported / reproducible via the same logic.
 */
import { describe, it, expect } from 'vitest';
import { ISL_TEAMS } from '../contexts/AuthContext';

/* ── Replicate pure helpers from AuthContext for isolated testing ── */
function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':   'This email is already registered. Try signing in.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/too-many-requests':      'Too many attempts. Please wait a moment.',
    'auth/popup-closed-by-user':   'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential':     'Incorrect email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

function buildUserDoc(overrides = {}) {
  return {
    name:          overrides.name          || 'ISL Fan',
    email:         overrides.email         || '',
    phone:         overrides.phone         || '',
    homeStadium:   overrides.homeStadium   || '',
    favouriteTeam: overrides.favouriteTeam || '',
    fanId:         `FAN-ISL-${Date.now().toString().slice(-6)}`,
    fanPoints:     0,
    avatar:        overrides.avatar        || '😄',
    createdAt:     new Date().toISOString(),
  };
}

/* ── Cart utility (mirrors App.jsx logic) ── */
function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}
function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}
function addToCart(existingCart, item) {
  const ex = existingCart.find((c) => c.id === item.id);
  if (ex) return existingCart.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
  return [...existingCart, { ...item, qty: 1 }];
}
function removeFromCart(existingCart, id) {
  const ex = existingCart.find((c) => c.id === id);
  if (ex?.qty > 1) return existingCart.map((c) => c.id === id ? { ...c, qty: c.qty - 1 } : c);
  return existingCart.filter((c) => c.id !== id);
}

/* ── Navigation ORDER helper ── */
const PAGE_ORDER = ['home', 'order', 'map', 'cart', 'profile'];
function slideDirection(from, to) {
  return PAGE_ORDER.indexOf(to) >= PAGE_ORDER.indexOf(from) ? 'left' : 'right';
}

// ─────────────────────────────────────────────────────────────────────────────

describe('friendlyError – maps Firebase error codes', () => {
  it('TEST 13 – correct message for email-already-in-use', () => {
    expect(friendlyError('auth/email-already-in-use')).toBe(
      'This email is already registered. Try signing in.'
    );
  });

  it('TEST 14 – correct message for wrong-password', () => {
    expect(friendlyError('auth/wrong-password')).toBe(
      'Incorrect password. Please try again.'
    );
  });

  it('TEST 15 – fallback message for unknown code', () => {
    expect(friendlyError('auth/some-unknown-code')).toBe(
      'Something went wrong. Please try again.'
    );
  });
});

describe('buildUserDoc – default user document', () => {
  it('TEST 16 – defaults name to ISL Fan when not provided', () => {
    const doc = buildUserDoc();
    expect(doc.name).toBe('ISL Fan');
  });

  it('TEST 17 – overrides are applied correctly', () => {
    const doc = buildUserDoc({ name: 'Rahul', email: 'rahul@test.com' });
    expect(doc.name).toBe('Rahul');
    expect(doc.email).toBe('rahul@test.com');
  });

  it('TEST 18 – fanPoints always starts at 0', () => {
    const doc = buildUserDoc({ fanPoints: 999 }); // override ignored
    expect(doc.fanPoints).toBe(0);
  });

  it('TEST 19 – fanId matches expected format FAN-ISL-XXXXXX', () => {
    const doc = buildUserDoc();
    expect(doc.fanId).toMatch(/^FAN-ISL-\d{6}$/);
  });

  it('TEST 20 – createdAt is a valid ISO date string', () => {
    const doc = buildUserDoc();
    expect(new Date(doc.createdAt).toString()).not.toBe('Invalid Date');
  });
});

describe('ISL_TEAMS list', () => {
  it('TEST 21 – contains at least 10 teams', () => {
    expect(ISL_TEAMS.length).toBeGreaterThanOrEqual(10);
  });

  it('TEST 22 – every entry is a non-empty string', () => {
    ISL_TEAMS.forEach((team) => {
      expect(typeof team).toBe('string');
      expect(team.length).toBeGreaterThan(0);
    });
  });
});

describe('Cart logic helpers (from App.jsx)', () => {
  const sampleItem = { id: 'burger', name: 'Burger', price: 120 };
  const sampleItem2 = { id: 'cola', name: 'Cola', price: 60 };

  it('TEST 23 – addToCart adds new item with qty 1', () => {
    const cart = addToCart([], sampleItem);
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(1);
  });

  it('TEST 24 – addToCart increments qty for existing item', () => {
    const cart = addToCart([{ ...sampleItem, qty: 1 }], sampleItem);
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(2);
  });

  it('TEST 25 – removeFromCart decrements qty when qty > 1', () => {
    const cart = removeFromCart([{ ...sampleItem, qty: 3 }], sampleItem.id);
    expect(cart[0].qty).toBe(2);
  });

  it('TEST 26 – removeFromCart removes item when qty === 1', () => {
    const cart = removeFromCart([{ ...sampleItem, qty: 1 }], sampleItem.id);
    expect(cart).toHaveLength(0);
  });

  it('TEST 27 – cartTotal calculates correctly', () => {
    const cart = [
      { ...sampleItem, qty: 2 },   // 2 × 120 = 240
      { ...sampleItem2, qty: 1 },  // 1 × 60  = 60
    ];
    expect(cartTotal(cart)).toBe(300);
  });

  it('TEST 28 – cartCount sums all quantities', () => {
    const cart = [
      { ...sampleItem, qty: 3 },
      { ...sampleItem2, qty: 2 },
    ];
    expect(cartCount(cart)).toBe(5);
  });
});

describe('Navigation – slide direction', () => {
  it('TEST 29 – navigating forward returns left', () => {
    expect(slideDirection('home', 'order')).toBe('left');
  });

  it('TEST 30 – navigating backward returns right', () => {
    expect(slideDirection('cart', 'map')).toBe('right');
  });

  it('TEST 31 – navigating to same page returns left', () => {
    expect(slideDirection('home', 'home')).toBe('left');
  });
});
