import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { adminService, AdminAccount } from '../../services/adminService';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Copy,
  Sparkles,
  Database,
  RefreshCw,
  Clock,
  Flame
} from 'lucide-react';

export const AdminManagementView: React.FC = () => {
  const { addToast, purgeAllIssues, purgeResolvedOlderThan3Days, issues } = useApp();
  const [admins, setAdmins] = useState<AdminAccount[]>(() => adminService.getAdmins());

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Mgsai@1025');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AdminAccount['role']>('Campus Admin');
  const [department, setDepartment] = useState('Maintenance Operations');
  const [twoFactorSecret, setTwoFactorSecret] = useState('JBSWY3DPEHPK3PXP');
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState<boolean>(() => adminService.isTwoFactorRequired());

  const generateNew2FASecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTwoFactorSecret(secret);
    addToast('info', 'New 2FA Secret Generated', 'Provide this secret key to the new admin for Google Authenticator.');
  };

  const handleCopySecret = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    addToast('success', 'Copied to Clipboard', '2FA Secret Key copied.');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter administrator name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid administrator email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const res = adminService.addAdmin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      twoFactorSecret,
      role,
      department
    });

    if (!res.success || !res.admin) {
      setError(res.message || 'Failed to add administrator');
      return;
    }

    setAdmins(adminService.getAdmins());
    addToast('success', 'Admin Account Created', `${res.admin.name} has been granted ${role} access.`);
    
    // Reset form
    setName('');
    setEmail('');
    setPassword('Mgsai@1025');
    generateNew2FASecret();
  };

  const handleDeleteAdmin = (adminEmail: string, adminName: string) => {
    if (adminEmail === 'mattasaiswaroop5641@gmail.com') {
      addToast('error', 'Action Blocked', 'Primary Super Administrator account cannot be removed.');
      return;
    }

    if (window.confirm(`Are you sure you want to revoke administrator access for ${adminName} (${adminEmail})?`)) {
      adminService.removeAdmin(adminEmail);
      setAdmins(adminService.getAdmins());
      addToast('info', 'Admin Access Revoked', `Removed admin privileges for ${adminName}.`);
    }
  };

  const handleRun3DayRetention = async () => {
    setIsPurging(true);
    await purgeResolvedOlderThan3Days();
    setIsPurging(false);
  };

  const handlePurgeWholeDatabase = async () => {
    if (window.confirm('⚠️ WARNING: Are you sure you want to permanently delete ALL issues from MongoDB Atlas and local storage? This action cannot be undone.')) {
      setIsPurging(true);
      await purgeAllIssues();
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>Administrator Access Control & Database Maintenance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin & Database Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Enroll new administrators, manage 2FA credentials, and configure automated 3-day storage retention policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-2xl font-black text-white">{admins.length}</span>
            <span className="block text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Active Admins</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-2xl font-black text-white">{issues.length}</span>
            <span className="block text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Live Tickets</span>
          </div>
        </div>
      </div>

      {/* 2FA & Email OTP Global Security Policy Switch Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`p-3 rounded-2xl flex-shrink-0 ${
            twoFactorRequired 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Admin 2FA & Email OTP Verification</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                twoFactorRequired 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {twoFactorRequired ? 'Enforced (Active)' : 'Disabled (Direct Login)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {twoFactorRequired 
                ? 'All administrators are required to verify a 6-digit Email OTP or Google Authenticator code on sign-in.' 
                : '2FA is turned OFF. Administrators will sign in directly with their email & password without OTP prompts.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const nextState = !twoFactorRequired;
            setTwoFactorRequired(nextState);
            adminService.setTwoFactorRequired(nextState);
            if (nextState) {
              addToast('success', '2FA Enforced', 'Admin login now requires Email OTP or Google Authenticator.');
            } else {
              addToast('info', '2FA Disabled', 'Admin login will now proceed directly with email and password.');
            }
          }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
            twoFactorRequired
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
          }`}
        >
          <span>{twoFactorRequired ? 'Turn OFF 2FA Verification' : 'Turn ON 2FA Verification'}</span>
        </button>
      </div>

      {/* Top Grid: Admin Enroller & Admin Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form to Add New Admin (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Administrator</h2>
              <p className="text-xs text-slate-500">Create login credentials and 2FA key</p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddAdmin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Admin Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prof. Rajesh Sharma"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Admin Email (Login & Notifications) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. newadmin@campusfix.edu"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Admin Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminAccount['role'])}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="Campus Admin">Campus Admin</option>
                  <option value="Facility Manager">Facility Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Electrical Dept"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Initial Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2FA Key Generator Card */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Google Authenticator 2FA Secret</span>
                </span>
                <button
                  type="button"
                  onClick={generateNew2FASecret}
                  className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Generate New
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={twoFactorSecret}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold text-indigo-950 bg-white border border-indigo-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => handleCopySecret(twoFactorSecret)}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-indigo-600/90 leading-tight">
                The new admin will enter this key in Google Authenticator to generate 6-digit TOTP codes during sign in.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Grant Administrator Privileges</span>
            </button>
          </form>
        </div>

        {/* Right Column: Registered Admins Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Authorized Admin Directory</h2>
              <p className="text-xs text-slate-500">Accounts with triage & dispatch clearance</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{admins.length} Active</span>
            </span>
          </div>

          <div className="space-y-3">
            {admins.map(admin => (
              <div
                key={admin.id}
                className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{admin.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          admin.role === 'Super Admin' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {admin.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{admin.email}</span>
                      </p>
                    </div>
                  </div>

                  {admin.email !== 'mattasaiswaroop5641@gmail.com' && (
                    <button
                      onClick={() => handleDeleteAdmin(admin.email, admin.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Revoke Admin Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Department:</span>
                    <span className="font-semibold text-slate-800">{admin.department || 'Central'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">2FA Key:</span>
                    <span className="font-mono font-bold text-indigo-700">{admin.twoFactorSecret.substring(0, 8)}...</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Enrolled:</span>
                    <span className="font-medium text-slate-700">{admin.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Database Health & 3-Day Retention Policy Controls */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Database Storage & Retention Policy</h2>
            <p className="text-xs text-slate-500">Automated space optimization and emergency database reset</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: 3-Day Auto-Purge Retention Policy */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>3-Day Auto-Purge Policy (Active)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                AUTOMATED
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To keep MongoDB lightweight and responsive, tickets marked as <strong className="text-emerald-700">Resolved</strong> are automatically deleted after <strong>3 days</strong> of resolution.
            </p>

            <button
              type="button"
              disabled={isPurging}
              onClick={handleRun3DayRetention}
              className="w-full py-2.5 px-4 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
              <span>🧹 Run 3-Day Auto-Purge Now</span>
            </button>
          </div>

          {/* Card 2: Danger Zone - Purge Entire Database */}
          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Danger Zone: Database Reset</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                PERMANENT
              </span>
            </div>

            <p className="text-xs text-rose-700 leading-relaxed">
              Permanently purges <strong>all {issues.length} tickets</strong> from MongoDB Atlas cloud database and local browser storage. Use when starting a completely fresh semester.
            </p>

            <button
              type="button"
              disabled={isPurging}
              onClick={handlePurgeWholeDatabase}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>🗑️ Purge & Delete Entire Database</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
