import React, { useState } from 'react';
import { totpService, ADMIN_2FA_SECRET } from '../../services/totpService';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Smartphone, 
  Copy, 
  Check, 
  Lock, 
  Sparkles, 
  QrCode, 
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Admin2FASetupView: React.FC = () => {
  const { addToast } = useApp();
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(ADMIN_2FA_SECRET);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    addToast('info', 'Copied to Clipboard', '2FA Secret key copied.');
  };

  const handleTestVerify = () => {
    if (testCode.trim().length !== 6) {
      setTestResult({ success: false, message: 'Please enter a 6-digit code to test.' });
      return;
    }
    const isValid = totpService.verify(testCode.trim());
    if (isValid) {
      setTestResult({ success: true, message: '✓ Code Valid! Your Google Authenticator device is synchronized correctly.' });
    } else {
      setTestResult({ success: false, message: '✗ Code Invalid. Check device clock synchronization.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">
                2FA Device Enrollment & Security Setup
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Private Admin Zone
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configure or link authorized smartphones with Google Authenticator (RFC 6238 TOTP).
            </p>
          </div>
        </div>
      </div>

      {/* Main Enrollment Card */}
      <div className="glass-card p-8 rounded-3xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* QR Code Container */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-3xl border border-slate-200/90 text-center">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
              <img
                src={totpService.getQRCodeUrl()}
                alt="Google Authenticator QR Code"
                className="w-44 h-44 object-contain rounded-xl"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-3">
              Scan with Google Authenticator App
            </p>
          </div>

          {/* Instructions & Secret Key */}
          <div className="md:col-span-7 space-y-4 text-left">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                How to Enroll Your Mobile Device
              </h3>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed font-medium">
                <li>Open <strong>Google Authenticator</strong> on your phone.</li>
                <li>Tap <strong>+</strong> and select <strong>Scan a QR code</strong>.</li>
                <li>Point your camera at the QR code on the left.</li>
                <li>The entry <strong>CampusFix Admin</strong> will now generate dynamic 6-digit codes every 30 seconds.</li>
              </ol>
            </div>

            {/* Manual Secret Key */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Manual Setup Key (If Camera Unavailable)
              </span>
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-mono font-bold text-sm tracking-wider">
                  {ADMIN_2FA_SECRET}
                </div>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSecret ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Verification Test Box */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Test Device Synchronization
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            Type the current code from your phone's app below to test that your device is recognized by the server:
          </p>

          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={6}
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-36 px-4 py-2 text-center text-lg font-mono font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleTestVerify}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Test Verify Code
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
