/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CLUBS_DATA } from './data/clubsData';
import { EVENTS_DATA } from './data/eventsData';
import { ANNOUNCEMENTS_DATA } from './data/announcementsData';
import { VENUES_DATA } from './data/venuesData';
import { Club, CampusEvent, ClubApplication, EventRegistration, ClubMember, AdminSession, AppUser, SUPER_ADMIN_EMAIL, Announcement } from './types';
import { INITIAL_CLUB_MEMBERS } from './data/membersData';
import { Lock, X, ArrowRight, ShieldAlert, Plus, Trash2, ShieldCheck, Sparkles, AlertCircle, Building2 } from 'lucide-react';

import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ClubCard } from './components/ClubCard';
import { ClubModal } from './components/ClubModal';
import { EventsSection } from './components/EventsSection';
import { EventRegistrationModal } from './components/EventRegistrationModal';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { AddAnnouncementModal } from './components/AddAnnouncementModal';
import { ClubMatcherQuiz } from './components/ClubMatcherQuiz';
import { RecruitmentPortalModal } from './components/RecruitmentPortalModal';
import { CampusVenuesSection } from './components/CampusVenuesSection';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { MyApplicationsSection } from './components/MyApplicationsSection';
import { ClubAdminPortal } from './components/ClubAdminPortal';
import { AdminApplicantsPage } from './components/AdminApplicantsPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { AddClubModal } from './components/AddClubModal';
import { Footer } from './components/Footer';
import { INITIAL_APPLICATIONS } from './data/applicantsData';
import {
  syncClubToCloud,
  deleteClubFromCloud,
  subscribeToClubs,
  syncApplicationToCloud,
  deleteApplicationFromCloud,
  subscribeToApplications,
  syncMemberToCloud,
  deleteMemberFromCloud,
  subscribeToMembers,
  syncAnnouncementToCloud,
  deleteAnnouncementFromCloud,
  subscribeToAnnouncements,
  seedInitialFirestoreData,
} from './services/firebase';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Dynamic Clubs State (Guarantees all 12 official societies + any user chartered societies)
  const [clubs, setClubs] = useState<Club[]>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_clubs_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= CLUBS_DATA.length) {
          return parsed;
        }
        if (Array.isArray(parsed)) {
          const storedIds = new Set(parsed.map((c: Club) => c.id));
          const missing = CLUBS_DATA.filter((c) => !storedIds.has(c.id));
          return [...parsed, ...missing];
        }
      }
      return CLUBS_DATA;
    } catch {
      return CLUBS_DATA;
    }
  });

  // Current User Auth State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Check if current user is Super Admin
  const isSuperAdmin = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  }, [currentUser]);

  // Modals state
  const [selectedClubForModal, setSelectedClubForModal] = useState<Club | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<CampusEvent | null>(null);
  const [isRecruitmentModalOpen, setIsRecruitmentModalOpen] = useState<boolean>(false);
  const [preSelectedClubForApply, setPreSelectedClubForApply] = useState<string>('');
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState<boolean>(false);
  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] = useState<boolean>(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [adminActiveClubId, setAdminActiveClubId] = useState<string>(() => clubs[0]?.id || 'tsoc');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // LocalStorage state management
  const [savedClubIds, setSavedClubIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_saved_clubs');
      return stored ? JSON.parse(stored) : ['tsoc', 'comet'];
    } catch {
      return ['tsoc', 'comet'];
    }
  });

  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_saved_events');
      return stored ? JSON.parse(stored) : ['event-hackofiesta-2026'];
    } catch {
      return ['event-hackofiesta-2026'];
    }
  });

  const [submittedApplications, setSubmittedApplications] = useState<ClubApplication[]>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_applications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [registeredEvents, setRegisteredEvents] = useState<EventRegistration[]>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_registered_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [clubMembers, setClubMembers] = useState<ClubMember[]>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_club_members');
      return stored ? JSON.parse(stored) : INITIAL_CLUB_MEMBERS;
    } catch {
      return INITIAL_CLUB_MEMBERS;
    }
  });

  // Dynamic Announcements / Notice Board State
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_announcements');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return ANNOUNCEMENTS_DATA;
    } catch {
      return ANNOUNCEMENTS_DATA;
    }
  });

  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const stored = localStorage.getItem('clubsphere_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [adminLoginTargetClubId, setAdminLoginTargetClubId] = useState<string>(CLUBS_DATA[0].id);

  const [crossClubAttempt, setCrossClubAttempt] = useState<{
    currentClub: Club;
    targetClub: Club;
  } | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('clubsphere_saved_clubs', JSON.stringify(savedClubIds));
  }, [savedClubIds]);

  useEffect(() => {
    localStorage.setItem('clubsphere_saved_events', JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem('clubsphere_applications', JSON.stringify(submittedApplications));
  }, [submittedApplications]);

  useEffect(() => {
    localStorage.setItem('clubsphere_registered_events', JSON.stringify(registeredEvents));
  }, [registeredEvents]);

  useEffect(() => {
    localStorage.setItem('clubsphere_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('clubsphere_club_members', JSON.stringify(clubMembers));
  }, [clubMembers]);

  useEffect(() => {
    localStorage.setItem('clubsphere_clubs_list', JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('clubsphere_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('clubsphere_current_user');
    }
  }, [currentUser]);

  // Real-time Cloud Synchronization (Firebase Firestore)
  useEffect(() => {
    seedInitialFirestoreData(clubs, submittedApplications, clubMembers, announcements);

    const unsubClubs = subscribeToClubs((remoteClubs) => {
      if (remoteClubs && remoteClubs.length > 0) {
        setClubs(remoteClubs);
      }
    });

    const unsubApps = subscribeToApplications((remoteApps) => {
      if (remoteApps && remoteApps.length > 0) {
        setSubmittedApplications(remoteApps);
      }
    });

    const unsubMembers = subscribeToMembers((remoteMembers) => {
      if (remoteMembers && remoteMembers.length > 0) {
        setClubMembers(remoteMembers);
      }
    });

    const unsubAnnouncements = subscribeToAnnouncements((remoteAnns) => {
      if (remoteAnns && remoteAnns.length > 0) {
        setAnnouncements(remoteAnns);
      }
    });

    return () => {
      unsubClubs();
      unsubApps();
      unsubMembers();
      unsubAnnouncements();
    };
  }, []);

  // Guard admin tabs: If a student is logged in, redirect away from admin tabs to explore
  useEffect(() => {
    if (currentUser && !isSuperAdmin && !adminSession) {
      if (activeTab === 'admin' || activeTab === 'applicants') {
        setActiveTab('explore');
      }
    }
  }, [currentUser, isSuperAdmin, adminSession, activeTab]);

  // Handlers for Saving / Bookmarks
  const toggleSaveClub = (clubId: string) => {
    setSavedClubIds((prev) => {
      const exists = prev.includes(clubId);
      const next = exists ? prev.filter((id) => id !== clubId) : [...prev, clubId];
      showToast(exists ? 'Club removed from saved list' : 'Club saved to bookmarks');
      return next;
    });
  };

  const toggleSaveEvent = (eventId: string) => {
    setSavedEventIds((prev) => {
      const exists = prev.includes(eventId);
      const next = exists ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      showToast(exists ? 'Event removed from saved list' : 'Event saved to bookmarks');
      return next;
    });
  };

  // Handlers for Application
  const handleOpenApplicationModal = (club?: Club) => {
    if (club) {
      setPreSelectedClubForApply(club.id);
    } else {
      setPreSelectedClubForApply(clubs[0]?.id || 'tsoc');
    }
    setIsRecruitmentModalOpen(true);
  };

  const handleApplicationSubmit = (app: ClubApplication) => {
    setSubmittedApplications((prev) => [app, ...prev]);
    syncApplicationToCloud(app);
    showToast(`Application #${app.id} successfully lodged for ${app.clubName}!`);
  };

  const handleWithdrawApplication = (appId: string) => {
    setSubmittedApplications((prev) => prev.filter((a) => a.id !== appId));
    deleteApplicationFromCloud(appId);
    showToast('Application withdrawn successfully');
  };

  // Handlers for Event Registration
  const handleEventRegistrationSuccess = (reg: EventRegistration) => {
    setRegisteredEvents((prev) => [reg, ...prev]);
    showToast(`Delegate pass generated: ${reg.registrationId}`);
  };

  // Handlers for Club Administration & Role Assignment
  const handleOpenClubAdmin = (club: Club) => {
    if (isSuperAdmin) {
      setAdminActiveClubId(club.id);
      setActiveTab('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (adminSession) {
      if (adminSession.clubId === club.id) {
        // Active session matches this club
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Strict segregation enforcement: user is logged in as another club's head
        const currentClubObj = clubs.find((c) => c.id === adminSession.clubId) || clubs[0];
        setCrossClubAttempt({
          currentClub: currentClubObj,
          targetClub: club,
        });
      }
    } else {
      // Route to admin login pre-selected for this club
      setAdminLoginTargetClubId(club.id);
      setActiveTab('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdminLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    const targetClub = clubs.find((c) => c.id === session.clubId);
    showToast(`Authenticated as ${session.adminName} (${targetClub?.acronym || 'Club'} Head)`);
  };

  const handleAdminLogout = () => {
    setAdminSession(null);
    localStorage.removeItem('clubsphere_admin_session');
    showToast('Logged out of society administration');
  };

  // User Auth Handlers
  const handleUserLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setIsGuestMode(false);
    if (user.isAdmin) {
      setAdminSession({
        clubId: adminActiveClubId || clubs[0]?.id || 'tsoc',
        adminName: user.name,
        adminEmail: user.email,
        adminRole: 'Super Administrator',
        loginTimestamp: Date.now(),
      });
      showToast(`Welcome ${user.name}! Super Admin privileges active.`);
    } else {
      setAdminSession(null);
      localStorage.removeItem('clubsphere_admin_session');
      if (activeTab === 'admin' || activeTab === 'applicants') {
        setActiveTab('explore');
      }
      showToast(`Welcome, ${user.name}!`);
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    setIsGuestMode(false);
    setAdminSession(null);
    localStorage.removeItem('clubsphere_current_user');
    localStorage.removeItem('clubsphere_admin_session');
    showToast('Signed out. Returned to login page.');
  };

  // Super Admin: Add Club Handler
  const handleAddClub = (newClub: Club) => {
    setClubs((prev) => [newClub, ...prev]);
    syncClubToCloud(newClub);

    // Add initial designated lead to members
    if (newClub.leads?.[0]) {
      const head = newClub.leads[0];
      const leadMember: ClubMember = {
        id: `mem-${newClub.id}-head`,
        clubId: newClub.id,
        name: head.name,
        email: head.email,
        rollNumber: `26100${Math.floor(1000 + Math.random() * 9000)}`,
        branch: head.branch || 'CSE',
        batch: head.batch || '2026',
        role: head.role || 'Club Head & Lead',
        subDomain: 'Executive Governance',
        isAdmin: true,
        joinedAt: 'October 2026',
        status: 'Active',
      };
      setClubMembers((prev) => [leadMember, ...prev]);
      syncMemberToCloud(leadMember);
    }

    setAdminActiveClubId(newClub.id);
    showToast(`Society chartered: ${newClub.name} (${newClub.acronym})`);
  };

  // Super Admin: Remove Club Handler
  const handleConfirmDeleteClub = () => {
    if (!clubToDelete) return;
    const deletedId = clubToDelete.id;
    const deletedName = clubToDelete.name;

    setClubs((prev) => prev.filter((c) => c.id !== deletedId));
    setClubMembers((prev) => prev.filter((m) => m.clubId !== deletedId));
    setSavedClubIds((prev) => prev.filter((id) => id !== deletedId));
    deleteClubFromCloud(deletedId);

    if (selectedClubForModal?.id === deletedId) {
      setSelectedClubForModal(null);
    }
    if (adminActiveClubId === deletedId) {
      const remaining = clubs.filter((c) => c.id !== deletedId);
      if (remaining.length > 0) {
        setAdminActiveClubId(remaining[0].id);
      }
    }

    setClubToDelete(null);
    showToast(`Removed society: ${deletedName}`);
  };

  const handleSwitchAdminToTargetClub = (targetClubId: string) => {
    setAdminSession(null);
    localStorage.removeItem('clubsphere_admin_session');
    setCrossClubAttempt(null);
    setAdminLoginTargetClubId(targetClubId);
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetClub = clubs.find((c) => c.id === targetClubId);
    showToast(`Switched context. Please log in as ${targetClub?.leads?.[0]?.name || 'Club Head'}`);
  };

  const handleAddMember = (memberData: Omit<ClubMember, 'id' | 'joinedAt'>) => {
    const newId = `mem-${memberData.clubId}-${Date.now().toString().slice(-4)}`;
    const newMember: ClubMember = {
      ...memberData,
      id: newId,
      joinedAt: 'October 2026',
    };
    setClubMembers((prev) => [newMember, ...prev]);
    syncMemberToCloud(newMember);
    showToast(`${newMember.name} inducted into roster as ${newMember.role}!`);
  };

  const handleUpdateMemberRole = (memberId: string, newRole: string, newSubDomain?: string) => {
    setClubMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const updated = { ...m, role: newRole, subDomain: newSubDomain ?? m.subDomain };
          syncMemberToCloud(updated);
          return updated;
        }
        return m;
      })
    );
    showToast(`Role updated to ${newRole}!`);
  };

  const handleRemoveMember = (memberId: string) => {
    const mem = clubMembers.find((m) => m.id === memberId);
    setClubMembers((prev) => prev.filter((m) => m.id !== memberId));
    deleteMemberFromCloud(memberId);
    showToast(`${mem ? mem.name : 'Member'} removed from club roster`);
  };

  const handleInductApplication = (app: ClubApplication, role: string) => {
    const newMember: ClubMember = {
      id: `mem-${app.clubId}-${Date.now().toString().slice(-4)}`,
      clubId: app.clubId,
      name: app.applicantName,
      email: app.email,
      rollNumber: app.rollNumber,
      branch: app.branch,
      batch: app.year.includes('2026') ? '2026' : app.year.includes('2025') ? '2025' : '2024',
      role: role,
      subDomain: app.subDomain,
      isAdmin: false,
      joinedAt: 'October 2026',
      status: 'Active',
    };
    setClubMembers((prev) => [newMember, ...prev]);
    syncMemberToCloud(newMember);

    // Mark application as inducted and sync to cloud
    const updatedApp: ClubApplication = { ...app, status: 'Shortlisted' as const };
    setSubmittedApplications((prev) =>
      prev.map((a) => (a.id === app.id ? updatedApp : a))
    );
    syncApplicationToCloud(updatedApp);

    showToast(`${app.applicantName} inducted into ${app.clubName} as ${role}!`);
  };

  const handleUpdateApplicationStatus = (
    appId: string,
    status: ClubApplication['status'],
    slotTime?: string
  ) => {
    setSubmittedApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const updated: ClubApplication = { ...a, status, slotTime: slotTime ?? a.slotTime };
          syncApplicationToCloud(updated);
          return updated;
        }
        return a;
      })
    );
    showToast(`Application status updated to ${status}`);
  };

  const handleDeleteApplication = (appId: string) => {
    const target = submittedApplications.find((a) => a.id === appId);
    setSubmittedApplications((prev) => prev.filter((a) => a.id !== appId));
    deleteApplicationFromCloud(appId);
    showToast(`Archived application from ${target ? target.applicantName : 'candidate'}`);
  };

  const handleSeedDemoApplicants = () => {
    setSubmittedApplications((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const additions = INITIAL_APPLICATIONS.filter((d) => !existingIds.has(d.id));
      if (additions.length === 0) {
        showToast('Demo candidate applicants are already present');
        return prev;
      }
      showToast(`Added ${additions.length} candidate applications (including Rahul Kumar)!`);
      return [...additions, ...prev];
    });
  };

  // Notice Board Announcements Handlers
  const handleAddAnnouncement = (newAnn: Announcement) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
    syncAnnouncementToCloud(newAnn);
    showToast(`Notice broadcasted: "${newAnn.title}"`);
  };

  const handleDeleteAnnouncement = (annId: string) => {
    const target = announcements.find((a) => a.id === annId);
    setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
    deleteAnnouncementFromCloud(annId);
    showToast(`Notice removed: "${target ? target.title : 'Circular'}"`);
  };

  // Filtered Clubs Calculation
  const filteredClubs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return clubs.filter((club) => {
      const matchesCategory = selectedCategory === 'all' || club.category === selectedCategory;
      if (!q) return matchesCategory;

      const matchesSearch =
        club.name.toLowerCase().includes(q) ||
        club.acronym.toLowerCase().includes(q) ||
        club.description.toLowerCase().includes(q) ||
        club.tagline.toLowerCase().includes(q) ||
        club.categoryLabel.toLowerCase().includes(q) ||
        club.meetingVenue.toLowerCase().includes(q) ||
        club.skillsGained.some((s) => s.toLowerCase().includes(q)) ||
        club.flagshipEvents.some((e) => e.toLowerCase().includes(q)) ||
        club.activeProjects.some((p) => p.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [clubs, selectedCategory, searchQuery]);

  const savedClubsList = clubs.filter((c) => savedClubIds.includes(c.id));
  const savedEventsList = EVENTS_DATA.filter((e) => savedEventIds.includes(e.id));
  const totalBookmarksCount = savedClubIds.length + savedEventIds.length;

  // Filter applications to only those submitted by the currently logged-in user
  const myApplications = useMemo(() => {
    if (!currentUser) return [];
    const userEmail = currentUser.email.trim().toLowerCase();
    const userRoll = currentUser.rollNumber?.trim().toLowerCase() || '';

    return submittedApplications.filter((app) => {
      const appEmail = app.email?.trim().toLowerCase() || '';
      const appRoll = app.rollNumber?.trim().toLowerCase() || '';
      return (
        (userEmail && appEmail === userEmail) ||
        (userRoll && appRoll === userRoll)
      );
    });
  }, [submittedApplications, currentUser]);

  // Dedicated Full-Page Login Entry Gate when unauthenticated & not in guest mode
  if (!currentUser && !isGuestMode) {
    return (
      <LoginPage
        onLoginSuccess={handleUserLoginSuccess}
        onContinueAsGuest={() => setIsGuestMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-bounce-toast fixed bottom-6 right-6 z-50 rounded-xl border border-amber-400/40 bg-slate-900/95 backdrop-blur-md px-4 py-3 text-xs font-semibold text-white shadow-2xl flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 font-bold text-[11px]">
            ✓
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Guest Mode Banner */}
      {!currentUser && isGuestMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              Browsing as <strong>Guest Visitor</strong>. Sign in for society recruitment, event passes, and administrative controls.
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
            >
              Sign In
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setIsGuestMode(false)}
              className="text-slate-300 hover:text-white font-medium hover:underline"
            >
              Back to Login Gate
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bookmarksCount={totalBookmarksCount}
        openBookmarks={() => setIsBookmarksOpen(true)}
        openApplicationModal={() => handleOpenApplicationModal()}
        applicationsCount={myApplications.length}
        totalApplicantsCount={submittedApplications.length}
        adminSession={adminSession}
        onAdminLogout={handleAdminLogout}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogoutUser={handleUserLogout}
      />

      {/* Main View Router */}
      <main className="flex-1 transition-opacity duration-300">
        {activeTab === 'explore' && (
          <div key="tab-explore" className="animate-fade-in">
            {/* Focal Hero Hub with Auto-Search */}
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              totalClubs={clubs.length}
              totalEvents={EVENTS_DATA.length}
              clubs={clubs}
              onSelectClub={(c) => setSelectedClubForModal(c)}
              onExploreClick={() => {
                const el = document.getElementById('clubs-directory');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onMatcherClick={() => {
                setActiveTab('matcher');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Clubs Grid Section Directly Integrated */}
            <section id="clubs-directory" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {searchQuery ? 'Search Filter Active' : 'Society Directory'}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {searchQuery ? (
                      <span>Search Results for "{searchQuery}"</span>
                    ) : selectedCategory === 'technical' ? (
                      'Technical & Development Societies'
                    ) : selectedCategory === 'cultural' ? (
                      'Cultural & Performing Arts Societies'
                    ) : selectedCategory === 'sports' ? (
                      'Athletics & Esports Societies'
                    ) : selectedCategory === 'entrepreneurship' ? (
                      'Entrepreneurship & Venture Societies'
                    ) : selectedCategory === 'social' ? (
                      'Social Outreach & Welfare Societies'
                    ) : (
                      'All Registered Student Societies'
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Showing <span className="font-mono tabular-nums text-amber-400 font-bold">{filteredClubs.length}</span> {filteredClubs.length === 1 ? 'society' : 'societies'} at IIIT Naya Raipur
                    {selectedCategory !== 'all' && (
                      <span> in <strong className="text-slate-200 capitalize">{selectedCategory}</strong> category</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                  {isSuperAdmin && (
                    <button
                      onClick={() => setIsAddClubModalOpen(true)}
                      className="btn-tactile text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                      <span>Add New Society</span>
                    </button>
                  )}

                  {(searchQuery || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="btn-tactile text-xs text-slate-950 font-bold bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <span>Show All {clubs.length} Societies</span>
                    </button>
                  )}
                </div>
              </div>

              {(searchQuery || selectedCategory !== 'all') && (
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>
                      {searchQuery && selectedCategory !== 'all' ? (
                        <>Filtered by category <strong>"{selectedCategory}"</strong> and search <strong>"{searchQuery}"</strong></>
                      ) : searchQuery ? (
                        <>Filtered by search query: <strong>"{searchQuery}"</strong></>
                      ) : (
                        <>Category filter active: <strong>"{selectedCategory}"</strong> (Showing {filteredClubs.length} of {clubs.length} total societies)</>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-amber-400 hover:text-amber-300 hover:underline font-semibold whitespace-nowrap"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Grid */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    isSaved={savedClubIds.includes(club.id)}
                    onToggleSave={toggleSaveClub}
                    onSelectClub={(c) => setSelectedClubForModal(c)}
                    onApplyClub={(c) => handleOpenApplicationModal(c)}
                    onOpenAdmin={isSuperAdmin || !!adminSession ? handleOpenClubAdmin : undefined}
                    isAdmin={isSuperAdmin}
                    onRemoveClub={(c) => setClubToDelete(c)}
                  />
                ))}
              </div>

              {filteredClubs.length === 0 && (
                <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
                  <p className="text-sm">No student societies match your search for "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-3 text-xs text-amber-400 hover:underline font-semibold"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'events' && (
          <div key="tab-events" className="animate-fade-in">
            <EventsSection
              events={EVENTS_DATA}
              savedEventIds={savedEventIds}
              registeredEventIds={registeredEvents.map((r) => r.eventId)}
              onToggleSaveEvent={toggleSaveEvent}
              onRegisterEvent={(evt) => setSelectedEventForModal(evt)}
            />
          </div>
        )}

        {activeTab === 'announcements' && (
          <div key="tab-announcements" className="animate-fade-in">
            <AnnouncementsSection
              announcements={announcements}
              onOpenRecruitment={() => handleOpenApplicationModal()}
              onOpenEvents={() => setActiveTab('events')}
              isAdmin={isSuperAdmin || !!adminSession}
              onOpenPostNotice={() => setIsAddAnnouncementModalOpen(true)}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          </div>
        )}

        {activeTab === 'matcher' && (
          <div key="tab-matcher" className="animate-fade-in">
            <ClubMatcherQuiz
              clubs={clubs}
              onSelectClub={(c) => setSelectedClubForModal(c)}
              onApplyClub={(c) => handleOpenApplicationModal(c)}
            />
          </div>
        )}

        {activeTab === 'venues' && (
          <div key="tab-venues" className="animate-fade-in">
            <CampusVenuesSection venues={VENUES_DATA} />
          </div>
        )}

        {activeTab === 'admin' && (
          <div key="tab-admin" className="animate-fade-in">
            {/* If user is signed in as a student (not Vivek Kumar / SUPER_ADMIN_EMAIL), show restricted screen */}
            {currentUser && !isSuperAdmin ? (
              <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in">
                <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                    <Lock className="h-7 w-7" />
                  </div>
                  <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
                    Admin Access Restricted
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-2">
                    Super Admin Rights Required
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                    Administrative authority to add or remove student societies and manage member rosters is restricted exclusively to the authorized administrator:
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-400 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{SUPER_ADMIN_EMAIL}</span>
                  </div>
                  <div className="mt-4 text-xs text-slate-400">
                    You are currently signed in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}).
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="btn-tactile w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Switch to Admin Account</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('explore');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn-tactile w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      Return to Student Portal
                    </button>
                  </div>
                </div>
              </div>
            ) : isSuperAdmin ? (
              /* Super Admin Active: Full authority across all clubs */
              <ClubAdminPortal
                clubs={clubs}
                activeClubId={adminActiveClubId || clubs[0]?.id || 'tsoc'}
                session={
                  adminSession || {
                    clubId: adminActiveClubId || clubs[0]?.id || 'tsoc',
                    adminName: currentUser?.name || 'Vivek Kumar',
                    adminEmail: SUPER_ADMIN_EMAIL,
                    adminRole: 'Super Administrator',
                    loginTimestamp: Date.now(),
                  }
                }
                onLogout={handleUserLogout}
                members={clubMembers}
                onAddMember={handleAddMember}
                onUpdateMemberRole={handleUpdateMemberRole}
                onRemoveMember={handleRemoveMember}
                applications={submittedApplications}
                onInductApplication={handleInductApplication}
                isSuperAdmin={true}
                onOpenAddClub={() => setIsAddClubModalOpen(true)}
                onRemoveClub={(c) => setClubToDelete(c)}
                onSwitchClub={(clubId) => setAdminActiveClubId(clubId)}
                onOpenAllApplicants={() => {
                  setActiveTab('applicants');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenPostNotice={() => setIsAddAnnouncementModalOpen(true)}
              />
            ) : adminSession ? (
              /* Per-Club Session Active */
              <ClubAdminPortal
                clubs={clubs}
                activeClubId={adminSession.clubId}
                session={adminSession}
                onLogout={handleAdminLogout}
                members={clubMembers}
                onAddMember={handleAddMember}
                onUpdateMemberRole={handleUpdateMemberRole}
                onRemoveMember={handleRemoveMember}
                applications={submittedApplications}
                onInductApplication={handleInductApplication}
                onOpenAllApplicants={() => {
                  setActiveTab('applicants');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenPostNotice={() => setIsAddAnnouncementModalOpen(true)}
              />
            ) : (
              /* Login Page */
              <AdminLoginPage
                clubs={clubs}
                initialSelectedClubId={adminLoginTargetClubId}
                onLoginSuccess={handleAdminLoginSuccess}
                onCancel={() => {
                  setActiveTab('explore');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div key="tab-applications" className="animate-fade-in">
            <MyApplicationsSection
              applications={myApplications}
              currentUser={currentUser}
              allSystemApplicationsCount={submittedApplications.length}
              onWithdrawApplication={handleWithdrawApplication}
              onApplyNew={() => handleOpenApplicationModal()}
              onGoToAdminPortal={() => {
                setActiveTab('applicants');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {activeTab === 'applicants' && (
          <div key="tab-applicants" className="animate-fade-in">
            <AdminApplicantsPage
              clubs={clubs}
              applications={submittedApplications}
              currentUser={currentUser}
              adminSession={adminSession}
              isSuperAdmin={isSuperAdmin}
              onInductApplication={handleInductApplication}
              onUpdateApplicationStatus={handleUpdateApplicationStatus}
              onDeleteApplication={handleDeleteApplication}
              onSwitchToClubAdmin={(clubId) => {
                setAdminActiveClubId(clubId);
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSeedDemoApplicants={handleSeedDemoApplicants}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedClubs={savedClubsList}
        savedEvents={savedEventsList}
        onRemoveClub={toggleSaveClub}
        onRemoveEvent={toggleSaveEvent}
        onSelectClub={(club) => {
          setSelectedClubForModal(club);
          setIsBookmarksOpen(false);
        }}
        onRegisterEvent={(evt) => {
          setSelectedEventForModal(evt);
          setIsBookmarksOpen(false);
        }}
      />

      {/* Modals */}
      <ClubModal
        club={selectedClubForModal}
        onClose={() => setSelectedClubForModal(null)}
        isSaved={selectedClubForModal ? savedClubIds.includes(selectedClubForModal.id) : false}
        onToggleSave={toggleSaveClub}
        onApply={(club) => {
          setSelectedClubForModal(null);
          handleOpenApplicationModal(club);
        }}
        onOpenAdmin={isSuperAdmin || !!adminSession ? handleOpenClubAdmin : undefined}
        isAdmin={isSuperAdmin}
        onRemoveClub={(c) => setClubToDelete(c)}
      />

      <EventRegistrationModal
        event={selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        onSuccess={handleEventRegistrationSuccess}
      />

      <RecruitmentPortalModal
        isOpen={isRecruitmentModalOpen}
        onClose={() => setIsRecruitmentModalOpen(false)}
        clubs={clubs}
        preSelectedClubId={preSelectedClubForApply}
        onApplicationSubmit={handleApplicationSubmit}
        currentUser={currentUser}
        onViewApplications={() => {
          setActiveTab('applications');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Auth Modal: Sign In & Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleUserLoginSuccess}
        onLogout={handleUserLogout}
      />

      {/* Add Club Modal */}
      <AddClubModal
        isOpen={isAddClubModalOpen}
        onClose={() => setIsAddClubModalOpen(false)}
        onAddClub={handleAddClub}
      />

      {/* Broadcast Notice / Announcement Modal */}
      <AddAnnouncementModal
        isOpen={isAddAnnouncementModalOpen}
        onClose={() => setIsAddAnnouncementModalOpen(false)}
        clubs={clubs}
        adminSession={adminSession}
        currentUser={currentUser}
        isSuperAdmin={isSuperAdmin}
        onAddAnnouncement={handleAddAnnouncement}
        preSelectedClubId={adminActiveClubId}
      />

      {/* Delete Club Confirmation Modal */}
      {clubToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setClubToDelete(null)}
        >
          <div 
            className="animate-scale-in relative w-full max-w-md rounded-2xl border border-red-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setClubToDelete(null)}
              className="btn-tactile absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">
                  Permanent Removal
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  Remove Society
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{clubToDelete.name} ({clubToDelete.acronym})</strong>?
            </p>
            <p className="text-xs text-slate-400 mt-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              This action will uncharter the society from the campus directory and remove all its active member records.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setClubToDelete(null)}
                className="btn-tactile px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClub}
                className="btn-tactile px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirm & Delete Society</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Club Administration Restriction Segregation Modal */}
      {crossClubAttempt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setCrossClubAttempt(null)}
        >
          <div 
            className="animate-scale-in relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCrossClubAttempt(null)}
              className="btn-tactile absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Access Restricted · Strict Isolation
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  Cross-Club Administration Blocked
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You are currently authenticated as <strong className="text-white">{crossClubAttempt.currentClub.leads[0]?.name || 'Admin'}</strong> with exclusive administrative rights for <strong className="text-amber-400">{crossClubAttempt.currentClub.name} ({crossClubAttempt.currentClub.acronym})</strong>.
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-400">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  No admin can access two clubs simultaneously without authenticating into each individually.
                </span>
              </div>
              <p className="text-slate-300 pt-1 border-t border-slate-850">
                To manage <strong className="text-white">{crossClubAttempt.targetClub.name}</strong>, you must log out and sign in using its designated Club Head (<strong className="text-amber-400">{crossClubAttempt.targetClub.leads[0]?.name}</strong>).
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => handleSwitchAdminToTargetClub(crossClubAttempt.targetClub.id)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Log Out & Sign In as {crossClubAttempt.targetClub.acronym} Head</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCrossClubAttempt(null)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Stay in {crossClubAttempt.currentClub.acronym}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
