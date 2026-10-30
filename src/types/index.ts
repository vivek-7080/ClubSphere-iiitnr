export type ClubCategory = 'technical' | 'cultural' | 'sports' | 'entrepreneurship' | 'social';

export interface ClubLead {
  name: string;
  role: string;
  branch: string;
  batch: string;
  email: string;
  linkedin?: string;
  github?: string;
  isAdmin?: boolean;
}

export interface ClubMember {
  id: string;
  clubId: string;
  name: string;
  email: string;
  rollNumber: string;
  branch: string;
  batch: string;
  role: string;
  subDomain?: string;
  isAdmin?: boolean;
  joinedAt: string;
  status: 'Active' | 'Probationary' | 'Alumni';
}

export interface AdminSession {
  clubId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  loginTimestamp: number;
}

export const SUPER_ADMIN_EMAIL = 'kumarvivek802125@gmail.com';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  rollNumber?: string;
  branch?: string;
  batch?: string;
  role: 'super_admin' | 'club_admin' | 'student';
  isAdmin: boolean;
  avatarColor?: string;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  acronym: string;
  category: ClubCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  membersCount: number;
  meetingVenue: string;
  leads: ClubLead[];
  flagshipEvents: string[];
  skillsGained: string[];
  recruitmentStatus: 'Open' | 'Auditions Scheduled' | 'Closed';
  recruitmentTarget: string;
  activeProjects: string[];
  socialLinks: {
    website?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
  };
  accentColor: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  clubId: string;
  clubName: string;
  clubAcronym: string;
  category: ClubCategory;
  date: string;
  startDate: string;
  endDate?: string;
  time: string;
  venue: string;
  description: string;
  registrationDeadline: string;
  isRegistrationOpen: boolean;
  registrationFee: string;
  prizePool?: string;
  mode: 'In-person' | 'Hybrid' | 'Online';
  eligibility: string;
  seatsTotal: number;
  seatsRegistered: number;
  coordinators: {
    name: string;
    contact: string;
  }[];
  tags: string[];
}

export interface Announcement {
  id: string;
  title: string;
  source: string;
  sourceType: 'sac' | 'club' | 'council';
  date: string;
  isUrgent?: boolean;
  summary: string;
  fullContent: string;
  actionUrlText?: string;
  category: 'Recruitment' | 'Event' | 'Policy' | 'Results' | 'Grant';
}

export interface ClubApplication {
  id: string;
  applicantName: string;
  rollNumber: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  clubId: string;
  clubName: string;
  subDomain: string;
  statementOfPurpose: string;
  experienceOrAchievements?: string;
  videoUrl?: string;
  portfolioUrl?: string;
  submittedAt: string;
  status: 'Received' | 'Interview Scheduled' | 'Shortlisted' | 'Audition Slot';
  slotTime?: string;
}

export interface EventRegistration {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  applicantName: string;
  rollNumber: string;
  email: string;
  teamName?: string;
  teamSize: number;
  registeredAt: string;
}

export interface CampusVenue {
  id: string;
  name: string;
  code: string;
  building: string;
  floor: string;
  capacity: number;
  description: string;
  primaryClubs: string[];
  equipment: string[];
}
