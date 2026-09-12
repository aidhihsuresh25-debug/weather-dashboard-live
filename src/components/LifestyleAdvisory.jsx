import React from 'react';
import { Umbrella, Shirt, Dumbbell, Car, Sparkles, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getLifestyleInsights } from '../utils/lifestyleEngine';

export default function LifestyleAdvisory({ weatherData }) {
  const insights = getLifestyleInsights(weatherData);

  if (!insights) return null;

  const { umbrella, attire, fitness, commute, uv } = insights;

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Engine Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Smart Lifestyle Advisory Engine</h2>
            <p className="text-xs text-slate-400">Automated real-time recommendations based on local atmosphere</p>
          </div>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold">
          AI Rule Engine Active
        </span>
      </div>

      {/* Grid of Advisory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Umbrella Advisor */}
        <div className="p-5 bg-slate-800/40 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Umbrella className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-300">Umbrella Need</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${umbrella.badge}`}>
                {umbrella.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
              {umbrella.detail}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono pt-2 border-t border-white/5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Precipitation analyzed</span>
          </div>
        </div>

        {/* 2. Attire Recommendation */}
        <div className="p-5 bg-slate-800/40 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/30 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shirt className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-300">Attire & Layering</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">{attire.title}</h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
              {attire.detail}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 pt-2 border-t border-white/5">
            {attire.items.map((item, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-950/60 text-slate-300 rounded-md text-[10px] font-semibold border border-white/5">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Outdoor Fitness Window */}
        <div className="p-5 bg-slate-800/40 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">Outdoor Fitness</span>
              </div>
              <span className="text-xs font-black text-emerald-400 font-mono">{fitness.score}% Match</span>
            </div>
            <div className="text-xs font-bold text-cyan-300 mb-1">Optimal Window:</div>
            <div className="text-xs font-semibold text-white mb-2">{fitness.bestTime}</div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
              {fitness.advice}
            </p>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${fitness.score}%` }} />
          </div>
        </div>

        {/* 4. Commute Safety Index */}
        <div className="p-5 bg-slate-800/40 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-300">Commute Safety</span>
              </div>
              <span className="text-xs font-black text-amber-300 font-mono">{commute.score}/100</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-2">{commute.status}</h4>
            <ul className="space-y-1 text-xs text-slate-300 font-medium">
              {commute.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-white/5 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-time Transit Assessment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
