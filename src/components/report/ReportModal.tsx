import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category, Block, CampusIssue } from '../../types';
import { CATEGORIES, BLOCKS } from '../../data/demoData';
import { AIScanModal } from './AIScanModal';
import { 
  X, 
  PlusCircle, 
  Sparkles, 
  MapPin, 
  Mail,
  GraduationCap, 
  Briefcase, 
  UploadCloud, 
  Check, 
  Zap, 
  FileText 
} from 'lucide-react';

export const ReportModal: React.FC = () => {
  const { 
    isReportModalOpen, 
    setIsReportModalOpen, 
    currentUser, 
    createIssue, 
    setSelectedIssue,
    setActiveTab
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<Category>('Wi-Fi / Network');
  const [block, setBlock] = useState<Block>(currentUser?.block || 'Block A');
  const [roomArea, setRoomArea] = useState('');
  const [description, setDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState<string>(currentUser?.email || '');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [createdIssue, setCreatedIssue] = useState<CampusIssue | null>(null);
  const [showAIScan, setShowAIScan] = useState<boolean>(false);
  const [error, setError] = useState('');

  if (!isReportModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a problem description');
      return;
    }

    const title = description.length > 45 ? description.substring(0, 42) + '...' : description;

    const newIssue = createIssue({
      title,
      description: description.trim(),
      category: selectedCategory,
      location: roomArea.trim() || 'General Area',
      block,
      imageUrl,
      reporterEmail: reporterEmail.trim() || currentUser?.email
    });

    setCreatedIssue(newIssue);
    setShowAIScan(true);
  };

  const handleQuickPreset = (desc: string, cat: Category, loc: string) => {
    setDescription(desc);
    setSelectedCategory(cat);
    setRoomArea(loc);
    setError('');
  };

  if (showAIScan && createdIssue) {
    return (
      <AIScanModal
        issue={createdIssue}
        onClose={() => {
          setShowAIScan(false);
          setIsReportModalOpen(false);
          setCreatedIssue(null);
        }}
        onViewIssue={(issue) => {
          setShowAIScan(false);
          setIsReportModalOpen(false);
          setSelectedIssue(issue);
          setCreatedIssue(null);
          if (currentUser?.role === 'admin') {
            setActiveTab('all-issues');
          } else {
            setActiveTab('my-reports');
          }
        }}
      />
    );
  }

  const isFaculty = currentUser?.role === 'faculty';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="absolute top-5 right-5 p-2 text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
              New Ticket
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            Report a Campus Problem
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            CampusFix AI will automatically evaluate priority and route to the appropriate maintenance department.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          {/* User Auto-Filled Profile Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                isFaculty ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isFaculty ? <Briefcase className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Reporter: {currentUser?.name || (isFaculty ? 'Faculty Member' : 'Student')}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase">
                    {isFaculty ? 'Faculty' : 'Student'}
                  </span>
                </div>
                
                {/* STRICT ROLE RENDERING: Faculty NEVER shows Section! */}
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Dept: <strong>{currentUser?.department || 'CSE'}</strong> • Block: <strong>{currentUser?.block || 'Block A'}</strong>
                  {!isFaculty && currentUser?.section && (
                    <> • Section: <strong className="text-blue-600">{currentUser.section}</strong></>
                  )}
                  {isFaculty && (
                    <span className="text-slate-400"> (Section: N/A)</span>
                  )}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-center">
              ✓ Profile Auto-Linked
            </span>
          </div>

          {/* Issue Suggestions Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Sample Issue Templates
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('The Wi-Fi is not working in Computer Lab 3.', 'Wi-Fi / Network', 'Computer Lab 3')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium transition-colors"
              >
                📶 "Wi-Fi not working in Computer Lab 3"
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('AC not cooling in faculty room 302.', 'AC / HVAC', 'Faculty Room 302')}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium transition-colors"
              >
                ❄️ "AC not cooling in faculty room"
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('Severe water leakage near ground floor corridor.', 'Plumbing', 'Ground Floor Washroom')}
                className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 text-xs font-medium transition-colors"
              >
                🚰 "Water leakage in hallway"
              </button>
            </div>
          </div>

          {/* Category Selectable Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Problem Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{cat.icon}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${
                      isSelected ? 'text-blue-900' : 'text-slate-800'
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Campus Block <span className="text-rose-500">*</span>
              </label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value as Block)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800"
              >
                {BLOCKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Room / Area <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={roomArea}
                  onChange={(e) => setRoomArea(e.target.value)}
                  placeholder="e.g. Computer Lab 3 / Room 102"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue clearly (e.g. The Wi-Fi is not working in Computer Lab 3)..."
              className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900 leading-relaxed"
              required
            ></textarea>
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Include specific symptoms (e.g. "slow speed", "flickering", "completely dead") for better diagnostic triage.
            </p>
          </div>

          {/* User-Defined Notification Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              Real-Time Notification & Update Email <span className="text-blue-600 font-semibold">(Auto-Filled)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="Enter your personal email to receive real-time ticket updates..."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Real-time ticket receipt, technician dispatch, and resolution notifications will be delivered directly to this email address.
            </p>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              Attach Photo Proof (Optional)
            </label>
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                <img
                  src={imageUrl}
                  alt="Uploaded problem preview"
                  className="w-full h-44 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-4 text-center transition-colors bg-slate-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImageUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-1.5" />
                <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  Click or drag image to upload photo proof
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </label>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Report & Run AI Triage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
