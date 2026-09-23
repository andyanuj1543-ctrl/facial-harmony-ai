import React from 'react';
import { 
  ArrowRight, 
  Film, 
  Upload, 
  Sparkles, 
  Box, 
  ScanFace, 
  Stethoscope, 
  Scissors, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  Sliders,
  Users
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { EditorialTicker } from './EditorialTicker';
import { SAMPLE_FACES, SampleFace } from '../utils/sampleFaces';

interface LandingViewProps {
  onEnterStudio: () => void;
  onStartVideoScan: () => void;
  onUploadClick: () => void;
  onSelectSample: (sample: SampleFace) => void;
  selectedSampleId?: string;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterStudio,
  onStartVideoScan,
  onUploadClick,
  onSelectSample,
  selectedSampleId
}) => {
  return (
    <div className="w-full space-y-16 md:space-y-20 pt-4 pb-16">
      {/* 1. CINEMATIC HERO SECTION WITH SPLIT PURPOSE PANEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Kinetic Hero Typography & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center md:text-left">
            {/* Clean Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>EST. 2026 // CLINICAL ANTHROPOMETRY LAB</span>
            </div>

            {/* Dramatic Kinetic Typography (Ricardo Chance style) */}
            <div className="space-y-5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-white font-['Space_Grotesk',sans-serif] leading-[1.05] uppercase">
                Shaping Human <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400">
                  Facial Architecture.
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal max-w-2xl leading-relaxed">
                AI-powered cranial-mandibular proportion analysis, 3D volumetric bone modeling, 
                and bespoke masculine grooming blueprints — engineered with clinical sub-millimeter precision.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                <button
                  onClick={onEnterStudio}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <span>Launch Analysis Studio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onStartVideoScan}
                  className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-white/[0.12] font-semibold text-sm transition-all hover:border-amber-400/40"
                >
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>5s Video Scan</span>
                </button>

                <button
                  onClick={onUploadClick}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-white/[0.08] font-medium text-sm transition-all"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Purpose of the Website Card (5 cols) */}
          <div className="lg:col-span-5">
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.12)"
              borderColor="rgba(255, 255, 255, 0.1)"
              className="p-6 sm:p-7 shadow-2xl space-y-5 bg-gradient-to-b from-slate-900/90 to-slate-950/90 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
                    [PURPOSE & MISSION]
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">v2.6 ARCHITECTURE</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-white font-['Space_Grotesk',sans-serif]">
                  What Facial Harmony Does
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A scientific diagnostic studio engineered to decode your unique bone structure and maximize masculine facial aesthetics.
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">Mathematical Truth Over Subjective Opinion</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Measures real craniofacial landmarks (Farkas thirds, Ricketts E-line, canthal tilt) with sub-millimeter precision.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">Bespoke Architectural Blueprints</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Gives exact haircut volume specs, beard neckline lines, and posture adjustments tailored specifically to your bone frame.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">100% Private, Client-Side AI</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All 468 mesh vertices are computed directly in your browser. Zero face data or photos are ever saved or uploaded to cloud servers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>PRIVATE IN-BROWSER AI</span>
                <span className="text-emerald-400 font-bold">● ZERO DATA STORAGE</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* 2. LIVE TELEMETRY MARQUEE */}
      <EditorialTicker />

      {/* 3. INTERACTIVE BENCHMARK ARCHETYPES ("THE HALL OF MANDIBLES") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              <Users className="w-3.5 h-3.5" />
              <span>[01 // BENCHMARK ARCHETYPES]</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk',sans-serif] tracking-tight">
              Explore Reference Cranial Morphologies
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select any masculine benchmark archetype below to instantly launch the studio and inspect its 468-point biometric model.
            </p>
          </div>

          <button
            onClick={onEnterStudio}
            className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start md:self-auto transition-colors"
          >
            <span>Enter Studio With Current</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_FACES.filter(s => !s.isLogo).slice(0, 4).map((sample, idx) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <SpotlightCard
                key={sample.id}
                spotlightColor="rgba(245, 158, 11, 0.14)"
                borderColor={isSelected ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.08)'}
                className="cursor-pointer group flex flex-col justify-between p-4 transition-all hover:scale-[1.01]"
                onClick={() => onSelectSample(sample)}
              >
                <div className="space-y-3">
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-950 border border-white/[0.06]">
                    <img 
                      src={sample.imageUrl} 
                      alt={sample.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    
                    {/* Index Tag */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-white/[0.1] text-[10px] font-mono font-bold text-amber-400">
                      0{idx + 1}
                    </div>

                    {/* View Mode Tag */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-white/[0.1] text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      {sample.viewMode}
                    </div>

                    {/* Overlay Action */}
                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-xs font-semibold text-white">
                      <span className="text-[11px] font-mono text-amber-300">Tap to Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white font-['Space_Grotesk',sans-serif] group-hover:text-amber-300 transition-colors">
                      {sample.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* 4. THE 4 PILLAR STORY CARDS (RICARDO CHANCE STYLE HIGH-CRAFT CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="space-y-1 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" />
            <span>[02 // CORE TECHNOLOGICAL PILLARS]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk',sans-serif] tracking-tight">
            Engineered at the Intersection of Code & Anthropometry
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A comprehensive suite of diagnostic instruments calibrated specifically for masculine facial architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: 468-Point Mesh */}
          <SpotlightCard
            spotlightColor="rgba(6, 182, 212, 0.16)"
            className="p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <ScanFace className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400">01 // CRANIAL MESH</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                468-Point Anthropometric Landmark Matrix
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Sub-millimeter tracking across trichion, glabella, subnasale, and menton. 
                Calculates bilateral symmetry, canthal tilt vectors, and vertical thirds equilibrium in real time.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.05] flex items-center gap-2 text-[11px] font-mono text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Real-Time Sagittal & Horizontal Plane Extraction</span>
            </div>
          </SpotlightCard>

          {/* Card 2: 3D Volumetric Modeler */}
          <SpotlightCard
            spotlightColor="rgba(245, 158, 11, 0.16)"
            className="p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Box className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400">02 // 3D VOLUMETRICS</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                Volumetric 3D Facial Architecture Model
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Full 360° Euler rotation with perspective foreshortening. 
                Inspect gonial angles, jawline definition, submental mandibular arches, and cranial symmetry from any angle.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.05] flex items-center gap-2 text-[11px] font-mono text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Perspective Projection & Dynamic Holographic Pedestal</span>
            </div>
          </SpotlightCard>

          {/* Card 3: Continuous 5s Video Examination */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.16)"
            className="p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400">03 // VIDEO EXAM</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                5-Second Dynamic Temporal Examination
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Captures a continuous head-turn motion stream with multi-frame temporal stabilization. 
                Evaluates profile projection, dynamic symmetry variance, and head-pose stability.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.05] flex items-center gap-2 text-[11px] font-mono text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Automated Frame Sampling & Temporal Smoothing</span>
            </div>
          </SpotlightCard>

          {/* Card 4: Editorial Grooming Blueprint */}
          <SpotlightCard
            spotlightColor="rgba(236, 72, 153, 0.16)"
            className="p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center text-pink-400">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-pink-400">04 // GROOMING BLUEPRINT</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                Algorithmic Masculine Grooming Blueprint
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tailored styling prescriptions based on facial archetype geometry: 
                mandibular fade lines, vertical cranial height hair styling, eyewear shape balance, and lifestyle protocols.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.05] flex items-center gap-2 text-[11px] font-mono text-pink-300">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              <span>Targeted Structural Compensation Protocols</span>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* 5. EDITORIAL CTA CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.18)"
          borderColor="rgba(245, 158, 11, 0.3)"
          className="p-8 md:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              [START YOUR ANALYSIS]
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk',sans-serif] uppercase tracking-tight">
              Ready to Decode Your Facial Harmony?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Launch the Interactive Studio to analyze facial proportions, test archetype benchmarks, or record a 5-second 360° video scan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterStudio}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Enter Analysis Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartVideoScan}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/[0.1] font-semibold text-sm transition-all"
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>Record 5s Video</span>
            </button>
          </div>
        </SpotlightCard>
      </section>

      {/* 6. BRUTALIST CREATIVE-DEV FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-bold">FACIAL HARMONY AI</span>
          <span>•</span>
          <span>v2.6 RELEASE</span>
        </div>

        <div className="flex items-center gap-6">
          <span>LATERAL E-LINE COMPLIANT</span>
          <span>•</span>
          <span>BUILT FOR CHROMIUM & WEBKIT</span>
        </div>

        <div>
          <span>© 2026 MEN'S ANTHROPOMETRY LAB</span>
        </div>
      </footer>
    </div>
  );
};
