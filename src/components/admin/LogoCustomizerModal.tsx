import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Link,
  Shield,
  Award,
  Building2,
  Trash2,
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { COLLEGE_METADATA } from '../../data/collegeData';

interface LogoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Pre-built High-Res Vector Institutional Crests (Renderable as SVG Data URLs)
export const INSTITUTIONAL_LOGO_PRESETS = [
  {
    id: 'ggmdc-official',
    name: 'Govt. Girls Model Degree College Official Crest',
    tag: 'Recommended',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#065f46" />
          <stop offset="100%" stop-color="#022c22" />
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#g1)" stroke="url(#gold)" stroke-width="4" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="#fef3c7" stroke-width="1.2" stroke-dasharray="3,2" />
      <!-- Crescent & Star -->
      <path d="M 66 32 A 16 16 0 1 1 54 48 A 12 12 0 1 0 66 32 Z" fill="url(#gold)" />
      <polygon points="68,36 70,41 75,41 71,44 73,49 68,46 64,49 66,44 62,41 67,41" fill="url(#gold)" />
      <!-- Open Book -->
      <path d="M 38 68 Q 60 62 60 74 Q 60 62 82 68 L 82 82 Q 60 76 60 88 Q 60 76 38 82 Z" fill="#ffffff" stroke="#d97706" stroke-width="1.5" />
      <line x1="60" y1="74" x2="60" y2="88" stroke="#065f46" stroke-width="2" />
      <!-- Laurels -->
      <path d="M 28 62 Q 24 74 34 86" fill="none" stroke="url(#gold)" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 92 62 Q 96 74 86 86" fill="none" stroke="url(#gold)" stroke-width="2.5" stroke-linecap="round" />
      <!-- Banner Ribbon -->
      <path d="M 24 96 Q 60 88 96 96 L 90 104 Q 60 97 30 104 Z" fill="url(#gold)" stroke="#78350f" stroke-width="0.8" />
      <text x="60" y="101" font-size="5.5" font-weight="900" font-family="sans-serif" fill="#022c22" text-anchor="middle" letter-spacing="0.5">GGMDC • ESTD 1994</text>
    </svg>`,
  },
  {
    id: 'balochistan-hed',
    name: 'Higher Education Department Emblem',
    tag: 'Govt. Seal',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="gold2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#ca8a04" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#bg2)" stroke="url(#gold2)" stroke-width="4" />
      <!-- Shield -->
      <path d="M 38 36 L 82 36 L 82 66 Q 82 88 60 98 Q 38 88 38 66 Z" fill="#0f172a" stroke="url(#gold2)" stroke-width="2" />
      <!-- Torch of Knowledge -->
      <path d="M 58 44 L 62 44 L 63 68 L 57 68 Z" fill="url(#gold2)" />
      <path d="M 60 36 Q 66 40 60 45 Q 54 40 60 36 Z" fill="#ef4444" stroke="#f59e0b" stroke-width="1" />
      <!-- Scales -->
      <line x1="45" y1="52" x2="75" y2="52" stroke="url(#gold2)" stroke-width="1.8" />
      <circle cx="60" cy="52" r="2.5" fill="url(#gold2)" />
      <path d="M 45 52 L 40 62 L 50 62 Z" fill="none" stroke="url(#gold2)" stroke-width="1.2" />
      <path d="M 75 52 L 70 62 L 80 62 Z" fill="none" stroke="url(#gold2)" stroke-width="1.2" />
      <text x="60" y="108" font-size="5" font-weight="bold" font-family="sans-serif" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">DIRECTORATE OF COLLEGES</text>
    </svg>`,
  },
  {
    id: 'academic-excellence',
    name: 'Controller of Examinations Seal',
    tag: 'Academic Seal',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c2d12" />
          <stop offset="100%" stop-color="#451a03" />
        </linearGradient>
        <linearGradient id="gld3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#bg3)" stroke="url(#gld3)" stroke-width="4" />
      <circle cx="60" cy="60" r="48" fill="none" stroke="#fef3c7" stroke-width="1.5" />
      <!-- Graduation Cap -->
      <polygon points="60,38 86,48 60,58 34,48" fill="url(#gld3)" stroke="#fff" stroke-width="1" />
      <path d="M 45 54 L 45 66 Q 60 74 75 66 L 75 54" fill="none" stroke="url(#gld3)" stroke-width="2" />
      <path d="M 82 50 L 86 64 L 83 68" fill="none" stroke="#fde047" stroke-width="1.5" />
      <!-- Star & Laurel -->
      <polygon points="60,70 63,77 70,77 64,81 67,88 60,84 53,88 56,81 50,77 57,77" fill="url(#gld3)" />
      <text x="60" y="103" font-size="5" font-weight="900" font-family="sans-serif" fill="#fde047" text-anchor="middle" letter-spacing="0.5">EXAMINATION BRANCH</text>
    </svg>`,
  },
];

export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const LogoCustomizerModal: React.FC<LogoCustomizerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    collegeLogo,
    setCollegeLogo,
    collegeLogoRight,
    setCollegeLogoRight,
    collegeName,
    setCollegeName,
    showToast,
  } = useExam();

  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url' | 'settings'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [tempCollegeName, setTempCollegeName] = useState(collegeName || COLLEGE_METADATA.institutionName);
  const [logoPosition, setLogoPosition] = useState<'left' | 'both'>('left');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, SVG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB for optimal document rendering.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setCollegeLogo(base64Data);
      if (logoPosition === 'both') {
        setCollegeLogoRight(base64Data);
      }
      showToast('College logo uploaded successfully! Date sheet updated.', 'success');
      setPreviewError(false);
      if (onSuccess) onSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      showToast('Please provide an image URL.', 'error');
      return;
    }
    setCollegeLogo(urlInput.trim());
    if (logoPosition === 'both') {
      setCollegeLogoRight(urlInput.trim());
    }
    showToast('College logo URL applied to Date Sheet!', 'success');
    setUrlInput('');
    setPreviewError(false);
    if (onSuccess) onSuccess();
  };

  const handleSelectPreset = (svgString: string) => {
    const dataUrl = svgToDataUrl(svgString);
    setCollegeLogo(dataUrl);
    if (logoPosition === 'both') {
      setCollegeLogoRight(dataUrl);
    }
    showToast('Official crest applied to Date Sheet!', 'success');
    setPreviewError(false);
    if (onSuccess) onSuccess();
  };

  const handleRemoveLogo = () => {
    setCollegeLogo(null);
    setCollegeLogoRight(null);
    showToast('Custom logo removed. Default institutional emblem restored.', 'info');
  };

  const handleSaveCollegeName = () => {
    setCollegeName(tempCollegeName);
    showToast('Institution name updated for Date Sheet!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Date Sheet Logo &amp; Institutional Branding
              </h2>
              <p className="text-xs text-slate-300">
                Upload or select an official college logo for printouts and exports
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-300 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
              {collegeLogo && !previewError ? (
                <img
                  src={collegeLogo}
                  alt="College Logo Preview"
                  className="w-full h-full object-contain"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="text-center">
                  <Building2 className="w-7 h-7 text-emerald-700 mx-auto" />
                  <span className="text-[9px] font-bold text-slate-500 block uppercase">Default</span>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Header Preview
              </div>
              <div className="text-sm font-black text-slate-900">
                {tempCollegeName || 'Govt. Girls Model Degree College'}
              </div>
              <div className="text-xs text-slate-500">
                {collegeLogo ? 'Custom Logo Active • Saved for Printout' : 'Default Official Seal Active'}
              </div>
            </div>
          </div>

          {collegeLogo && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition cursor-pointer"
              title="Remove custom logo and restore default emblem"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Logo
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'presets'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Official Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'url'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            Image URL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Name &amp; Position
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* 1. Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center mb-3 transition">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Click to Choose College Logo File
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Supports PNG with transparent background, JPG, SVG vectors, or WebP (Max 5MB).
                </p>
                <span className="mt-3 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs">
                  Browse Computer / Phone
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Uploaded logos are saved in your local workspace and rendered at full resolution on printouts and PDFs.
                </span>
              </div>
            </div>
          )}

          {/* 2. Official Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Select one of the calibrated vector seals for Govt. Girls Model Degree College:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {INSTITUTIONAL_LOGO_PRESETS.map(preset => {
                  const dataUrl = svgToDataUrl(preset.svg);
                  const isSelected = collegeLogo === dataUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.svg)}
                      className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center text-center relative group ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md'
                          : 'border-slate-200 hover:border-emerald-400 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                        {preset.tag}
                      </span>
                      <div className="w-16 h-16 my-2 p-1">
                        <img
                          src={dataUrl}
                          alt={preset.name}
                          className="w-full h-full object-contain drop-shadow-xs"
                        />
                      </div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-2">
                        {preset.name}
                      </div>
                      {isSelected ? (
                        <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </div>
                      ) : (
                        <div className="mt-2 text-[10px] font-bold text-slate-400 group-hover:text-emerald-600">
                          Click to Use
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Image URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Logo Image Web Address (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.edu.pk/assets/ggmdc-logo.png"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ensure the image URL is accessible via HTTPS and permits cross-origin display.
                </p>
              </div>
            </div>
          )}

          {/* 4. Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date Sheet Institution Header Title:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempCollegeName}
                    onChange={e => setTempCollegeName(e.target.value)}
                    placeholder="Govt. Girls Model Degree College"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCollegeName}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Save Title
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Logo Arrangement on Printed Date Sheet:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setLogoPosition('left');
                      if (collegeLogo) setCollegeLogoRight(null);
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                      logoPosition === 'left'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs">Left Logo Only</div>
                    <div className="text-[10px] text-slate-500">Left side college crest + Right side quality seal</div>
                  </div>

                  <div
                    onClick={() => {
                      setLogoPosition('both');
                      if (collegeLogo) setCollegeLogoRight(collegeLogo);
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                      logoPosition === 'both'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs">Both Left &amp; Right</div>
                    <div className="text-[10px] text-slate-500">Mirrored crest on both corners of header</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            Done &amp; View Date Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
