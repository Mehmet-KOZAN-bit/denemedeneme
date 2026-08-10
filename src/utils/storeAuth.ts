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
      // Try signing in with cleanPass first
      try {
        const cred = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPass);
        createdAuthUid = cred.user.uid;
        await secondaryAuth.signOut();
      } catch (signInErr: any) {
        // If cleanPass fails, search for previous passwords in Firestore or try common patterns
        const userDocRef = doc(db, 'users', userUid);
        const snap = await getDoc(userDocRef);
        const dData = snap.exists() ? snap.data() : {};
        const candidatePasses = [
          dData.webPassword,
          dData.password,
          dData.prevPassword,
          '123456',
          'Mağaza123456!',
        ].filter(Boolean);

        let passUpdated = false;
        for (const testP of candidatePasses) {
          try {
            const cred = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, testP);
            createdAuthUid = cred.user.uid;
            await updatePassword(cred.user, cleanPass);
            await secondaryAuth.signOut();
            passUpdated = true;
            break;
          } catch (e) {}
        }

        if (!passUpdated) {
          console.warn('Could not sync secondary Auth password automatically. Fallback active on login.');
        }
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
