import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../context/AuthContext';

const SECONDARY_APP_NAME = 'StoreAuthSecondaryApp';

export async function createOrUpdateStoreWebCredentials(
  userUid: string,
  webEmail: string,
  webPass: string
) {
  const primaryApp = getApps()[0];
  const config = primaryApp.options;

  let secondaryApp;
  if (getApps().some(a => a.name === SECONDARY_APP_NAME)) {
    secondaryApp = getApp(SECONDARY_APP_NAME);
  } else {
    secondaryApp = initializeApp(config, SECONDARY_APP_NAME);
  }

  const secondaryAuth = getAuth(secondaryApp);
  const cleanEmail = webEmail.trim().toLowerCase();
  const cleanPass = webPass.trim();

  let createdAuthUid = userUid;

  try {
    // 1. Try creating new Auth user for store
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPass);
    createdAuthUid = userCredential.user.uid;
    await secondaryAuth.signOut();
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      // If email exists, try signing in with old stored password and update to new password
      try {
        const userDocRef = doc(db, 'users', userUid);
        const snap = await getDoc(userDocRef);
        const prevPass = snap.exists() ? (snap.data().webPassword || snap.data().password) : null;
        
        if (prevPass) {
          const cred = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, prevPass);
          createdAuthUid = cred.user.uid;
          await updatePassword(cred.user, cleanPass);
          await secondaryAuth.signOut();
        } else {
          const cred = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPass);
          createdAuthUid = cred.user.uid;
          await secondaryAuth.signOut();
        }
      } catch (signInErr: any) {
        console.log('Existing auth account password update notice:', signInErr.message);
      }
    } else {
      console.warn('Firebase Auth user creation note:', err.message);
    }
  }

  const now = new Date().toISOString();

  // 2. Update primary user document in Firestore with web credentials and store approval status
  await setDoc(doc(db, 'users', userUid), {
    accountType: 'store',
    storeStatus: 'approved',
    isVerifiedStore: true,
    webEmail: cleanEmail,
    webPassword: cleanPass,
    email: cleanEmail,
    updatedAt: now,
  }, { merge: true });

  // 3. If createdAuthUid is different from userUid, sync secondary doc with targetStoreUid
  if (createdAuthUid && createdAuthUid !== userUid) {
    await setDoc(doc(db, 'users', createdAuthUid), {
      accountType: 'store',
      storeStatus: 'approved',
      isVerifiedStore: true,
      webEmail: cleanEmail,
      webPassword: cleanPass,
      email: cleanEmail,
      targetStoreUid: userUid,
      updatedAt: now,
    }, { merge: true });
  }

  return { success: true, createdAuthUid };
}
