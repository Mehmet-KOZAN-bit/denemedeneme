'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase Client
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'store' | 'user' | string;
  accountType?: 'store' | 'individual' | string;
  storeStatus?: 'pending' | 'approved' | 'rejected';
  isVerifiedStore?: boolean;
  storeInfo?: {
    storeName?: string;
    storeType?: string;
    city?: string;
    district?: string;
    phone?: string;
    taxId?: string;
    address?: string;
    photoURL?: string;
    storeLogo?: string;
    logoUrl?: string;
  };
  photoURL?: string;
  photoUrl?: string;
  targetStoreUid?: string;
  webEmail?: string;
  webPassword?: string;
  isBanned: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local store session storage on mount
    const checkSavedSession = async () => {
      const savedStr = typeof window !== 'undefined' 
        ? (sessionStorage.getItem('adabazaar_store_session') || localStorage.getItem('adabazaar_store_session'))
        : null;

      if (savedStr) {
        try {
          const sess = JSON.parse(savedStr);
          if (sess?.storeUid) {
            const userRef = doc(db, 'users', sess.storeUid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              const storeName = data.storeInfo?.storeName || data.displayName || 'Mağaza Kullanıcısı';
              setUser({
                uid: sess.storeUid,
                email: sess.email || data.email || data.webEmail || '',
                displayName: storeName,
                photoURL: data.photoURL || data.storeInfo?.storeLogo || null,
              } as any);
              setProfile({ ...data, uid: sess.storeUid } as UserProfile);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Saved store session parse note:', e);
        }
      }
    };

    checkSavedSession();

    // 2. Listen to standard Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          if (data.targetStoreUid) {
            const targetSnap = await getDoc(doc(db, 'users', data.targetStoreUid));
            if (targetSnap.exists()) {
              setProfile({ ...targetSnap.data(), uid: data.targetStoreUid } as UserProfile);
            } else {
              setProfile({ ...data, uid: currentUser.uid } as UserProfile);
            }
          } else {
            setProfile({ ...data, uid: currentUser.uid } as UserProfile);
          }
        } else {
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Mağaza Kullanıcısı',
            role: 'store',
            accountType: 'store',
            storeStatus: 'approved',
            isVerifiedStore: true,
            isBanned: false
          });
        }
        setLoading(false);
      } else {
        const savedStr = typeof window !== 'undefined' 
          ? (sessionStorage.getItem('adabazaar_store_session') || localStorage.getItem('adabazaar_store_session'))
          : null;
        if (!savedStr) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Check Firestore FIRST for store vendor matching credentials (bypasses Firebase Auth rate limits)
    try {
      const usersRef = collection(db, 'users');
      const q1 = query(usersRef, where('webEmail', '==', cleanEmail));
      const q2 = query(usersRef, where('email', '==', cleanEmail));

      let snap = await getDocs(q1);
      if (snap.empty) {
        snap = await getDocs(q2);
      }
      if (snap.empty) {
        snap = await getDocs(usersRef);
      }

      if (!snap.empty) {
        const matchDoc = snap.docs.find(d => {
          const data = d.data();
          const emailMatch = 
            (data.webEmail && data.webEmail.toLowerCase().trim() === cleanEmail) ||
            (data.email && data.email.toLowerCase().trim() === cleanEmail);
          const passMatch = 
            (data.webPassword && data.webPassword.trim() === cleanPass) ||
            (data.password && data.password.trim() === cleanPass);

          return emailMatch && passMatch;
        });

        if (matchDoc) {
          const storeData = matchDoc.data();
          const storeUid = matchDoc.id;
          const storeName = storeData.storeInfo?.storeName || storeData.displayName || 'Mağaza Kullanıcısı';

          const syntheticUser = {
            uid: storeUid,
            email: cleanEmail,
            displayName: storeName,
            photoURL: storeData.photoURL || storeData.storeInfo?.storeLogo || null,
          };

          if (typeof window !== 'undefined') {
            sessionStorage.setItem('adabazaar_store_session', JSON.stringify({
              storeUid,
              email: cleanEmail,
              displayName: storeName,
              photoURL: syntheticUser.photoURL,
            }));
            localStorage.setItem('adabazaar_store_session', JSON.stringify({
              storeUid,
              email: cleanEmail,
              displayName: storeName,
              photoURL: syntheticUser.photoURL,
            }));
          }

          setUser(syntheticUser as any);
          setProfile({ ...storeData, uid: storeUid } as UserProfile);
          setLoading(false);
          return;
        }
      }
    } catch (fsErr) {
      console.warn('Firestore store credential check note:', fsErr);
    }

    // 2. Fallback to standard Firebase Auth login (for Admins / Standard Users)
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      return;
    } catch (err: any) {
      let friendlyMsg = 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
      if (err?.code === 'auth/too-many-requests') {
        friendlyMsg = 'Çok fazla hatalı giriş denemesi yapıldı. Lütfen 1-2 dakika bekleyip tekrar deneyin.';
      } else if (err?.code === 'auth/invalid-email') {
        friendlyMsg = 'Geçersiz e-posta adresi formatı.';
      }
      throw new Error(friendlyMsg);
    }
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adabazaar_store_session');
      localStorage.removeItem('adabazaar_store_session');
    }
    setUser(null);
    setProfile(null);
    await signOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
