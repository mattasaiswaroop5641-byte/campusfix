import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Department, Block, UserProfile } from '../../types';
import { DEPARTMENTS, BLOCKS } from '../../data/demoData';
import { validateHumanName, validateRegNumber, validatePassword, validateEmail, userService } from '../../services/validationService';
import { 
  Briefcase, 
  ArrowLeft, 
  User, 
  Mail,
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  LogIn,
  UserPlus
} from 'lucide-react';

interface FacultyOnboardProps {
  onBack: () => void;
}

export const FacultyOnboard: React.FC<FacultyOnboardProps> = ({ onBack }) => {
  const { login, addToast } = useApp();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up State
  const [facultyId, setFacultyId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<Department>('CSE');
  const [block, setBlock] = useState<Block>('Block A');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  // Handle Existing Faculty Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginIdentifier.trim()) {
      setError('Please enter your Faculty / Employee ID or Email');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password');
      return;
    }

    const res = userService.login(loginIdentifier.trim(), loginPassword);
    if (!res.success || !res.user) {
      setError(res.message || 'Login failed. Please check your credentials.');
      return;
    }

    login(res.user);
    addToast('success', `Welcome Professor ${res.user.name}!`, 'Faculty portal active.');
  };

  // Handle New Faculty Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validate Faculty ID
    const regCheck = validateRegNumber(facultyId, 'faculty');
    if (!regCheck.valid) {
      setError(regCheck.error || 'Invalid Faculty / Employee ID');
      return;
    }

    // 2. Validate Real Human Name (rejects kjhfjsednjsn, etc.)
    const nameCheck = validateHumanName(name);
    if (!nameCheck.valid) {
      setError(nameCheck.error || 'Please enter your genuine full name');
      return;
    }

    // 3. Validate Email Address
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Please enter a valid email address');
      return;
    }

    // 4. Validate Password
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setError(passCheck.error || 'Password must be at least 6 characters');
      return;
    }

    const cleanId = facultyId.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 5. Register in User Registry
    const newFacultyProfile: UserProfile = {
      id: 'fac_' + cleanId.toLowerCase(),
      regNumber: cleanId,
      name: cleanName,
      email: cleanEmail,
      role: 'faculty',
      department,
      block,
      password
      // Section is NEVER present for faculty
    };

    const regResult = userService.register(newFacultyProfile);
    if (!regResult.success) {
      setError(regResult.message || 'Registration error');
      return;
    }

    login(newFacultyProfile);
    addToast('success', `Faculty Account Registered for ${cleanName}!`, `Updates will be sent to ${cleanEmail}`);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Roles</span>
        </button>

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
          <span>Faculty Portal</span>
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => { setAuthMode('signup'); setError(''); }}
          className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'signup'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Faculty Registration</span>
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('signin'); setError(''); }}
          className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'signin'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Faculty Sign In</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ===================== MODE 1: SIGN IN ===================== */}
      {authMode === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              Faculty ID or Registered Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. FAC-1024 or professor@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your faculty password"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Faculty Portal</span>
          </button>
        </form>
      )}

      {/* ===================== MODE 2: SIGN UP ===================== */}
      {authMode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-3.5 animate-in fade-in duration-200">
          
          {/* Faculty ID & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Faculty / Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value.toUpperCase())}
                placeholder="e.g. FAC-1024"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono font-bold text-slate-900 uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Sharma"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              Email Address (For Resolution Updates) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. professor@college.edu or name@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
                required
              />
            </div>
          </div>

          {/* Department & Block (Section is NEVER shown) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Office Block
              </label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value as Block)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
              >
                {BLOCKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              Create Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Complete Registration & Enter</span>
          </button>
        </form>
      )}

    </div>
  );
};
