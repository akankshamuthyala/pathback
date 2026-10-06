import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  EyeOff,
  GitMerge,
  FileSearch,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Lock,
  Search,
  AlertTriangle,
  HeartHandshake,
} from 'lucide-react';
import { SethuLogo } from '../components/common/SethuLogo';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { quickDemoLogin } = useAuth();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section in Plum and Peach */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#F2E6EC] bg-gradient-to-b from-[#FFF9F6] via-[#FAF5F8] to-[#F5EBF2]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEEDEA] border border-[#FDD8CD] text-[#B93E23] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#EF6B4B]" />
            <span>Hackathon Category PS-16: Multimodal AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            PathBack
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-plum-700">
            Finding a safer path back home.
          </p>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Missing-person investigations are fragmented across old photographs, documents, CCTV images, and witness statements. <span className="font-semibold text-slate-900">PathBack</span> transforms disjointed evidence into explainable, prioritized leads while keeping human verification and privacy consent at the absolute center.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/submit-sighting"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-plum-600 hover:bg-plum-700 text-white shadow-md shadow-plum-600/20 transition-all flex items-center gap-2"
            >
              <span>Submit Sighting Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => quickDemoLogin('investigator')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-[#FFF8F5] text-slate-700 border border-[#FDD8CD] shadow-xs transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-plum-600" />
              <span>Launch Investigator Demo</span>
            </button>
          </div>

          {/* Core Responsible AI Highlights Bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white border border-[#F2E6EC] shadow-xs">
              <span className="text-[11px] font-bold text-plum-700 uppercase tracking-wider block">Rule 1</span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">Recommendations, Not Facts</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#F2E6EC] shadow-xs">
              <span className="text-[11px] font-bold text-peach-700 uppercase tracking-wider block">Rule 2</span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">Zero Automated Identification</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#F2E6EC] shadow-xs">
              <span className="text-[11px] font-bold text-plum-700 uppercase tracking-wider block">Rule 3</span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">Consent Before Disclosure</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#F2E6EC] shadow-xs">
              <span className="text-[11px] font-bold text-peach-700 uppercase tracking-wider block">Rule 4</span>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">Location Redaction Enforced</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Connected Pillars in Plum and Peach */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold text-plum-700 uppercase tracking-widest">Architectural Pillars</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Transforming Fragmented Data into Responsible Reunification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Multimodal Ingestion */}
          <div className="p-6 bg-white rounded-2xl border border-[#F2E6EC] shadow-xs hover:shadow-md hover:border-[#FCBAA7] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FEEDEA] text-[#DC5131] flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Multimodal Evidence Ingestion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes photographs, case PDFs, witness voice statements (transcribed via Web Speech), and location corridors into a unified timeline.
            </p>
            <span className="inline-block text-[10px] font-semibold text-peach-800 bg-[#FEEDEA] px-2 py-0.5 rounded border border-[#FDD8CD]">PS-3 & PS-5</span>
          </div>

          {/* Pillar 2: Age-Aware Appearance */}
          <div className="p-6 bg-white rounded-2xl border border-[#F2E6EC] shadow-xs hover:shadow-md hover:border-plum-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-plum-50 text-plum-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Age-Aware Appearance Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identifies invariant cranial metrics versus easily modified traits (facial hair, weight, grooming) over elapsed missing years without biometric proof claims.
            </p>
            <span className="inline-block text-[10px] font-semibold text-plum-800 bg-plum-50 px-2 py-0.5 rounded border border-plum-200">PS-16 Multimodal</span>
          </div>

          {/* Pillar 3: Cross-Case Pattern Insights */}
          <div className="p-6 bg-white rounded-2xl border border-[#F2E6EC] shadow-xs hover:shadow-md hover:border-[#FCBAA7] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FEEDEA] text-[#DC5131] flex items-center justify-center">
              <GitMerge className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">6-Signal Pattern Recognition</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discovers geographic transit corridors (30%), timeline proximity (20%), description overlap (20%), and perceptual hash duplicates (5%).
            </p>
            <span className="inline-block text-[10px] font-semibold text-peach-800 bg-[#FEEDEA] px-2 py-0.5 rounded border border-[#FDD8CD]">PS-8 Decision Intel</span>
          </div>

          {/* Pillar 4: The Consent Wall */}
          <div className="p-6 bg-white rounded-2xl border border-[#F2E6EC] shadow-xs hover:shadow-md hover:border-plum-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-plum-50 text-plum-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">The Consent Wall & Mediated Comms</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Finding someone does not automatically mean exposing someone. Preserves located individuals' autonomy through 9-stage consent review.
            </p>
            <span className="inline-block text-[10px] font-semibold text-plum-800 bg-plum-50 px-2 py-0.5 rounded border border-plum-200">PS-13 Privacy & Trust</span>
          </div>
        </div>
      </section>

      {/* The Investigation Workflow Section in Plum and Peach */}
      <section className="bg-[#FAF5F8]/80 py-16 px-4 sm:px-6 lg:px-8 border-y border-[#F2E6EC]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-plum-700 uppercase tracking-widest">Controlled Pipeline</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The PathBack Human-in-the-Loop Protocol
            </p>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { step: '01', title: 'Multimodal AI Analysis', desc: 'Case records, photos, and sightings analyzed.' },
              { step: '02', title: 'Explainable Potential Lead', desc: 'Transparent scores with matching and conflicting signals.' },
              { step: '03', title: 'Human Field Verification', desc: 'Authorized investigator approves or dismisses.' },
              { step: '04', title: 'Consent Review Wall', desc: 'Located person autonomy respected before contact.' },
              { step: '05', title: 'Controlled Reunification', desc: 'Mediated messaging without public exposure.' },
            ].map((node, i) => (
              <div key={i} className="flex-1 bg-white p-4 rounded-xl border border-[#F2E6EC] shadow-xs text-center space-y-1.5 w-full">
                <span className="text-xs font-bold text-plum-700">{node.step}</span>
                <h4 className="text-xs font-bold text-slate-900">{node.title}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Synthetic Demo Quick Start Banner in Plum and Peach */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#FFF4ED] via-[#FDF0F6] to-[#F6EBF2] text-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 border border-[#EAD6E4]">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <Sparkles className="w-5 h-5 text-plum-600" />
              Explore the Pre-Seeded Demonstration Dataset
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Experience the full 3-5 minute demo flow with pre-seeded cases (Aarav Sharma, Priya Patel, Meera Das), 5 sightings, the Central Railway Station pattern cluster, and active Consent Wall.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => quickDemoLogin('investigator')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-plum-600 hover:bg-plum-700 text-white shadow-sm transition-colors"
            >
              Open as Investigator
            </button>
            <button
              onClick={() => quickDemoLogin('family_member')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-[#FFF8F5] text-slate-700 border border-[#FDD8CD] transition-colors"
            >
              Open as Family Member
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
