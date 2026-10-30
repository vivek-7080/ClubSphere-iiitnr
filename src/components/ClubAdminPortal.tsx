import React, { useState, useMemo } from 'react';
import { Club, ClubMember, ClubApplication, AdminSession } from '../types';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Award,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Search,
  Mail,
  Video,
  ExternalLink,
  School,
  X,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  Filter,
  LogOut,
  Lock,
  Bell,
} from 'lucide-react';

interface ClubAdminPortalProps {
  clubs: Club[];
  activeClubId: string;
  setActiveClubId?: (clubId: string) => void;
  session: AdminSession;
  onLogout: () => void;
  members: ClubMember[];
  onAddMember: (member: Omit<ClubMember, 'id' | 'joinedAt'>) => void;
  onUpdateMemberRole: (memberId: string, newRole: string, newSubDomain?: string) => void;
  onRemoveMember: (memberId: string) => void;
  applications: ClubApplication[];
  onInductApplication: (app: ClubApplication, role: string) => void;
  isSuperAdmin?: boolean;
  onOpenAddClub?: () => void;
  onRemoveClub?: (club: Club) => void;
  onSwitchClub?: (clubId: string) => void;
  onOpenAllApplicants?: () => void;
  onOpenPostNotice?: () => void;
}

const COMMON_ROLES = [
  'Club Head & Lead',
  'Vice President / Co-Lead',
  'Core Member',
  'Technical Executive',
  'Event Coordinator',
  'Design & Creative Lead',
  'Sub-Domain Lead',
  'Treasurer / Finance Lead',
  'Public Relations & Outreach Head',
  'Logistics In-Charge',
  'Junior Domain Coordinator',
];

export const ClubAdminPortal: React.FC<ClubAdminPortalProps> = ({
  clubs,
  activeClubId,
  session,
  onLogout,
  members,
  onAddMember,
  onUpdateMemberRole,
  onRemoveMember,
  applications,
  onInductApplication,
  isSuperAdmin = false,
  onOpenAddClub,
  onRemoveClub,
  onSwitchClub,
  onOpenAllApplicants,
  onOpenPostNotice,
}) => {
  const currentClub = useMemo(() => {
    return clubs.find((c) => c.id === activeClubId) || clubs[0];
  }, [clubs, activeClubId]);

  // Head is the primary lead of the club
  const clubHead = useMemo(() => {
    return currentClub?.leads?.[0] || {
      name: 'Club Head',
      role: 'President / Lead',
      branch: 'CSE',
      batch: '2025',
      email: 'head@iiitnr.edu.in',
    };
  }, [currentClub]);

  // Filter members for active club
  const clubMembers = useMemo(() => {
    return members.filter((m) => m.clubId === currentClub.id);
  }, [members, currentClub.id]);

  // Filter applications for active club
  const clubApplications = useMemo(() => {
    return applications.filter((a) => a.clubId === currentClub.id);
  }, [applications, currentClub.id]);

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'applications'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    branch: 'CSE',
    batch: '2026',
    role: 'Core Member',
    customRole: '',
    subDomain: '',
    status: 'Active' as const,
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit Role Modal State
  const [editingMember, setEditingMember] = useState<ClubMember | null>(null);
  const [editRoleSelect, setEditRoleSelect] = useState('');
  const [editCustomRole, setEditCustomRole] = useState('');
  const [editSubDomain, setEditSubDomain] = useState('');

  // Induct Application Modal State
  const [inductingApp, setInductingApp] = useState<ClubApplication | null>(null);
  const [inductRoleSelect, setInductRoleSelect] = useState('Core Member');
  const [inductCustomRole, setInductCustomRole] = useState('');

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return clubMembers.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.rollNumber.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.subDomain && m.subDomain.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'admin' && m.isAdmin) ||
        (roleFilter === 'lead' && m.role.toLowerCase().includes('lead')) ||
        (roleFilter === 'core' && !m.isAdmin && !m.role.toLowerCase().includes('lead'));

      return matchesSearch && matchesRole;
    });
  }, [clubMembers, searchQuery, roleFilter]);

  const handleOpenAddModal = () => {
    setAddForm({
      name: '',
      email: '',
      rollNumber: '',
      branch: 'CSE',
      batch: '2026',
      role: 'Core Member',
      customRole: '',
      subDomain: '',
      status: 'Active',
    });
    setAddErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!addForm.name.trim()) errs.name = 'Member name is required';
    if (!addForm.rollNumber.trim()) errs.rollNumber = 'Roll number is required';
    if (!addForm.email.trim() || !addForm.email.includes('@')) {
      errs.email = 'Valid institute email is required';
    }

    const effectiveRole =
      addForm.role === 'custom' ? addForm.customRole.trim() : addForm.role;
    if (!effectiveRole) {
      errs.role = 'Please specify a role';
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    onAddMember({
      clubId: currentClub.id,
      name: addForm.name.trim(),
      email: addForm.email.trim().toLowerCase(),
      rollNumber: addForm.rollNumber.trim().toUpperCase(),
      branch: addForm.branch,
      batch: addForm.batch,
      role: effectiveRole,
      subDomain: addForm.subDomain.trim() || 'General Operations',
      isAdmin: false,
      status: addForm.status,
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEditRole = (member: ClubMember) => {
    setEditingMember(member);
    if (COMMON_ROLES.includes(member.role)) {
      setEditRoleSelect(member.role);
      setEditCustomRole('');
    } else {
      setEditRoleSelect('custom');
      setEditCustomRole(member.role);
    }
    setEditSubDomain(member.subDomain || '');
  };

  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const finalRole =
      editRoleSelect === 'custom' ? editCustomRole.trim() : editRoleSelect;
    if (!finalRole) return;

    onUpdateMemberRole(editingMember.id, finalRole, editSubDomain.trim());
    setEditingMember(null);
  };

  const handleStartInduct = (app: ClubApplication) => {
    setInductingApp(app);
    setInductRoleSelect('Core Member');
    setInductCustomRole('');
  };

  const handleConfirmInduct = () => {
    if (!inductingApp) return;
    const finalRole =
      inductRoleSelect === 'custom'
        ? inductCustomRole.trim() || 'Core Member'
        : inductRoleSelect;
    onInductApplication(inductingApp, finalRole);
    setInductingApp(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in duration-200">
      {/* Top Banner / Club Head Identity Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                Club Admin Console
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300 font-semibold">{currentClub.categoryLabel}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <span>{currentClub.name}</span>
                <span
                  className="text-xs px-2.5 py-0.5 rounded font-mono font-bold text-slate-950"
                  style={{ backgroundColor: currentClub.accentColor }}
                >
                  {currentClub.acronym}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Official society administrative portal. As the club head, you possess administrative authority to onboard new members, assign and promote roles, and induct applicants.
              </p>
            </div>

            {/* Club Head Profile Card */}
            <div className="flex items-center gap-3.5 pt-2 border-t border-slate-800/80">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-extrabold text-base text-slate-950 shadow-md"
                style={{ backgroundColor: currentClub.accentColor }}
              >
                {clubHead.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{clubHead.name}</span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Club Head (Admin)
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  <span>{clubHead.role}</span>
                  <span className="mx-1.5 text-slate-600">·</span>
                  <span>B.Tech {clubHead.branch} (Batch of {clubHead.batch})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Session Controls */}
          <div className="relative shrink-0 self-start lg:self-center flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs shadow-lg min-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isSuperAdmin ? 'Super Administrator Access' : 'Isolated Admin Session'}
                </span>
              </div>
              <div className="text-white font-bold mt-0.5 truncate">
                {session?.adminName || clubHead.name}
              </div>
              <div className="text-[11px] text-amber-400 font-mono truncate">
                {session?.adminEmail || clubHead.email}
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="btn-tactile flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 py-3 text-xs font-bold text-red-300 hover:text-white transition-all shadow-md whitespace-nowrap"
              title="Log out of admin session"
            >
              <LogOut className="h-4 w-4 text-red-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Super Admin Control Bar OR Standard Segregation Notice */}
        {isSuperAdmin ? (
          <div className="mt-5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-400/10 via-amber-400/5 to-transparent p-4 text-xs shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Super Admin Authority Active</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-amber-400 px-2 py-0.2 rounded">
                      Authorized: {session.adminEmail}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    Full authority to add/remove clubs, onboard members across all societies, and adjust roles.
                  </p>
                </div>
              </div>

              {/* Super Admin Action Buttons: Add Club, Remove Current Club, Switch Club */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {onSwitchClub && (
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Switch Society:</span>
                    <select
                      value={currentClub.id}
                      onChange={(e) => onSwitchClub(e.target.value)}
                      className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
                    >
                      {clubs.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.acronym} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {onOpenAddClub && (
                  <button
                    type="button"
                    onClick={onOpenAddClub}
                    className="btn-tactile flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Add New Club</span>
                  </button>
                )}

                {onRemoveClub && (
                  <button
                    type="button"
                    onClick={() => onRemoveClub(currentClub)}
                    className="btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                    title={`Delete ${currentClub.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    <span>Remove Club</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/5 p-3.5 sm:p-4 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-white">Club Segregation Enforced: </span>
                <span>
                  You have administrative authority exclusively for <strong className="text-amber-400">{currentClub.name}</strong>. No admin can access or modify another society without authenticating with that club's head credentials.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="text-amber-400 hover:text-amber-300 hover:underline font-semibold text-xs whitespace-nowrap self-start sm:self-auto shrink-0"
            >
              Switch Society Account →
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-6">
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Official Members</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {clubMembers.length}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              {clubMembers.filter((m) => m.status === 'Active').length} Active
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Lead Roles Assigned</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {clubMembers.filter((m) => m.role.toLowerCase().includes('lead') || m.isAdmin).length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Heads & Coordinators</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Freshman Batch 2026</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
              {clubMembers.filter((m) => m.batch === '2026').length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">1st Year Inducted</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Induction Queue</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
              {clubApplications.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Submitted Applications</div>
          </div>
        </div>
      </div>

      {/* Main Tab Bar & Actions */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeSubTab === 'members'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Club Members Roster ({clubMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('applications')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeSubTab === 'applications'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Applications Queue ({clubApplications.length})</span>
          </button>

          {onOpenAllApplicants && (
            <button
              type="button"
              onClick={onOpenAllApplicants}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg transition-colors"
              title="Open full campus applicant roster page"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Full Applicants Review Page</span>
              <span className="md:hidden">All Applicants</span>
            </button>
          )}

          {onOpenPostNotice && (
            <button
              type="button"
              onClick={onOpenPostNotice}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Broadcast notice regarding club events to campus notice board"
            >
              <Bell className="h-3.5 w-3.5 text-amber-400" />
              <span>Broadcast Notice</span>
            </button>
          )}
        </div>

        {activeSubTab === 'members' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Member & Assign Role</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: MEMBERS ROSTER */}
      {activeSubTab === 'members' && (
        <div className="mt-6 space-y-6">
          {/* Controls: Search & Role Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by name, roll number, or role..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg self-start sm:self-auto">
              <span className="text-[11px] text-slate-500 px-2 font-medium">Filter:</span>
              {[
                { id: 'all', label: 'All Members' },
                { id: 'lead', label: 'Leads & Coordinators' },
                { id: 'core', label: 'Core Members' },
                { id: 'admin', label: 'Admin Only' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setRoleFilter(opt.id)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    roleFilter === opt.id
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Members Table / Card View */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Member Name & Details</th>
                    <th className="py-3.5 px-4">Roll No & Branch</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4">Assigned Role & Domain</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-slate-800/40"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs text-slate-950"
                            style={{ backgroundColor: currentClub.accentColor }}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{member.name}</span>
                              {member.isAdmin && (
                                <span className="text-[9px] font-bold uppercase bg-amber-400/20 text-amber-400 border border-amber-400/40 px-1.5 py-0.2 rounded">
                                  Head (Admin)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-slate-500" />
                              <span>{member.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div>{member.rollNumber}</div>
                        <div className="text-[11px] font-sans text-slate-500">
                          {member.branch}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-semibold">Batch {member.batch}</span>
                        <div className="text-[10px] text-slate-500">
                          {member.batch === '2026' ? '1st Year' : member.batch === '2025' ? '2nd Year' : '3rd/4th Year'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-amber-400">
                          {member.role}
                        </div>
                        {member.subDomain && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {member.subDomain}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          member.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {member.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditRole(member)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors"
                            title="Assign or change role"
                          >
                            <Edit3 className="h-3 w-3 text-amber-400" />
                            <span>Assign Role</span>
                          </button>

                          {!member.isAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${member.name} from ${currentClub.name}?`)) {
                                  onRemoveMember(member.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors border border-transparent hover:border-red-900/40"
                              title="Remove member"
                              aria-label={`Remove ${member.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                        <div className="font-semibold text-white">No members found</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Try adjusting your search query or role filter.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: APPLICATIONS INDUCTION QUEUE */}
      {activeSubTab === 'applications' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              Students who applied for <strong className="text-white">{currentClub.name}</strong> via the recruitment portal. As club admin, you can review their statement, achievements, and audition video, then assign them a role and induct them.
            </div>
            <div className="font-mono text-xs text-amber-400 font-bold tabular-nums">
              {clubApplications.length} Applications Received
            </div>
          </div>

          {clubApplications.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center text-slate-400">
              <Sparkles className="mx-auto h-10 w-10 text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">No pending induction applications</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No students have submitted applications for {currentClub.name} yet, or all previous applicants have already been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {clubApplications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition-all hover:border-slate-700"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono text-amber-400 font-bold">{app.id}</span>
                        <span>·</span>
                        <span>{app.applicantName}</span>
                        <span>·</span>
                        <span className="font-mono">{app.rollNumber}</span>
                        <span>·</span>
                        <span>{app.branch} ({app.year})</span>
                      </div>

                      <div className="text-xs text-slate-300">
                        <span className="text-slate-500 font-medium">Applied Domain: </span>
                        <span className="font-semibold text-white">{app.subDomain}</span>
                      </div>

                      <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-850 text-xs text-slate-300">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                          Statement of Purpose:
                        </div>
                        <p className="leading-relaxed">{app.statementOfPurpose}</p>
                      </div>

                      {app.experienceOrAchievements && (
                        <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-850 text-xs text-slate-300">
                          <div className="text-[10px] text-amber-400 uppercase font-semibold mb-1 flex items-center gap-1.5">
                            <Award className="h-3 w-3" />
                            Previous Experience or Achievements:
                          </div>
                          <p className="leading-relaxed">{app.experienceOrAchievements}</p>
                        </div>
                      )}

                      {app.videoUrl && (
                        <div className="pt-1 flex items-center gap-2">
                          <a
                            href={app.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Watch Audition / Demo Video</span>
                            <ExternalLink className="h-3 w-3 ml-0.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {app.status}
                      </span>

                      <button
                        onClick={() => handleStartInduct(app)}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Induct & Assign Role</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD NEW MEMBER */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="animate-scale-in relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 text-white shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="btn-tactile absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <UserPlus className="h-4 w-4" />
              <span>Admin Action: Add Member to {currentClub.acronym}</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              Onboard Club Member
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a student to the official roster and assign their society role.
            </p>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Aniket Verma"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                {addErrors.name && (
                  <p className="mt-1 text-[11px] text-red-400">{addErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Institute Roll Number *
                  </label>
                  <input
                    type="text"
                    value={addForm.rollNumber}
                    onChange={(e) => setAddForm({ ...addForm, rollNumber: e.target.value })}
                    placeholder="e.g. 26101045"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white uppercase placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  {addErrors.rollNumber && (
                    <p className="mt-1 text-[11px] text-red-400">{addErrors.rollNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Institute Email *
                  </label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="aniket@iiitnr.edu.in"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  {addErrors.email && (
                    <p className="mt-1 text-[11px] text-red-400">{addErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Academic Branch
                  </label>
                  <select
                    value={addForm.branch}
                    onChange={(e) => setAddForm({ ...addForm, branch: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="DSAI">Data Science & AI (DSAI)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="Postgraduate">M.Tech / PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Academic Batch
                  </label>
                  <select
                    value={addForm.batch}
                    onChange={(e) => setAddForm({ ...addForm, batch: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="2026">1st Year (Batch of 2026)</option>
                    <option value="2025">2nd Year (Batch of 2025)</option>
                    <option value="2024">3rd Year (Batch of 2024)</option>
                    <option value="2023">4th Year (Batch of 2023)</option>
                  </select>
                </div>
              </div>

              {/* Assigned Role */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned Club Role *
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {COMMON_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="custom">+ Specify Custom Role...</option>
                </select>

                {addForm.role === 'custom' && (
                  <input
                    type="text"
                    value={addForm.customRole}
                    onChange={(e) => setAddForm({ ...addForm, customRole: e.target.value })}
                    placeholder="Enter custom role title (e.g. Lead Sound Engineer, Esports Captain)"
                    className="mt-2 w-full rounded-lg border border-amber-400/40 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                )}
                {addErrors.role && (
                  <p className="mt-1 text-[11px] text-red-400">{addErrors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sub-Domain / Department (Optional)
                </label>
                <input
                  type="text"
                  value={addForm.subDomain}
                  onChange={(e) => setAddForm({ ...addForm, subDomain: e.target.value })}
                  placeholder="e.g. Full-Stack Dev, Vocals, Stage Direction, Logistics"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                >
                  Confirm & Onboard Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT / REASSIGN ROLE */}
      {editingMember && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={() => setEditingMember(null)}
        >
          <div
            className="animate-scale-in relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingMember(null)}
              className="btn-tactile absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Edit3 className="h-4 w-4" />
              <span>Assign / Update Role</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {editingMember.name}
            </h3>
            <div className="text-xs text-slate-400 mt-0.5">
              <span>{editingMember.rollNumber}</span>
              <span className="mx-1.5">·</span>
              <span>B.Tech {editingMember.branch} (Batch {editingMember.batch})</span>
            </div>

            <form onSubmit={handleSaveEditRole} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select New Role
                </label>
                <select
                  value={editRoleSelect}
                  onChange={(e) => setEditRoleSelect(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {COMMON_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="custom">+ Custom Role Title...</option>
                </select>

                {editRoleSelect === 'custom' && (
                  <input
                    type="text"
                    value={editCustomRole}
                    onChange={(e) => setEditCustomRole(e.target.value)}
                    placeholder="Enter custom role title..."
                    className="mt-2 w-full rounded-lg border border-amber-400/40 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sub-Domain / Department
                </label>
                <input
                  type="text"
                  value={editSubDomain}
                  onChange={(e) => setEditSubDomain(e.target.value)}
                  placeholder="e.g. Competitive Programming, Stage Play"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INDUCT FROM APPLICATION */}
      {inductingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setInductingApp(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Induct Applicant</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              Induct {inductingApp.applicantName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Roll No: {inductingApp.rollNumber} · {inductingApp.branch} ({inductingApp.year})
            </p>

            <div className="mt-4 rounded-lg bg-slate-950/70 p-3 border border-slate-800 text-xs text-slate-300">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                Applied Sub-Domain
              </div>
              <div className="font-semibold text-amber-400 mt-0.5">
                {inductingApp.subDomain}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assign Club Role *
                </label>
                <select
                  value={inductRoleSelect}
                  onChange={(e) => setInductRoleSelect(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {COMMON_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="custom">+ Custom Role Title...</option>
                </select>

                {inductRoleSelect === 'custom' && (
                  <input
                    type="text"
                    value={inductCustomRole}
                    onChange={(e) => setInductCustomRole(e.target.value)}
                    placeholder="Enter custom role title..."
                    className="mt-2 w-full rounded-lg border border-amber-400/40 bg-slate-950 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setInductingApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInduct}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                >
                  Confirm Induction & Add to Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
