/**
 * SubscribersSection — "Master Your Game" chess mastery showcase.
 * Displays animated statistics and chess achievements with premium design.
 */

import { memo, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Animated counter hook — counts from 0 to target when in view */
function useCounter(target: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return count;
}

const STATS = [
  { value: 20, suffix: '+', label: 'Tactical Puzzles', icon: '🧩' },
  { value: 5, suffix: '', label: 'Difficulty Levels', icon: '🎯' },
  { value: 100, suffix: '%', label: 'Browser-Based', icon: '⚡' },
  { value: 0, suffix: '∞', label: 'Games to Play', icon: '♟️' },
];

const SubscribersSection = memo(function SubscribersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const scrollToPlayground = () => {
    document.getElementById('engine-playground')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="mastery"
      className="relative w-full overflow-hidden py-20 lg:py-32"
      style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)' }}
      aria-label="Master Your Game"
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(rgba(212,175,55,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.8) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      {/* Floating ambient orb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-1/4 w-96 h-96 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-6 h-[2px] rounded bg-brand-accent" />
            <span className="text-xs font-bold text-brand-accent tracking-[0.2em] uppercase">
              Your Chess Journey
            </span>
            <div className="w-6 h-[2px] rounded bg-brand-accent" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6">
            <span className="text-white">Master Your </span>
            <span
              className="animate-gradient-pan"
              style={{
                backgroundImage: 'linear-gradient(90deg, #d4af37, #fcd34d, #fde68a, #d4af37)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Game
            </span>
          </h2>

          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            From tactical puzzles to engine-powered analysis, DAChess gives you everything you need to elevate your chess skills — completely free, right in your browser.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} inView={isInView} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
        >
          <motion.button
            id="cta-start-playing"
            type="button"
            onClick={scrollToPlayground}
            className="inline-flex items-center gap-3 font-bold text-base text-brand-navy px-10 py-4 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #fcd34d 60%, #fde68a 100%)',
              boxShadow: '0 0 40px rgba(212,175,55,0.4), 0 14px 44px rgba(0,0,0,0.35)',
            }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Start playing chess"
          >
            {/* Shine sweep */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.16) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
                backgroundPosition: '-100% 0',
              }}
              whileHover={{ backgroundPosition: '200% 0' }}
              transition={{ duration: 0.5 }}
            />
            <span className="relative z-10 font-black">Start Playing Now</span>
            <motion.svg
              className="w-5 h-5 relative z-10"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </motion.svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
});

/** Individual stat card with animated counter */
const StatCard = memo(function StatCard({
  stat,
  index,
  inView,
}: {
  stat: (typeof STATS)[number];
  index: number;
  inView: boolean;
}) {
  const count = useCounter(stat.value, 2000, inView);
  const displayValue = stat.value === 0 ? '' : count.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease }}
      className="group relative bg-brand-surface/80 backdrop-blur-sm border border-brand-border rounded-2xl p-6 lg:p-8 text-center hover:border-brand-accent/40 transition-all duration-500 overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/0 to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <span className="text-3xl mb-3 block">{stat.icon}</span>
        <div className="text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight">
          {displayValue}{stat.suffix}
        </div>
        <div className="text-sm text-text-secondary font-medium tracking-wide">
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
});

export default SubscribersSection;
