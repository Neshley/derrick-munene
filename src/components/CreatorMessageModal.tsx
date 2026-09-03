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
  ExternalLink
} from 'lucide-react';

interface CreatorMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorMessageModal: React.FC<CreatorMessageModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<'paypal' | 'mpesa' | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'paypal' | 'mpesa') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const paypalEmail = 'derrickmunene2025@gmail.com';
  const mpesaNumber = '+254 704 034 278';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100 ring-1 ring-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/30 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-wide text-zinc-100 font-['Chakra_Petch']">
                  A MESSAGE FROM THE CREATOR
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Vision &amp; Support
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                The heart, vision, technology, and story behind DM ARRANGIA
              </p>
            </div>
          </div>

          <button
            id="btn-close-creator-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Close Message"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 select-text scrollbar-thin bg-zinc-950/80 leading-relaxed text-zinc-200 text-sm">
          
          {/* Quote Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30">
            <p className="text-amber-300 font-bold text-sm sm:text-base italic">
              “Technology should serve music, not get in the way of it.”
            </p>
            <span className="text-[11px] text-zinc-400 block mt-1 uppercase tracking-wider font-semibold">
              — The Creator
            </span>
          </div>

          {/* Section: Why I Created This Application */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              Why I Created This Application
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm">
              As a musician and engineer, I have always been interested in the relationship between creativity, technology, sound, and automation. I wanted to build something that could bring those worlds together in a practical way.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm">
              The idea behind this arranger started with a desire to create a digital environment where a musician could sit down, play a chord, and immediately have a musical world respond to it.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm">
              But I didn't want to build just another music player. I wanted to build an <strong className="text-amber-400">interactive arranger</strong> — something that could understand chords, respond to the musician, change accompaniment, control different instruments, work with MIDI keyboards, and provide a dynamic musical experience.
            </p>
          </section>

          {/* Section: Built for Worship */}
          <section className="space-y-3 pt-3 border-t border-zinc-900">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              Built for Worship &amp; Prayer
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm">
              One of the most important directions of this project is <strong>worship and prayer</strong>.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm">
              During prayer, music can create space for reflection, singing, meditation, and worship. Sometimes a full drum pattern is appropriate. Other times, the best accompaniment is simply a warm piano, a soft organ, a gentle bass line, and enough space to breathe.
            </p>
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                Musical Dynamics Architecture
              </span>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-amber-200">
                <span className="px-2 py-1 bg-zinc-950 rounded-lg border border-zinc-800">No Drums</span>
                <span className="text-zinc-500">→</span>
                <span className="px-2 py-1 bg-zinc-950 rounded-lg border border-zinc-800">Shaker</span>
                <span className="text-zinc-500">→</span>
                <span className="px-2 py-1 bg-zinc-950 rounded-lg border border-zinc-800">Light Groove</span>
                <span className="text-zinc-500">→</span>
                <span className="px-2 py-1 bg-zinc-950 rounded-lg border border-amber-500/50 text-amber-300">Full Worship</span>
              </div>
            </div>
            <p className="text-zinc-400 text-xs italic">
              The music can grow with the moment, and it can become quiet again when the moment calls for it.
            </p>
          </section>

          {/* Section: Built With Technology */}
          <section className="space-y-3 pt-3 border-t border-zinc-900">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              Built With Technology
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm">
              Behind the interface is a combination of software engineering, digital audio, MIDI technology, music theory, and arranger-system concepts:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {[
                'Web Audio API',
                'MIDI Input & Events',
                'Real-Time Processing',
                'Chord Recognition',
                'Auto Accompaniment',
                'MIDI Style Parsing',
                'Yamaha .STY Structures',
                'CASM / NTR / NTT',
                'Retrigger Rules',
                'Progressive Worship',
                'PWA / Offline Tech',
                'DSP & Parametric EQ'
              ].map((tech, tIdx) => (
                <div key={tIdx} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="truncate">{tech}</span>
                </div>
              ))}
            </div>
            <p className="text-zinc-300 text-xs sm:text-sm">
              The goal is not simply to reproduce the appearance of a keyboard. The goal is to understand the <strong className="text-amber-400">musical intelligence behind an arranger</strong> and bring that experience into software.
            </p>
          </section>

          {/* Section: Still Growing */}
          <section className="space-y-2 pt-3 border-t border-zinc-900">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              Still Growing
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm">
              This application is a work in progress. There are many things I want to improve, including more realistic accompaniment, better Yamaha-style compatibility, more expressive instruments, improved chord recognition, better MIDI control, richer worship styles, and more intelligent accompaniment behavior.
            </p>
            <p className="text-zinc-400 text-xs">
              Every improvement is part of the journey toward creating a more capable digital arranger.
            </p>
          </section>

          {/* Section: My Vision */}
          <section className="space-y-3 pt-3 border-t border-zinc-900">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              My Vision
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm">
              My vision is to create an arranger that feels less like a machine and more like a <strong className="text-amber-300">musical partner</strong>.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm">
              A musician should be able to sit down, choose a style, play a chord, and immediately begin creating. Whether the moment is:
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {['Prayer', 'Worship', 'Practice', 'Composition', 'Performance', 'Or simply playing for the joy of music'].map((v, i) => (
                <span key={i} className="px-3 py-1 bg-amber-950/50 border border-amber-500/30 text-amber-300 rounded-full">
                  {v}
                </span>
              ))}
            </div>
            <p className="text-zinc-400 text-xs">
              The technology should disappear into the experience. The musician should remain at the center.
            </p>
          </section>

          {/* Section: Support the Project */}
          <section className="p-5 rounded-2xl bg-gradient-to-tr from-amber-950/60 via-zinc-900 to-zinc-900 border-2 border-amber-500/40 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-amber-300 font-['Chakra_Petch']">
                  SUPPORT THE PROJECT
                </h3>
                <p className="text-xs text-zinc-300">
                  Buy the creator a coffee to support continued development &amp; worship styles
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              If you enjoy using this application and feel that it has been useful to you, you are welcome to buy the creator a coffee. There is absolutely <strong>no obligation</strong> to contribute. Your support is simply a way of saying:
            </p>

            <blockquote className="border-l-2 border-amber-400 pl-3 italic text-amber-200 text-xs">
              “I appreciate the work.”
            </blockquote>

            <p className="text-xs text-zinc-400">
              Every contribution, regardless of its size, helps support continued development, testing, improvements, new worship styles, better sounds, and new features.
            </p>

            {/* Donation Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* PayPal Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span>PayPal</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">International</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900 font-mono text-xs text-zinc-200 break-all select-all flex items-center justify-between gap-2 border border-zinc-800">
                  <span className="text-[11px] sm:text-xs text-amber-200 font-semibold">{paypalEmail}</span>
                  <button
                    onClick={() => handleCopy(paypalEmail, 'paypal')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors shrink-0 cursor-pointer"
                    title="Copy PayPal address"
                  >
                    {copiedType === 'paypal' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <a
                  href={`mailto:${paypalEmail}?subject=DM%20ARRANGIA%20Feedback%20%26%20Support`}
                  className="text-[11px] text-amber-400/90 hover:text-amber-300 hover:underline flex items-center gap-1 font-medium"
                >
                  <Send className="w-3 h-3" /> Send an Email / Message
                </a>
              </div>

              {/* M-Pesa Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>M-Pesa (Kenya / Global)</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Mobile Money</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900 font-mono text-xs text-zinc-200 flex items-center justify-between gap-2 border border-zinc-800">
                  <span className="text-xs sm:text-sm text-emerald-300 font-bold">{mpesaNumber}</span>
                  <button
                    onClick={() => handleCopy(mpesaNumber, 'mpesa')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                    title="Copy M-Pesa phone number"
                  >
                    {copiedType === 'mpesa' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Send Money or Lipa via M-Pesa to Derrick Munene
                </p>
              </div>
            </div>
          </section>

          {/* A Final Word */}
          <section className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block"></span>
              A Final Word
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm">
              Thank you for giving this project a place in your music.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm">
              I hope it helps you create something beautiful. I hope it gives you a peaceful atmosphere when you need one. I hope it inspires you to experiment.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm">
              And most importantly, I hope it reminds you that music does not always have to be complicated to be meaningful.
            </p>
            <p className="text-amber-300 font-semibold text-xs sm:text-sm">
              Sometimes one chord, one melody, and one quiet moment are enough.
            </p>
            <div className="pt-2">
              <p className="text-zinc-100 font-extrabold text-sm sm:text-base font-['Chakra_Petch'] leading-tight">
                Keep playing. <br />
                Keep creating. <br />
                Keep building.
              </p>
              <p className="text-xs text-amber-400 font-bold mt-2">
                — The Creator
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>Thank you for being part of this journey</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
