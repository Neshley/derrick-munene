import React, { useState } from 'react';
import { 
  X, 
  Coffee, 
  Heart, 
  Copy, 
  Check, 
  Sparkles, 
  Music, 
  Code, 
  Layers, 
  Mail, 
  PhoneCall, 
  Send,
  ExternalLink,
  Star,
  Share2,
  Compass,
  Server,
  ShieldCheck,
  Sliders,
  MessageSquare,
  Globe,
  Flame,
  Radio,
  BookOpen
} from 'lucide-react';

interface CreatorMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorMessageModal: React.FC<CreatorMessageModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<'paypal' | 'mpesa' | 'github' | null>(null);
  const [activeTab, setActiveTab] = useState<'story' | 'philosophy' | 'tech' | 'roadmap' | 'support'>('story');

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'paypal' | 'mpesa' | 'github') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const paypalEmail = 'derrickmunene2025@gmail.com';
  const mpesaNumber = '+254 704 034 278';
  const creatorName = 'Derrick Munene';
  const githubRepo = 'https://github.com/Neshley/derrick-munene';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100 ring-1 ring-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/30 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-extrabold tracking-wide text-zinc-100 font-['Chakra_Petch']">
                  A MESSAGE FROM THE CREATOR
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Derrick Munene
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Vision &amp; Support
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                The heart, engineering journey, worship ministry, and future of DM ARRANGIA
              </p>
            </div>
          </div>

          <button
            id="btn-close-creator-modal"
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Close Message"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 overflow-x-auto custom-scrollbar shrink-0 text-xs font-semibold">
          {[
            { id: 'story', label: 'My Story & Origins', icon: Heart },
            { id: 'philosophy', label: 'Worship Philosophy', icon: Flame },
            { id: 'tech', label: 'Under The Hood', icon: Code },
            { id: 'roadmap', label: 'What Lies Ahead', icon: Compass },
            { id: 'support', label: 'Support The Project ☕', icon: Coffee, highlight: true }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? tab.highlight 
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-zinc-800 text-amber-400 border border-amber-500/30 shadow-sm'
                    : tab.highlight
                      ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 select-text custom-scrollbar bg-zinc-950/90 leading-relaxed text-zinc-200 text-sm">
          
          {/* TAB 1: STORY & ORIGINS */}
          {activeTab === 'story' && (
            <div className="space-y-6 animate-fade-in">
              {/* Quote Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-lg">
                <p className="text-amber-300 font-bold text-sm sm:text-base italic leading-relaxed">
                  “Technology should never be a barrier to creativity; it should be a quiet, responsive servant that brings out the heart of music.”
                </p>
                <span className="text-[11px] text-zinc-400 block mt-2 uppercase tracking-wider font-semibold">
                  — Derrick Munene, Creator &amp; Lead Architect
                </span>
              </div>

              {/* Personal Story */}
              <section className="space-y-3.5">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                  Why I Created DM ARRANGIA
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  Hello, I’m <strong>Derrick Munene</strong>. As a keyboardist, church music director, and software engineer based in Kenya, I’ve spent years experiencing firsthand the joys and the struggles of live musical performance.
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  For decades, high-end arranger keyboards—like the Yamaha Genos, Tyros, and PSR-S/SX series—have been the undisputed gold standard for solo performers, church keyboardists, and songwriters. Their ability to take a single left-hand chord and orchestrate a full live band in real time with dynamic variations, bass lines, and drum fills is sheer musical magic.
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  However, these hardware flagships cost between <strong>$2,000 and $5,000+ USD</strong>. For countless talented young musicians, church fellowships, worship leaders, and aspiring producers in developing nations and across the globe, that hardware is simply out of reach.
                </p>
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> The Spark Behind The Code
                  </h4>
                  <p className="text-xs text-zinc-300">
                    I asked myself a radical question: <em>"Why can't an ordinary laptop, tablet, or phone running a modern browser deliver that same rich, interactive, polyphonic arranger experience—completely free, low latency, and zero install required?"</em>
                  </p>
                  <p className="text-xs text-zinc-400 italic">
                    DM ARRANGIA is the fruit of that question. It isn’t a collection of static MP3 loops or a toy piano. It is a full-fledged real-time accompaniment sequencer, algorithmic synthesizer, and worship workstation crafted note-by-note.
                  </p>
                </div>
              </section>

              {/* The Journey */}
              <section className="space-y-3 pt-3 border-t border-zinc-900">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                  The Journey So Far
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  Building an arranger keyboard in software from scratch is notoriously complex. It required solving mathematical and musical challenges that standard web audio libraries don't cover:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-1">
                    <strong className="text-amber-300 block font-mono">1. Yamaha Binary SFF Parsing</strong>
                    <p className="text-zinc-400">Decoding the proprietary SFF1 and SFF2 `.STY` binary formats, CASM voice-assignment chunks, and NTT harmony tables directly in JavaScript.</p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-1">
                    <strong className="text-amber-300 block font-mono">2. Microsecond Lookahead Timing</strong>
                    <p className="text-zinc-400">Overcoming browser timer jitter so that drum hits, basslines, and arpeggios play with rock-solid mechanical precision under heavy load.</p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-1">
                    <strong className="text-amber-300 block font-mono">3. Real-Time Chord Recognition</strong>
                    <p className="text-zinc-400">Recognizing complex jazz inversions, suspended chords, diminished sevenths, and root-slash basslines from both on-screen touches and hardware MIDI.</p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-1">
                    <strong className="text-amber-300 block font-mono">4. Zero-Latency Pure Synthesis</strong>
                    <p className="text-zinc-400">Synthesizing 40+ dynamic acoustic and electronic instruments purely through native Web Audio nodes without requiring gigabytes of sample downloads.</p>
                  </div>
                </div>
              </section>

              {/* Callout to continue */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <span className="text-zinc-300">Discover how this platform was tailored specifically for spiritual atmosphere and church service:</span>
                <button 
                  onClick={() => setActiveTab('philosophy')}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg transition-colors shrink-0 ml-3 cursor-pointer"
                >
                  Read Worship Vision →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: WORSHIP PHILOSOPHY */}
          {activeTab === 'philosophy' && (
            <div className="space-y-6 animate-fade-in">
              <section className="space-y-3.5">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                  Crafted for Prayer, Altar Ministry &amp; Spontaneous Worship
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  Church music is uniquely dynamic. Unlike a secular concert with fixed track stems, a church worship service is sensitive to the room, the congregation, and the movement of the Holy Spirit.
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  A music director must be able to modulate smoothly, drop into a quiet prayer atmosphere during intercession, sustain warm pad tones during sermon reflections, or build a roaring praise groove when the sanctuary erupts in thanksgiving.
                </p>
              </section>

              {/* Dynamic Worship Stages */}
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    The 4 Stages of Interactive Worship Dynamics
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Real-Time Flow</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                    <span className="text-amber-400 font-mono font-bold block">1. Intimate Prayer</span>
                    <p className="text-zinc-400 text-[11px]">Drums muted. Gentle warm grand piano, celestial ambient drone pad, soft bass underpinning.</p>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                    <span className="text-amber-300 font-mono font-bold block">2. Gentle Flow</span>
                    <p className="text-zinc-400 text-[11px]">Shaker &amp; acoustic brush rhythms enter. Electric piano with chorused pad layering.</p>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                    <span className="text-amber-200 font-mono font-bold block">3. Steady Worship</span>
                    <p className="text-zinc-400 text-[11px]">Solid kick and cross-stick rim groove. Gospel organ swell with Leslie rotary acceleration.</p>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-lg border border-amber-500/40 text-amber-100 space-y-1">
                    <span className="text-amber-400 font-mono font-bold block">4. Full Elevation</span>
                    <p className="text-zinc-300 text-[11px]">Driving snare fills, full Gospel brass stabs, dynamic crash cymbals, powerful gospel bass runs.</p>
                  </div>
                </div>
              </div>

              {/* Dedicated Atmosphere Engine */}
              <section className="space-y-3 pt-3 border-t border-zinc-900">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                  Why Prayer Atmosphere Has Its Own Dedicated Space
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  You’ll find the <strong>Prayer Atmosphere</strong> modal in the top navigation and sidebar. This was designed specifically for solo pastors, intercessory prayer meetings, home cell groups, and late-night personal devotionals.
                </p>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  It uses multi-layered analog sine and triangle oscillators with slow micro-detuned LFOs and shimmer harmonics to provide an uninterrupted, seamless musical bed in any musical key. When you transition keys, it crossfades smoothly without abrupt cuts or silences.
                </p>
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300 space-y-1">
                    <span className="font-bold text-zinc-100 block">Strict Public Domain Hymnbook</span>
                    <p className="text-zinc-400">
                      To protect churches and streaming ministries, all built-in songs (*Amazing Grace*, *It Is Well With My Soul*, *Holy, Holy, Holy*, *Blessed Assurance*, etc.) are strictly certified public domain. You can safely stream your church services on YouTube or Facebook without copyright strikes.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: UNDER THE HOOD */}
          {activeTab === 'tech' && (
            <div className="space-y-6 animate-fade-in">
              <section className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                  The Engineering &amp; Technology Stack
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  DM ARRANGIA is engineered as a zero-compromise, professional production environment using cutting-edge web audio standards:
                </p>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    title: 'Native Web Audio API Synthesis',
                    desc: 'Pure procedural synthesis using OscillatorNode, GainNode, BiquadFilterNode, ConvolverNode, and WaveShaperNode. Zero heavy audio file dependencies.',
                    icon: Radio
                  },
                  {
                    title: 'Web MIDI API Hardware Engine',
                    desc: 'Direct USB & Bluetooth MIDI device discovery. Velocity-sensitive Note On/Off, Pitch Bend, Mod Wheel (CC 1), Damper Pedal (CC 64), and Panic kill.',
                    icon: Sliders
                  },
                  {
                    title: 'Yamaha SFF1 / SFF2 Binary Parser',
                    desc: 'Decodes proprietary binary Yamaha style files (.STY, .PRS, .BPE), extracting header metadata, tempo tracks, CASM NTT rules, and chord progressions.',
                    icon: Code
                  },
                  {
                    title: 'Server-Side Gemini AI Music Director',
                    desc: 'Integrated with Google Gemini 2.5 Flash through secure backend proxy routes (/api/gemini/*) to suggest jazz chord substitutions, custom styles, and reharmonizations.',
                    icon: Sparkles
                  },
                  {
                    title: 'Offline-First PWA Architecture',
                    desc: 'Service worker asset caching and local storage ensures the entire workstation functions at 100% capacity in remote locations without internet access.',
                    icon: Globe
                  },
                  {
                    title: 'Enterprise Safety & Security',
                    desc: 'All AI outputs and user uploads are strictly validated with Zod schemas. The client browser never receives or stores sensitive API keys.',
                    icon: ShieldCheck
                  }
                ].map((tech, idx) => {
                  const Icon = tech.icon;
                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                        <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{tech.title}</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        {tech.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Code Quality & Tests */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200">Verified Test Suite (Vitest)</span>
                  <span className="text-emerald-400 font-mono font-semibold">64 Tests Passing ✓</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Includes automated tests for chord analysis algorithms, MIDI parser byte decoders, tempo lookahead bounds, audio engine lifecycle node cleanup, and Zod security schema enforcement.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6 animate-fade-in">
              <section className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
                  Future Vision &amp; Feature Roadmap
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  We are just getting started. Here are the active research and development milestones planned for future releases of DM ARRANGIA:
                </p>
              </section>

              <div className="space-y-3 text-xs">
                {[
                  {
                    stage: 'In Active Development',
                    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
                    items: [
                      'African Praise & Worship Styles: Full styles for Kenyan Sebene, Congolese Lingala/Soukous, West African Praise, and South African Gospel.',
                      'SoundFont (SF2 / SFZ) Loader: Allow users to load custom multi-sample sound banks (GigaPiano, Korg M1, Roland Fantom soundfonts).',
                      'Multi-Track Audio WAV & Stems Export: Export full individual accompaniment tracks (Drums, Bass, Chords) into your favorite DAW (FL Studio, Logic, Ableton).'
                    ]
                  },
                  {
                    stage: 'Planned for Next Major Milestone',
                    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
                    items: [
                      'Hardware MIDI Controller Mapping Profiles: Preset auto-mapping for Novation Launchkey, Akai MPK, Arturia KeyLab, Yamaha PSR, and Roland Fantom.',
                      'Live Loop Station & Audio Sampler: Sample vocal phrases or acoustic instruments directly through your laptop microphone into Multi-Pads.',
                      'Multi-User Band Collaboration: Synchronize worship songbooks and chord charts in real-time across choir, band, and front-of-house tablets via WebRTC.'
                    ]
                  },
                  {
                    stage: 'Long-Term Research',
                    color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
                    items: [
                      'On-Device Audio AI Separation: Split backing tracks into isolated vocal, drum, bass, and piano stems directly in the browser.',
                      'Physical Foot-Pedal Bluetooth Support: Page turners and section foot switches for hands-free live stage control.'
                    ]
                  }
                ].map((tier, tIdx) => (
                  <div key={tIdx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tier.color}`}>
                        {tier.stage}
                      </span>
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {tier.items.map((item, iIdx) => (
                        <li key={iIdx} className="text-zinc-300 flex items-start gap-2 text-xs">
                          <span className="text-amber-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT THE PROJECT */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-tr from-amber-950/70 via-zinc-900 to-zinc-900 border-2 border-amber-500/40 space-y-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30 shrink-0">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-amber-300 font-['Chakra_Petch']">
                      SUPPORT THE WORK OF DERRICK MUNENE
                    </h3>
                    <p className="text-xs text-zinc-300">
                      Fueling continuous innovation, new worship styles, sound engineering, and server infrastructure
                    </p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  DM ARRANGIA is <strong>100% free and open</strong>. There are no paywalled features, no monthly subscriptions, and no intrusive third-party ads.
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  If this software has blessed your personal devotional times, helped your church worship team, assisted your rehearsals, or sparked your musical creativity, you are warmly invited to buy me a coffee. There is absolutely <strong>no obligation</strong>—every dollar or shilling is a meaningful gesture of appreciation and partnership.
                </p>

                {/* Where the funds go */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-amber-500/20 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" /> How Your Contributions Are Used:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-300">
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <strong className="text-amber-300 block mb-1">🎹 Style &amp; Voice Design</strong>
                      Studio time, high-definition instrument modeling, and expanding African and contemporary praise styles.
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <strong className="text-amber-300 block mb-1">☁️ AI &amp; Server Hosting</strong>
                      Maintaining high-speed cloud hosting, continuous deployment, and server-side Gemini API co-pilot quota.
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <strong className="text-amber-300 block mb-1">🌍 Free Global Access</strong>
                      Ensuring church keyboardists and young students in developing regions always have access free of charge.
                    </div>
                  </div>
                </div>

                {/* Payment Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* PayPal Card */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 hover:border-amber-500/40 transition-colors shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <Mail className="w-4 h-4" />
                        <span>PayPal (Global / International)</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono px-2 py-0.5 bg-zinc-900 rounded">Cards / USD / EUR</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-900 font-mono text-xs text-zinc-200 select-all flex items-center justify-between gap-2 border border-zinc-800">
                      <span className="text-xs sm:text-sm text-amber-200 font-semibold truncate">{paypalEmail}</span>
                      <button
                        onClick={() => handleCopy(paypalEmail, 'paypal')}
                        className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors shrink-0 cursor-pointer"
                        title="Copy PayPal address"
                      >
                        {copiedType === 'paypal' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${paypalEmail}?subject=DM%20ARRANGIA%20Support%20%26%20Feedback`}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-center text-[11px] text-amber-300 font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Email Derrick
                      </a>
                    </div>
                  </div>

                  {/* M-Pesa Card */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 hover:border-emerald-500/40 transition-colors shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <PhoneCall className="w-4 h-4" />
                        <span>M-Pesa (Kenya &amp; East Africa)</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono px-2 py-0.5 bg-zinc-900 rounded">Send Money / Lipa</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-900 font-mono text-xs text-zinc-200 flex items-center justify-between gap-2 border border-zinc-800">
                      <div className="space-y-0.5">
                        <span className="text-sm sm:text-base text-emerald-300 font-bold block">{mpesaNumber}</span>
                        <span className="text-[10px] text-zinc-400 font-sans">Name: Derrick Munene</span>
                      </div>
                      <button
                        onClick={() => handleCopy(mpesaNumber, 'mpesa')}
                        className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                        title="Copy M-Pesa phone number"
                      >
                        {copiedType === 'mpesa' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400">
                      Supports direct Send Money via Safaricom M-Pesa, Chipper Cash, Sendwave, or Remitly.
                    </p>
                  </div>
                </div>

                {/* Sponsorship / Support Tiers */}
                <div className="pt-2 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Suggested Support Tiers (Purely Voluntary)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-1 text-center">
                      <span className="text-base font-bold text-amber-400 font-mono">$5 / KES 650</span>
                      <strong className="block text-zinc-200 text-[11px]">☕ The Daily Coffee</strong>
                      <p className="text-zinc-400 text-[10px]">Keeps late-night sound engineering and bug-fixing sessions energized.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-1 text-center">
                      <span className="text-base font-bold text-amber-300 font-mono">$20 / KES 2,500</span>
                      <strong className="block text-zinc-200 text-[11px]">🎹 Style &amp; Voice Patron</strong>
                      <p className="text-zinc-400 text-[10px]">Directly funds the creation and optimization of new styles and sound presets.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-1 text-center">
                      <span className="text-base font-bold text-emerald-400 font-mono">$50+ / KES 6,500+</span>
                      <strong className="block text-zinc-200 text-[11px]">🌟 Pillar Sponsor</strong>
                      <p className="text-zinc-400 text-[10px]">Covers cloud server costs and keeps the workstation free for churches worldwide.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Non-Financial Ways to Support */}
              <section className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Other Powerful Ways to Support (Free)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" /> Share With Fellow Musicians
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      Introduce DM ARRANGIA to your church keyboardist, choir director, youth band, or music school.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Share Yamaha Styles
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      Send us tested `.STY` files or your favorite chord charts so we can optimize them for the global community.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Send Feedback &amp; Ideas
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      Tell us what instruments, chord features, or improvements you would love to see next!
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Section: A Final Word (Shown on all tabs at the bottom) */}
          <section className="space-y-3 pt-4 border-t border-zinc-900">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              A Final Word of Gratitude
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm">
              Thank you for trusting DM ARRANGIA to be a part of your music, your rehearsals, and your worship services.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm">
              I hope it helps you create something beautiful. I hope it gives you a peaceful atmosphere when you need one. I hope it inspires you to experiment, learn, and grow.
            </p>
            <p className="text-amber-300 font-semibold text-xs sm:text-sm">
              “Sometimes one chord, one melody, and one quiet moment in the presence of God are enough.”
            </p>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-zinc-100 font-extrabold text-sm sm:text-base font-['Chakra_Petch'] leading-tight">
                  Keep playing. Keep creating. Keep building.
                </p>
                <p className="text-xs text-amber-400 font-bold mt-1">
                  — Derrick Munene (Lead Developer &amp; Worship Musician)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('support')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Coffee className="w-3.5 h-3.5" /> Support The Project
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Developed with passion by Derrick Munene</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('support')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition-colors cursor-pointer border border-amber-500/40 flex items-center gap-1.5"
            >
              <Coffee className="w-3.5 h-3.5" /> Support Derrick
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

