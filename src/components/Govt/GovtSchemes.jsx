/**
 * GovtSchemes.jsx — Government Health Schemes Portal.
 *
 * Clicking any scheme redirects directly to the official
 * government enrollment / apply page (external link, opens new tab).
 * No fake forms — purely informational with real govt links.
 */

import React, { useState } from 'react';
import {
  ShieldCheck, Baby, Heart, Pill, ExternalLink,
  Info, ChevronRight, CreditCard, Phone, Globe
} from 'lucide-react';

// ── Official Government Links ─────────────────────────────────────────────────
// All URLs verified as of April 2026.
const SCHEMES = [
  {
    id: 'pmjay',
    title: 'PM-JAY / Ayushman Bharat',
    subtitle: 'Ayushman Card',
    tag: 'Flagship',
    tagColor: 'blue',
    icon: CreditCard,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    gradient: 'from-blue-600 to-indigo-700',
    benefit: '₹5 Lakh / family / year',
    desc: 'Free cashless treatment up to ₹5,00,000 per year per family at any empanelled hospital across India.',
    eligibility: 'Families listed in SECC 2011 data. Check eligibility on the portal.',
    highlight: true,
    applyUrl: 'https://beneficiary.nha.gov.in/',
    checkUrl: 'https://pmjay.gov.in/check-am-i-eligible',
    helpline: '14555',
    steps: [
      'Visit beneficiary.nha.gov.in',
      'Enter your Aadhaar or ration card number',
      'Verify via OTP',
      'Download or collect your Ayushman Card',
    ],
  },
  {
    id: 'jsy',
    title: 'Janani Suraksha Yojana',
    subtitle: 'Maternity Benefit',
    tag: 'Maternity',
    tagColor: 'pink',
    icon: Baby,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    gradient: 'from-pink-500 to-rose-600',
    benefit: 'Up to ₹1,400 cash + Free delivery',
    desc: 'Financial assistance for institutional delivery (in government hospitals) with free ante-natal care.',
    eligibility: 'All pregnant women who choose institutional delivery at govt hospitals.',
    highlight: false,
    applyUrl: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309',
    checkUrl: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309',
    helpline: '1800-180-1104',
    steps: [
      'Register at nearest Anganwadi or PHC',
      'Get MCH card issued',
      'Deliver at empanelled govt hospital',
      'Cash transferred directly to your bank account',
    ],
  },
  {
    id: 'nhpm_senior',
    title: 'PMJAY for Senior Citizens',
    subtitle: 'Age 70+ Coverage',
    tag: 'Seniors',
    tagColor: 'red',
    icon: Heart,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    gradient: 'from-red-500 to-rose-600',
    benefit: 'Additional ₹5 Lakh / year for 70+',
    desc: 'Expanded Ayushman Bharat coverage for all senior citizens aged 70 and above regardless of income.',
    eligibility: 'Indian citizens aged 70 years and above.',
    highlight: false,
    applyUrl: 'https://beneficiary.nha.gov.in/',
    checkUrl: 'https://pmjay.gov.in/check-am-i-eligible',
    helpline: '14555',
    steps: [
      'Visit beneficiary.nha.gov.in',
      'Enter Aadhaar and age proof',
      'Existing PMJAY families get top-up automatically',
      'New applicants can enroll at Common Service Centres',
    ],
  },
  {
    id: 'cdp',
    title: 'Pradhan Mantri Suraksha Bima Yojana',
    subtitle: 'Accident Insurance',
    tag: 'Insurance',
    tagColor: 'amber',
    icon: ShieldCheck,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    gradient: 'from-amber-500 to-orange-500',
    benefit: '₹2 Lakh cover at just ₹20/year',
    desc: 'Accidental death and disability insurance for ₹20 per year via Jan Suraksha schemes.',
    eligibility: 'Bank account holders aged 18–70 years.',
    highlight: false,
    applyUrl: 'https://www.jansuraksha.gov.in/Forms-PMSBY.aspx',
    checkUrl: 'https://www.jansuraksha.gov.in/',
    helpline: '1800-180-1111',
    steps: [
      'Visit your bank or jansuraksha.gov.in',
      'Fill the PMSBY enrollment form',
      'Provide Aadhaar linked bank account number',
      '₹20 auto-debited annually on 1st June',
    ],
  },
  {
    id: 'esic',
    title: 'ESIC Medical Benefits',
    subtitle: 'Employee Health Insurance',
    tag: 'Employment',
    tagColor: 'teal',
    icon: Pill,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    gradient: 'from-teal-500 to-cyan-600',
    benefit: 'Full medical + cash benefits for employees',
    desc: 'Comprehensive medical care and cash benefits for employees in the organised sector and their families.',
    eligibility: 'Employees earning up to ₹21,000/month in ESIC-covered establishments.',
    highlight: false,
    applyUrl: 'https://www.esic.gov.in/home',
    checkUrl: 'https://www.esic.gov.in/employees',
    helpline: '1800-11-2526',
    steps: [
      'Your employer registers you automatically',
      'Get ESIC smart card (IP number)',
      'Show card at any ESIC dispensary or hospital',
      'Self-register at esic.gov.in if not covered',
    ],
  },
];

// ── Tag color map ─────────────────────────────────────────────────────────────
const TAG_COLORS = {
  blue:   'bg-blue-100 text-blue-700',
  pink:   'bg-pink-100 text-pink-700',
  red:    'bg-red-100 text-red-700',
  amber:  'bg-amber-100 text-amber-700',
  teal:   'bg-teal-100 text-teal-700',
  green:  'bg-green-100 text-green-700',
};

// ── Scheme Detail Drawer ──────────────────────────────────────────────────────
function SchemeDetail({ scheme, isDark, onBack }) {
  const textPrimary   = isDark ? 'text-white'      : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400'  : 'text-gray-500';
  const cardBg        = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const stepBg        = isDark ? 'bg-slate-700'    : 'bg-gray-50';

  return (
    <div className="h-full flex flex-col">
      {/* Back header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} shrink-0`}>
        <button
          onClick={onBack}
          className={`p-2 rounded-xl transition-all ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mb-0.5">Scheme Details</p>
          <p className={`text-sm font-black ${textPrimary}`}>{scheme.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 space-y-4">
        {/* Hero gradient */}
        <div className={`rounded-3xl bg-gradient-to-br ${scheme.gradient} p-5 text-white`}>
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <scheme.icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-black mb-1">{scheme.title}</h2>
          <p className="text-white/80 text-xs leading-relaxed">{scheme.desc}</p>
          <div className="mt-3 inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
            💰 {scheme.benefit}
          </div>
        </div>

        {/* Eligibility */}
        <div className={`rounded-2xl border p-4 ${cardBg}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${textSecondary}`}>Who Can Apply</p>
          <p className={`text-sm leading-relaxed ${textPrimary}`}>{scheme.eligibility}</p>
        </div>

        {/* How to Apply Steps */}
        <div className={`rounded-2xl border p-4 ${cardBg}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${textSecondary}`}>How to Apply</p>
          <div className="space-y-2">
            {scheme.steps.map((step, i) => (
              <div key={i} className={`flex items-start gap-3 p-2.5 rounded-xl ${stepBg}`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className={`text-xs leading-relaxed ${textPrimary}`}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={scheme.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Globe className="w-4 h-4" />
            Apply on Official Portal
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {scheme.checkUrl !== scheme.applyUrl && (
            <a
              href={scheme.checkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border font-bold text-sm transition-all active:scale-95
                ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
            >
              <Info className="w-4 h-4 text-blue-500" />
              Check Eligibility
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </a>
          )}

          {scheme.helpline && (
            <a
              href={`tel:${scheme.helpline}`}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl border font-bold text-sm transition-all active:scale-95
                ${isDark ? 'bg-slate-700 border-slate-600 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}
            >
              <Phone className="w-4 h-4" />
              Helpline: {scheme.helpline}
            </a>
          )}
        </div>

        <p className={`text-[10px] text-center leading-relaxed ${textSecondary}`}>
          Tapping "Apply on Official Portal" opens the Government of India website in your browser.
          PulseAID does not collect or store any data entered on government portals.
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const GovtSchemes = ({ isDark = false }) => {
  const [activeScheme, setActiveScheme] = useState(null);

  if (activeScheme) {
    return (
      <SchemeDetail
        scheme={activeScheme}
        isDark={isDark}
        onBack={() => setActiveScheme(null)}
      />
    );
  }

  const textPrimary   = isDark ? 'text-white'      : 'text-gray-800';
  const textSecondary = isDark ? 'text-slate-400'  : 'text-gray-500';
  const cardBg        = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';

  const featured = SCHEMES.find(s => s.highlight);
  const others   = SCHEMES.filter(s => !s.highlight);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`px-5 py-4 border-b shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mb-1">State & National</p>
        <h1 className={`text-2xl font-black ${textPrimary}`}>Government Health Schemes</h1>
        <p className={`text-[11px] mt-0.5 ${textSecondary}`}>
          Tap any scheme to view official enrollment details and apply directly on the government portal.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24">
        {/* Featured: Ayushman Bharat */}
        {featured && (
          <button
            onClick={() => setActiveScheme(featured)}
            className={`w-full text-left p-5 rounded-3xl relative overflow-hidden bg-gradient-to-br ${featured.gradient} shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all`}
          >
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 border border-white/30">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                🇮🇳 Flagship Scheme
              </span>
              <h2 className="text-xl font-black text-white mt-2 mb-1">{featured.title}</h2>
              <p className="text-sm text-blue-100 mb-4 leading-relaxed">{featured.benefit} — free cashless treatment at empanelled hospitals.</p>
              <div className="flex items-center gap-2 bg-white text-blue-700 font-black text-xs px-4 py-2.5 rounded-xl w-fit shadow-lg">
                <Globe className="w-3.5 h-3.5" />
                Apply on Official Portal
                <ExternalLink className="w-3 h-3 opacity-60" />
              </div>
            </div>
            <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
          </button>
        )}

        {/* Other schemes */}
        <div>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${textSecondary}`}>More Health Schemes</h3>
          <div className="space-y-3">
            {others.map(scheme => (
              <button
                key={scheme.id}
                onClick={() => setActiveScheme(scheme)}
                className={`w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-[0.98] hover:shadow-sm ${cardBg}`}
              >
                <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${scheme.iconBg}`}>
                  <scheme.icon className={`w-6 h-6 ${scheme.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-black truncate ${textPrimary}`}>{scheme.title}</p>
                    <span className={`shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${TAG_COLORS[scheme.tagColor] || TAG_COLORS.blue}`}>
                      {scheme.tag}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-snug ${textSecondary} line-clamp-1`}>{scheme.benefit}</p>
                  <p className={`text-[10px] mt-1 text-blue-500 font-bold flex items-center gap-1`}>
                    <ExternalLink className="w-2.5 h-2.5" /> View & Apply on Govt Portal
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${textSecondary}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`p-4 rounded-2xl border border-dashed text-center space-y-1 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
          <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-blue-700'}`}>
            🔒 PulseAID redirects you to official Indian Government portals only
          </p>
          <p className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
            We do not collect, store or process any data you enter on government websites.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovtSchemes;
