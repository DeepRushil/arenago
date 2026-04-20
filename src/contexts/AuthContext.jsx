import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as fbUpdateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db, IS_FIREBASE_CONFIGURED } from '../firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/* ─── ISL Teams list for sign-up ─── */
export const ISL_TEAMS = [
  'Mumbai City FC', 'Kerala Blasters FC', 'ATK Mohun Bagan',
  'Bengaluru FC', 'FC Goa', 'Hyderabad FC',
  'Chennaiyin FC', 'NorthEast United FC', 'Jamshedpur FC', 'Odisha FC',
];

/**
 * Sanitizes user-provided strings: trims whitespace and enforces max length.
 * Prevents excessively long input from reaching Firestore.
 * @param {string} str - Raw input value
 * @param {number} [maxLen=200] - Maximum allowed character length
 * @returns {string} Sanitized string
 */
function sanitize(str, maxLen = 200) {
  return String(str ?? '').trim().slice(0, maxLen);
}

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param {string} code - Firebase error code (e.g. "auth/wrong-password")
 * @returns {string} Human-readable error message
 */
export function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':    'This email is already registered. Try signing in.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/too-many-requests':       'Too many attempts. Please wait a moment.',
    'auth/popup-closed-by-user':    'Google sign-in was cancelled.',
    'auth/network-request-failed':  'Network error. Check your connection.',
    'auth/invalid-credential':      'Incorrect email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

/**
 * Builds a default Firestore user document from optional overrides.
 * @param {object} [overrides] - Fields to override defaults
 * @returns {object} Firestore-ready user document
 */
function buildUserDoc(overrides = {}) {
  return {
    name:          sanitize(overrides.name || 'ISL Fan', 80),
    email:         sanitize(overrides.email || '', 254),
    phone:         sanitize(overrides.phone || '', 20),
    homeStadium:   sanitize(overrides.homeStadium || '', 100),
    favouriteTeam: sanitize(overrides.favouriteTeam || '', 100),
    fanId:         `FAN-ISL-${Date.now().toString().slice(-6)}`,
    fanPoints:     0,
    avatar:        overrides.avatar || '😄',
    createdAt:     new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [currentUser,  setCurrentUser]  = useState(null);
  const [userProfile,  setUserProfile]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [authError,    setAuthError]    = useState('');

  /** Fetch the user's Firestore profile document */
  const fetchProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) setUserProfile(snap.data());
    } catch { /* offline / security rules */ }
  };

  /**
   * Creates a new user account with email/password and saves profile to Firestore.
   * @param {string} email
   * @param {string} password
   * @param {object} profileData - { name, phone, homeStadium, favouriteTeam }
   */
  const signup = async (email, password, profileData) => {
    setAuthError('');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await fbUpdateProfile(cred.user, { displayName: sanitize(profileData.name, 80) });
    const userDoc = buildUserDoc({ email: sanitize(email, 254), ...profileData });
    await setDoc(doc(db, 'users', cred.user.uid), userDoc);
    setUserProfile(userDoc);
    return cred;
  };

  /**
   * Signs in an existing user with email and password.
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    setAuthError('');
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Signs in via Google OAuth popup. Creates a Firestore profile if first login.
   */
  const loginWithGoogle = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const ref   = doc(db, 'users', cred.user.uid);
    const snap  = await getDoc(ref);
    if (!snap.exists()) {
      const userDoc = buildUserDoc({
        name:  cred.user.displayName || 'ISL Fan',
        email: cred.user.email,
      });
      await setDoc(ref, userDoc);
      setUserProfile(userDoc);
    }
    return cred;
  };

  /**
   * Sends a password reset email.
   * @param {string} email
   */
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  /** Signs out the current user and clears local profile state. */
  const logout = () => { setUserProfile(null); return signOut(auth); };

  /**
   * Updates the current user's Firestore profile fields.
   * All string fields are sanitized before writing.
   * @param {object} data - Partial profile fields to update
   */
  const updateUserProfile = async (data) => {
    if (!currentUser) return;
    const sanitized = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? sanitize(v) : v])
    );
    await updateDoc(doc(db, 'users', currentUser.uid), sanitized);
    setUserProfile(prev => ({ ...prev, ...sanitized }));
  };

  /**
   * Persists a completed order to Firestore under the current user's ID.
   * @param {object} order - Order object from CartPage
   */
  const saveOrder = async (order) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'orders'), {
        ...order,
        userId:    currentUser.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (e) { console.warn('[ArenaGO] Order save failed:', e.message); }
  };

  /**
   * Loads all orders for the current user from Firestore, sorted newest first.
   * @returns {Promise<Array>} Array of order documents
   */
  const loadOrders = async () => {
    if (!currentUser) return [];
    try {
      const q    = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data());
      return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch { return []; }
  };

  /* Auth state listener */
  useEffect(() => {
    if (!IS_FIREBASE_CONFIGURED) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) await fetchProfile(user.uid);
      else      setUserProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser, userProfile,
    signup, login, loginWithGoogle, logout,
    resetPassword, updateUserProfile,
    saveOrder, loadOrders,
    loading, authError, setAuthError,
    friendlyError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
