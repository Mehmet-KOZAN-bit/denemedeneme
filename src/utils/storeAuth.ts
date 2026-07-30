import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
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

  let createdAuthUid = userUid;

  try {
    // 1. Try creating new Auth user for store
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, webEmail, webPass);
    createdAuthUid = userCredential.user.uid;
    await secondaryAuth.signOut();
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      // If email exists, try signing in secondary instance to update password
      try {
        const cred = await signInWithEmailAndPassword(secondaryAuth, webEmail, webPass);
        createdAuthUid = cred.user.uid;
        await secondaryAuth.signOut();
      } catch (signInErr: any) {
        console.log('Account exists with different password, proceeding with Firestore update.');
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
    webEmail: webEmail.trim(),
    webPassword: webPass.trim(),
    email: webEmail.trim(),
    updatedAt: now,
  }, { merge: true });

  // 3. If createdAuthUid is different from userUid (e.g. mobile UID vs web Auth UID), sync secondary doc
  if (createdAuthUid && createdAuthUid !== userUid) {
    await setDoc(doc(db, 'users', createdAuthUid), {
      accountType: 'store',
      storeStatus: 'approved',
      isVerifiedStore: true,
      webEmail: webEmail.trim(),
      webPassword: webPass.trim(),
      email: webEmail.trim(),
      targetStoreUid: userUid,
      updatedAt: now,
    }, { merge: true });
  }

  return { success: true, createdAuthUid };
}
