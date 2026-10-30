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
import { Club, ClubApplication, ClubMember, AppUser, Announcement } from '../types';
import { CLUBS_DATA } from '../data/clubsData';
import { ANNOUNCEMENTS_DATA } from '../data/announcementsData';

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
const ANNOUNCEMENTS_COLLECTION = 'announcements';

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
        const remoteIds = new Set(remoteClubs.map((c) => c.id));
        // Retain any standard campus societies if remote currently has only a subset
        const missing = CLUBS_DATA.filter((c) => !remoteIds.has(c.id));
        onUpdate([...remoteClubs, ...missing]);
      } else {
        onUpdate(CLUBS_DATA);
      }
    },
    (err) => {
      console.warn('[Firebase] Clubs subscription error:', err);
      onUpdate(CLUBS_DATA);
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

// --- ANNOUNCEMENTS & NOTICE BOARD ---
export async function syncAnnouncementToCloud(ann: Announcement): Promise<void> {
  try {
    await setDoc(doc(db, ANNOUNCEMENTS_COLLECTION, ann.id), ann, { merge: true });
  } catch (e) {
    console.error(`[Firebase] Failed to sync announcement ${ann.id}:`, e);
  }
}

export async function deleteAnnouncementFromCloud(annId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, annId));
  } catch (e) {
    console.error(`[Firebase] Failed to delete announcement ${annId}:`, e);
  }
}

export function subscribeToAnnouncements(onUpdate: (anns: Announcement[]) => void) {
  const colRef = collection(db, ANNOUNCEMENTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remoteAnns = snapshot.docs.map((d) => d.data() as Announcement);
        const remoteIds = new Set(remoteAnns.map((a) => a.id));
        const missing = ANNOUNCEMENTS_DATA.filter((a) => !remoteIds.has(a.id));
        onUpdate([...remoteAnns, ...missing]);
      } else {
        onUpdate(ANNOUNCEMENTS_DATA);
      }
    },
    (err) => {
      console.warn('[Firebase] Announcements subscription error:', err);
      onUpdate(ANNOUNCEMENTS_DATA);
    }
  );
}

// --- INITIAL SEEDING HELPER ---
// If the remote Firestore collections are completely fresh, seed them with campus data
export async function seedInitialFirestoreData(
  initialClubs: Club[],
  initialApplications: ClubApplication[],
  initialMembers: ClubMember[],
  initialAnnouncements?: Announcement[]
) {
  try {
    const clubsSnap = await getDocs(collection(db, CLUBS_COLLECTION));
    const existingIds = new Set(clubsSnap.docs.map((d) => d.id));
    const allClubs = initialClubs && initialClubs.length >= CLUBS_DATA.length ? initialClubs : CLUBS_DATA;

    for (const club of allClubs) {
      if (!existingIds.has(club.id)) {
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

    const annSnap = await getDocs(collection(db, ANNOUNCEMENTS_COLLECTION));
    if (annSnap.empty) {
      console.log('[Firebase] Seeding initial notice board announcements to remote Firestore...');
      const anns = initialAnnouncements || ANNOUNCEMENTS_DATA;
      for (const ann of anns) {
        await setDoc(doc(db, ANNOUNCEMENTS_COLLECTION, ann.id), ann);
      }
    }
  } catch (e) {
    console.warn('[Firebase] Seeding note (may be read-only or offline):', e);
  }
}
