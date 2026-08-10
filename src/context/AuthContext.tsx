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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword
} from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch role and details from Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          if (data.targetStoreUid) {
            const targetSnap = await getDoc(doc(db, 'users', data.targetStoreUid));
            if (targetSnap.exists()) {
              setProfile({ ...targetSnap.data(), uid: data.targetStoreUid } as UserProfile);
            } else {
              setProfile(data);
            }
          } else {
            setProfile(data);
          }
        } else {
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Mağaza Kullanıcısı',
            role: 'store',
            isBanned: false
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
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

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      return;
    } catch (err: any) {
      // Fallback for Store vendors whose webPassword was assigned by Admin in Firestore
      const usersRef = collection(db, 'users');
      const q1 = query(usersRef, where('webEmail', '==', cleanEmail));
      const q2 = query(usersRef, where('email', '==', cleanEmail));
      
      let snap = await getDocs(q1);
      if (snap.empty) {
        snap = await getDocs(q2);
      }

      if (!snap.empty) {
        const matchDoc = snap.docs.find(d => {
          const data = d.data();
          return (data.webPassword === cleanPass || data.password === cleanPass);
        });

        if (matchDoc) {
          const SECONDARY_APP_NAME = 'StoreAuthSecondaryApp';
          let secondaryApp;
          if (getApps().some(a => a.name === SECONDARY_APP_NAME)) {
            secondaryApp = getApp(SECONDARY_APP_NAME);
          } else {
            secondaryApp = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
          }
          const secondaryAuth = getAuth(secondaryApp);

          try {
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPass);
            const newUid = userCred.user.uid;
            await secondaryAuth.signOut();

            // Link targetStoreUid to secondary doc
            await setDoc(doc(db, 'users', newUid), {
              accountType: 'store',
              storeStatus: 'approved',
              isVerifiedStore: true,
              webEmail: cleanEmail,
              webPassword: cleanPass,
              email: cleanEmail,
              targetStoreUid: matchDoc.id,
              updatedAt: new Date().toISOString(),
            }, { merge: true });

            await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
            return;
          } catch (authErr: any) {
            if (authErr.code === 'auth/email-already-in-use') {
              const dData = matchDoc.data();
              const testPasses = [
                cleanPass,
                dData.webPassword,
                dData.password,
                '123456',
                'Mağaza123456!',
              ].filter(Boolean);

              for (const testP of testPasses) {
                try {
                  const cred = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, testP as string);
                  if (testP !== cleanPass) {
                    await updatePassword(cred.user, cleanPass);
                  }
                  await secondaryAuth.signOut();
                  await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
                  return;
                } catch (e) {}
              }
            }
          }
        }
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
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
