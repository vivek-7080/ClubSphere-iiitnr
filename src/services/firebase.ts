import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Club, ClubApplication, ClubMember, AppUser } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with designated database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Connection verification (Mandatory skill check)
export async function verifyFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Successfully connected to remote Firestore database.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Remote connection offline, falling back to local cache.');
    }
  }
}
verifyFirestoreConnection();

/* ============================================================
   FIRESTORE CLOUD COLLECTIONS & SYNC SERVICES
   ============================================================ */

const CLUBS_COLLECTION = 'clubs';
const APPLICATIONS_COLLECTION = 'applications';
const MEMBERS_COLLECTION = 'members';
const USERS_COLLECTION = 'users';

// --- CLUBS ---
export async function syncClubToCloud(club: Club): Promise<void> {
  try {
    await setDoc(doc(db, CLUBS_COLLECTION, club.id), club, { merge: true });
  } catch (e) {
    console.error(`[Firebase] Failed to sync club ${club.id}:`, e);
  }
}

export async function deleteClubFromCloud(clubId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CLUBS_COLLECTION, clubId));
  } catch (e) {
    console.error(`[Firebase] Failed to delete club ${clubId}:`, e);
  }
}

export function subscribeToClubs(onUpdate: (clubs: Club[]) => void) {
  const colRef = collection(db, CLUBS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remoteClubs = snapshot.docs.map((d) => d.data() as Club);
        onUpdate(remoteClubs);
      }
    },
    (err) => {
      console.warn('[Firebase] Clubs subscription error:', err);
    }
  );
}

// --- APPLICATIONS ---
export async function syncApplicationToCloud(app: ClubApplication): Promise<void> {
  try {
    await setDoc(doc(db, APPLICATIONS_COLLECTION, app.id), app, { merge: true });
  } catch (e) {
    console.error(`[Firebase] Failed to sync application ${app.id}:`, e);
  }
}

export async function deleteApplicationFromCloud(appId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, APPLICATIONS_COLLECTION, appId));
  } catch (e) {
    console.error(`[Firebase] Failed to delete application ${appId}:`, e);
  }
}

export function subscribeToApplications(onUpdate: (apps: ClubApplication[]) => void) {
  const colRef = collection(db, APPLICATIONS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remoteApps = snapshot.docs.map((d) => d.data() as ClubApplication);
        onUpdate(remoteApps);
      }
    },
    (err) => {
      console.warn('[Firebase] Applications subscription error:', err);
    }
  );
}

// --- MEMBERS ---
export async function syncMemberToCloud(member: ClubMember): Promise<void> {
  try {
    await setDoc(doc(db, MEMBERS_COLLECTION, member.id), member, { merge: true });
  } catch (e) {
    console.error(`[Firebase] Failed to sync member ${member.id}:`, e);
  }
}

export async function deleteMemberFromCloud(memberId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, MEMBERS_COLLECTION, memberId));
  } catch (e) {
    console.error(`[Firebase] Failed to delete member ${memberId}:`, e);
  }
}

export function subscribeToMembers(onUpdate: (members: ClubMember[]) => void) {
  const colRef = collection(db, MEMBERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remoteMembers = snapshot.docs.map((d) => d.data() as ClubMember);
        onUpdate(remoteMembers);
      }
    },
    (err) => {
      console.warn('[Firebase] Members subscription error:', err);
    }
  );
}

// --- INITIAL SEEDING HELPER ---
// If the remote Firestore collections are completely fresh, seed them with campus data
export async function seedInitialFirestoreData(
  initialClubs: Club[],
  initialApplications: ClubApplication[],
  initialMembers: ClubMember[]
) {
  try {
    const clubsSnap = await getDocs(collection(db, CLUBS_COLLECTION));
    if (clubsSnap.empty) {
      console.log('[Firebase] Seeding initial clubs to remote Firestore...');
      for (const club of initialClubs) {
        await setDoc(doc(db, CLUBS_COLLECTION, club.id), club);
      }
    }

    const appsSnap = await getDocs(collection(db, APPLICATIONS_COLLECTION));
    if (appsSnap.empty) {
      console.log('[Firebase] Seeding initial candidate applications to remote Firestore...');
      for (const app of initialApplications) {
        await setDoc(doc(db, APPLICATIONS_COLLECTION, app.id), app);
      }
    }

    const membersSnap = await getDocs(collection(db, MEMBERS_COLLECTION));
    if (membersSnap.empty) {
      console.log('[Firebase] Seeding initial members roster to remote Firestore...');
      for (const member of initialMembers) {
        await setDoc(doc(db, MEMBERS_COLLECTION, member.id), member);
      }
    }
  } catch (e) {
    console.warn('[Firebase] Seeding note (may be read-only or offline):', e);
  }
}
