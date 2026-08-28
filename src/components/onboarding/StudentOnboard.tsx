import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Department, Block, Section, UserProfile } from '../../types';
import { DEPARTMENTS, BLOCKS, SECTIONS } from '../../data/demoData';
import { validateHumanName, validateRegNumber, validatePassword, validateEmail, userService } from '../../services/validationService';
import { 
  GraduationCap, 
  ArrowLeft, 
  User, 
  Mail,
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  LogIn,
  UserPlus
} from 'lucide-react';

interface StudentOnboardProps {
  onBack: () => void;
}

export const StudentOnboard: React.FC<StudentOnboardProps> = ({ onBack }) => {
  const { login, addToast } = useApp();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up State
  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<Department>('CSE');
  const [block, setBlock] = useState<Block>('Block A');
  const [section, setSection] = useState<Section>('Section A');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  // Handle Existing Student Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginIdentifier.trim()) {
      setError('Please enter your Registration / Roll Number or Email');
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
    addToast('success', `Welcome back, ${res.user.name}!`, 'Student session restored.');
  };

  // Handle New Student Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validate Registration Number
    const regCheck = validateRegNumber(regNumber, 'student');
    if (!regCheck.valid) {
      setError(regCheck.error || 'Invalid Registration Number');
      return;
    }

    // 2. Validate Real Human Name (rejects kjhfjsednjsn, asdf, etc.)
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

    const cleanReg = regNumber.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 5. Register in User Registry
    const newStudentProfile: UserProfile = {
      id: 'stu_' + cleanReg.toLowerCase(),
      regNumber: cleanReg,
      name: cleanName,
      email: cleanEmail,
      role: 'student',
      department,
      block,
      section,
      password
    };

    const regResult = userService.register(newStudentProfile);
    if (!regResult.success) {
      setError(regResult.message || 'Registration error');
      return;
    }

    login(newStudentProfile);
    addToast('success', `Account Created for ${cleanName}!`, `Updates will be sent to ${cleanEmail}`);
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

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          <span>Student Portal</span>
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => { setAuthMode('signup'); setError(''); }}
          className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'signup'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Registration</span>
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('signin'); setError(''); }}
          className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'signin'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Existing Student Login</span>
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
              Roll No. or Registered Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. 21B91A0501 or student@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
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
                placeholder="Enter your student password"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
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
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Student Dashboard</span>
          </button>
        </form>
      )}

      {/* ===================== MODE 2: SIGN UP ===================== */}
      {authMode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-3.5 animate-in fade-in duration-200">
          
          {/* Registration Number & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Roll / Reg Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 21B91A0501"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono font-bold text-slate-900 uppercase"
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
                placeholder="e.g. Sai Swaroop"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
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
                placeholder="e.g. yourname@gmail.com or student@college.edu"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
                required
              />
            </div>
          </div>

          {/* Department, Block, Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Hostel / Block
              </label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value as Block)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
              >
                {BLOCKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as Section)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-700 focus:outline-none"
              >
                {SECTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
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
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
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
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Complete Registration & Enter</span>
          </button>
        </form>
      )}

    </div>
  );
};
