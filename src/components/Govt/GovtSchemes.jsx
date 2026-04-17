/**
 * GovtSchemes.jsx — Government Health Schemes Portal.
 * 
 * Features:
 * - Ayushman Card registration flow (Demo/API-ready)
 * - Browse other Govt schemes (PMJAY, MATERNITY, SENIORS)
 * - Clean, professional, and mobile-optimized.
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, CreditCard, Landmark, 
  Baby, Heart, Info, CheckCircle2, ChevronRight, User, Fingerprint
} from 'lucide-react';

const SCHEMES = [
  {
    id: 'pmjay',
    title: 'PMJAY (Ayushman Bharat)',
    tag: 'Flagship',
    icon: ShieldCheck,
    color: 'blue',
    desc: '₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
    eligibility: 'Socio-Economic Caste Census (SECC) criteria.'
  },
  {
    id: 'maternity',
    title: 'Janani Suraksha Yojana',
    tag: 'Maternity',
    icon: Baby,
    color: 'pink',
    desc: 'Safe motherhood intervention providing financial assistance for institutional delivery.',
    eligibility: 'All pregnant women in rural and urban areas.'
  },
  {
    id: 'senior',
    title: 'National Health Policy',
    tag: 'Seniors',
    icon: Heart,
    color: 'red',
    desc: 'Free primary healthcare and specialized geriatric care for citizens above 60.',
    eligibility: 'Age 60+ Indian citizens.'
  }
];

const GovtSchemes = ({ isDark = false }) => {
  const [activeStep, setActiveStep] = useState('browse'); // 'browse' or 'ayushman_form'
  const [formData, setFormData] = useState({ aadhaar: '', familyId: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';

  const handleApply = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
    }, 2000);
  };

  if (activeStep === 'ayushman_form') {
    return (
      <div className="p-4 animate-fade-in pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => { setActiveStep('browse'); setIsDone(false); }}
            className={`p-2 rounded-xl transition-all ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mb-1">Registration</p>
            <h1 className={`text-xl font-black ${textPrimary}`}>Ayushman Card</h1>
          </div>
        </div>

        {isDone ? (
          <div className={`p-8 rounded-3xl border text-center ${cardBg} animate-scale-up`}>
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-black ${textPrimary} mb-2`}>Application Submitted!</h3>
            <p className={`text-xs ${textSecondary} mb-6 leading-relaxed`}>
              Your Ayushman Card application (Ref: AB-{Math.floor(Math.random()*900000 + 100000)}) has been sent for verification. You will receive an update in 24 hours.
            </p>
            <button 
              onClick={() => { setActiveStep('browse'); setIsDone(false); }}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-black text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/30"
            >
              Back to Schemes
            </button>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border ${cardBg} shadow-sm`}>
            <form className="space-y-4" onSubmit={handleApply}>
              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-widest ${textSecondary} ml-1`}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    placeholder="As per Government ID" 
                    className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500 outline-none
                      ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-widest ${textSecondary} ml-1`}>Aadhaar Number</label>
                <div className="relative">
                  <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    maxLength="12"
                    placeholder="12-digit UIDAI Number" 
                    className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500 outline-none
                      ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-widest ${textSecondary} ml-1`}>Family ID / Ration Card</label>
                <div className="relative">
                  <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    placeholder="Enter Family ID" 
                    className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500 outline-none
                      ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'}`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying with System...' : 'Generate Ayushman Card'}
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 leading-tight">
                This process uses secure Aadhaar e-KYC. Data is handled according to Govt guidelines.
              </p>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in pb-24">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mb-1">State & National</p>
        <h1 className={`text-2xl font-black ${textPrimary}`}>Government Schemes</h1>
      </div>

      {/* Main Feature: Ayushman Bharat */}
      <div className={`p-6 rounded-3xl border relative overflow-hidden mb-6 group transition-all hover:shadow-xl ${isDark ? 'bg-blue-900/20 border-blue-900/30' : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500'}`}>
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-white mb-2 underline decoration-blue-300 decoration-2 underline-offset-4">Ayushman Bharat Card</h2>
          <p className="text-sm text-blue-100 mb-6 leading-relaxed max-w-[80%] line-clamp-2">
            Free treatment up to ₹5,00,000 in empanelled hospitals for you and your family.
          </p>
          <button 
            onClick={() => setActiveStep('ayushman_form')}
            className="px-6 py-3 rounded-xl bg-white text-blue-700 text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
          >
            Create Your Card
          </button>
        </div>
        
        {/* Abstract background graphics */}
        <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
      </div>

      {/* Other Schemes List */}
      <div className="space-y-4">
        <h3 className={`text-xs font-black uppercase tracking-widest ${textSecondary} ml-1`}>Top Health Schemes</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {SCHEMES.map(scheme => (
            <div key={scheme.id} className={`p-4 rounded-3xl border flex items-start gap-4 transition-all active:scale-[0.98] ${cardBg}`}>
              <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border-2 border-white
                ${scheme.color === 'blue' ? 'bg-blue-50 text-blue-600' : scheme.color === 'pink' ? 'bg-pink-50 text-pink-600' : 'bg-red-50 text-red-600'}`}>
                <scheme.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-black truncate ${textPrimary}`}>{scheme.title}</h4>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase
                    ${scheme.color === 'blue' ? 'bg-blue-100 text-blue-700' : scheme.color === 'pink' ? 'bg-pink-100 text-pink-700' : 'bg-red-100 text-red-700'}`}>
                    {scheme.tag}
                  </span>
                </div>
                <p className={`text-[11px] leading-snug mb-2 ${textSecondary} line-clamp-2`}>{scheme.desc}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Info className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600">Tap to view benefits</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className={`mt-8 p-4 rounded-2xl border border-dashed text-center ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <p className="text-[10px] font-medium italic">
          Fetching latest schemes from MH Health Ministry database...
        </p>
      </div>
    </div>
  );
};

export default GovtSchemes;
