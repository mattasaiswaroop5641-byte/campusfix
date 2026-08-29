import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { totpService } from '../../services/totpService';
import { securityService } from '../../services/securityService';
import { adminService } from '../../services/adminService';
import { apiService } from '../../services/apiService';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Mail, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
  Send,
  KeyRound
} from 'lucide-react';

interface AdminLoginProps {
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack }) => {
  const { loginAdmin, addToast } = useApp();
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  
  // Clean blank production inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Verification Mode: 'email_otp' (Default) or 'authenticator'
  const [authMethod, setAuthMethod] = useState<'email_otp' | 'authenticator'>('email_otp');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  
  // 6-Digit PIN State
  const [totpDigits, setTotpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totpService.getSecondsRemaining());
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Rate Limiting / Lockout Protection
  const [lockout, setLockout] = useState<{ locked: boolean; remainingSeconds: number }>(() => securityService.isLockedOut());
  const [attemptsLeft, setAttemptsLeft] = useState<number>(5);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(totpService.getSecondsRemaining());
      const currentLockout = securityService.isLockedOut();
      setLockout(currentLockout);
      
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerSendEmailOtp = async (targetEmail: string) => {
    setIsSendingOtp(true);
    setError('');
    const res = await apiService.sendAdminEmailOtp(targetEmail);
    setIsSendingOtp(false);
    
    if (res.success) {
      setResendTimer(30);
      addToast('success', 'Verification Code Sent', `6-digit security code dispatched to ${targetEmail}`);
    } else {
      setError(res.message || 'Failed to dispatch verification code. Please try again.');
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockout.locked) {
      setError(`Security Policy: Account is temporarily locked. Please wait ${lockout.remainingSeconds}s.`);
      return;
    }

    if (!email.trim() || !password) {
      setError('Please provide administrator email and password');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAuth = adminService.isAuthorized(cleanEmail, password);

    if (!isAuth) {
      const result = securityService.recordFailedAttempt(email.trim() || 'unknown', 'Invalid password or unauthorized email');
      if (result.locked) {
        setLockout({ locked: true, remainingSeconds: result.remainingSeconds });
        setError(`Security Lockout: Maximum failed attempts exceeded. Access locked for ${result.remainingSeconds}s.`);
      } else {
        setAttemptsLeft(result.attemptsLeft);
        setError(`Invalid credentials. ${result.attemptsLeft} attempt(s) remaining before account lockout.`);
      }
      return;
    }

    setError('');

    // Check if 2FA is enforced in Admin Settings
    const is2FARequired = adminService.isTwoFactorRequired();
    if (!is2FARequired) {
      securityService.recordSuccessfulLogin(cleanEmail);
      addToast('success', 'Admin Access Granted', 'Signed in directly (2FA is currently turned OFF).');
      loginAdmin(cleanEmail);
      return;
    }

    setStep('2fa');
    setTotpDigits(['', '', '', '', '', '']);

    // If starting with email OTP mode, send code immediately
    if (authMethod === 'email_otp') {
      await triggerSendEmailOtp(cleanEmail);
    } else {
      addToast('info', '2FA Required', 'Enter the 6-digit code from Google Authenticator.');
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (lockout.locked) return;

    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...totpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setTotpDigits(newDigits);
      if (pasted.length === 6) {
        verifyAndSubmit(newDigits.join(''));
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...totpDigits];
    newDigits[index] = cleanChar;
    setTotpDigits(newDigits);
    setError('');

    // Auto-focus next input
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify on 6th digit
    if (index === 5 && cleanChar) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        verifyAndSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyAndSubmit = async (codeToVerify: string) => {
    if (lockout.locked) {
      setError(`Security Lockout active. Please wait ${lockout.remainingSeconds}s.`);
      return;
    }

    setIsVerifying(true);
    setError('');

    if (authMethod === 'email_otp') {
      // Verify via Backend Email OTP API
      const result = await apiService.verifyAdminEmailOtp(email.trim().toLowerCase(), codeToVerify);
      setIsVerifying(false);

      if (result.success && result.verified) {
        setIsSuccess(true);
        securityService.recordSuccessfulLogin(email);
        addToast('success', 'Email OTP Verified', 'Administrator access clearance granted.');
        
        setTimeout(() => {
          loginAdmin(email.trim().toLowerCase());
        }, 500);
      } else {
        const lockResult = securityService.recordFailedAttempt(email, 'Invalid Email OTP: ' + codeToVerify);
        if (lockResult.locked) {
          setLockout({ locked: true, remainingSeconds: lockResult.remainingSeconds });
          setError(`Account locked for ${lockResult.remainingSeconds}s due to consecutive invalid codes.`);
        } else {
          setAttemptsLeft(lockResult.attemptsLeft);
          setError(result.message || `Invalid verification code. ${lockResult.attemptsLeft} attempt(s) remaining.`);
        }
        setTotpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } else {
      // Verify via Google Authenticator TOTP
      setTimeout(() => {
        const isValid = totpService.verify(codeToVerify);
        if (isValid) {
          setIsSuccess(true);
          securityService.recordSuccessfulLogin(email);
          addToast('success', '2FA Authorized', 'Google Authenticator cryptographic challenge passed.');
          
          setTimeout(() => {
            loginAdmin(email.trim().toLowerCase());
          }, 500);
        } else {
          setIsVerifying(false);
          const lockResult = securityService.recordFailedAttempt(email, 'Invalid 2FA code: ' + codeToVerify);
          
          if (lockResult.locked) {
            setLockout({ locked: true, remainingSeconds: lockResult.remainingSeconds });
            setError(`Account locked for ${lockResult.remainingSeconds}s due to consecutive invalid 2FA codes.`);
          } else {
            setAttemptsLeft(lockResult.attemptsLeft);
            setError(`Invalid 2FA code. ${lockResult.attemptsLeft} attempt(s) remaining before security lockout.`);
          }

          setTotpDigits(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }, 300);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <button
          type="button"
          onClick={step === '2fa' ? () => setStep('credentials') : onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{step === '2fa' ? 'Back to Credentials' : 'Back to Role Selection'}</span>
        </button>

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1.5 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Enterprise 2FA</span>
        </span>
      </div>

      {/* Security Lockout Banner */}
      {lockout.locked && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-semibold text-rose-800 flex items-center gap-3 animate-in fade-in">
          <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-rose-900">Security Lockout Triggered</div>
            <p className="text-[11px] text-rose-700 mt-0.5">
              Too many invalid login attempts. System locked for <strong>{lockout.remainingSeconds} seconds</strong>.
            </p>
          </div>
        </div>
      )}

      {error && !lockout.locked && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: AUTHENTICATION CREDENTIALS */}
      {step === 'credentials' && (
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-950 to-indigo-950 text-white flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Administrator Sign In</h2>
              <p className="text-xs text-slate-500">Authorized personnel only. Protected by Email OTP & 2FA.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Administrator Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={lockout.locked}
                placeholder="Enter authorized admin email"
                autoComplete="email"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-700 transition-all font-medium text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={lockout.locked}
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-700 transition-all font-medium text-slate-900"
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

          {/* Verification Method Selector (Only shown if 2FA is ON) */}
          {adminService.isTwoFactorRequired() ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Preferred 2FA Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email_otp')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    authMethod === 'email_otp'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Email OTP Code</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Send 6-digit code to email</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod('authenticator')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    authMethod === 'authenticator'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 font-bold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>Authenticator App</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Google Authenticator TOTP</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>2FA Policy: <strong>Disabled</strong></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Direct Password Sign-In
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={lockout.locked || isSendingOtp}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:to-indigo-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isSendingOtp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>Sending Verification Code to Email...</span>
              </>
            ) : !adminService.isTwoFactorRequired() ? (
              <>
                <span>Sign In as Administrator</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </>
            ) : (
              <>
                <span>{authMethod === 'email_otp' ? 'Send Email OTP & Verify' : 'Verify Credentials & Request 2FA'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: 2FA VERIFICATION CODE SCREEN */}
      {step === '2fa' && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
                authMethod === 'email_otp' ? 'bg-blue-600' : 'bg-indigo-600'
              }`}>
                {authMethod === 'email_otp' ? <Mail className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-slate-900">Two-Factor Authentication</h2>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                    authMethod === 'email_otp' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {authMethod === 'email_otp' ? 'Email OTP' : 'Google Auth'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Security challenge for <strong>{email}</strong></p>
              </div>
            </div>

            {/* Quick Switch Button */}
            <button
              type="button"
              onClick={() => {
                const nextMethod = authMethod === 'email_otp' ? 'authenticator' : 'email_otp';
                setAuthMethod(nextMethod);
                setTotpDigits(['', '', '', '', '', '']);
                setError('');
                if (nextMethod === 'email_otp') {
                  triggerSendEmailOtp(email);
                }
              }}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              Use {authMethod === 'email_otp' ? 'Authenticator App' : 'Email OTP'}
            </button>
          </div>

          {/* Security Instruction Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>{authMethod === 'email_otp' ? 'Check Your Email' : 'Enter Authenticator Passcode'}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {authMethod === 'email_otp' ? (
                <>
                  A 6-digit one-time password has been sent to <strong>{email}</strong> from <code>campusfix5641@gmail.com</code>. Enter the code below.
                </>
              ) : (
                <>
                  Open the <strong>Google Authenticator</strong> app on your mobile device and enter the dynamic 6-digit passcode.
                </>
              )}
            </p>
          </div>

          {/* 6-Digit PIN Challenge Boxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                6-Digit Verification Code
              </label>
              
              {authMethod === 'authenticator' ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>Expires in {secondsRemaining}s</span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-medium">
                  Valid for 5 mins
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-2.5">
              {totpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isSuccess || isVerifying || lockout.locked}
                  className={`w-12 h-14 text-center text-2xl font-bold font-mono rounded-2xl border transition-all ${
                    isSuccess
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-400'
                      : digit
                      ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 text-slate-900'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Resend Email OTP Button (Only in Email Mode) */}
          {authMethod === 'email_otp' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Didn't receive the email?</span>
              <button
                type="button"
                onClick={() => triggerSendEmailOtp(email)}
                disabled={resendTimer > 0 || isSendingOtp}
                className="font-bold text-blue-600 hover:text-blue-800 disabled:text-slate-400 cursor-pointer flex items-center gap-1"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : resendTimer > 0 ? (
                  <span>Resend Code in {resendTimer}s</span>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Resend Verification Code</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Verify CTA */}
          <button
            type="button"
            onClick={() => verifyAndSubmit(totpDigits.join(''))}
            disabled={totpDigits.join('').length !== 6 || isVerifying || isSuccess || lockout.locked}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              totpDigits.join('').length === 6 && !isSuccess && !lockout.locked
                ? 'bg-slate-950 hover:bg-slate-900 text-white shadow-lg cursor-pointer active:scale-98'
                : isSuccess
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Clearance Granted! Entering Admin Console...</span>
              </>
            ) : isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Code & Complete Sign In</span>
              </>
            )}
          </button>

        </div>
      )}

    </div>
  );
};
