/**
 * SubscribersSection — "Build More Than Subscribers"
 * Right panel uses the final-banner.png image with neon glow border.
 * "Build Your Platform" scrolls to #contact.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const SubscribersSection = memo(function SubscribersSection() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="subscribers"
      className="relative w-full overflow-hidden py-24 lg:py-32"
      style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)' }}
      aria-label="Build More Than Subscribers"
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
        className="absolute top-1/2 -translate-y-1/2 right-1/4 w-96 h-96 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Text content */}
          <motion.div
            className="flex flex-col gap-7"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease }}
          >
            {/* Eyebrow */}
            <motion.div
              className="inline-flex items-center gap-2 w-fit"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
            >
              <div className="w-6 h-[2px] rounded bg-brand-accent" />
              <span className="text-xs font-bold text-brand-accent tracking-[0.2em] uppercase">
                Creator Platform
              </span>
            </motion.div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight">
              <span className="text-white">Build More Than</span>
              <br />
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
                Subscribers
              </span>
            </h2>

            {/* Body text */}
            <div className="flex flex-col gap-4 max-w-md">
              <p className="text-lg text-text-secondary leading-relaxed">
                You've already done the hard part: building an audience.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                Now build a platform around your brand that grows with you.
              </p>
            </div>

            {/* CTA button */}
            <motion.button
              id="cta-build-platform"
              type="button"
              onClick={scrollToContact}
              className="inline-flex items-center gap-3 font-bold text-base text-white px-8 py-4 rounded-2xl w-fit cursor-pointer transition-all duration-300 overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #fcd34d 60%, #fde68a 100%)',
                boxShadow: '0 0 40px rgba(212,175,55,0.4), 0 14px 44px rgba(0,0,0,0.35)',
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Build Your Platform — scroll to contact"
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
              <span className="relative z-10">Build Your Platform</span>
              <motion.svg
                className="w-4 h-4 relative z-10"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </motion.svg>
            </motion.button>
          </motion.div>

          {/* Right — final banner.png with neon glow frame */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, x: 50, scale: 0.94 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, delay: 0.1, ease }}
          >
            {/* Outer purple glow blob */}
            <div
              className="absolute -inset-8 rounded-3xl opacity-30 blur-3xl -z-10"
              style={{ background: 'radial-gradient(ellipse at center, #d4af37 0%, transparent 70%)' }}
              aria-hidden="true"
            />

            {/* Image container with neon border */}
            <motion.div
              className="relative rounded-2xl overflow-hidden animate-neon-border border"
              style={{
                borderColor: 'rgba(212,175,55,0.4)',
                boxShadow: '0 0 40px rgba(212,175,55,0.25), 0 30px 80px rgba(0,0,0,0.6)',
              }}
              whileHover={{ scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <img
                src="/final-banner.png"
                alt="DAChess creator dashboard — YouTube analytics and chess content platform"
                className="w-full h-auto block"
                style={{ maxWidth: '600px', minWidth: '280px' }}
                loading="lazy"
              />

              {/* Subtle gradient overlay at edges */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(10,10,10,0.1) 0%, transparent 40%, rgba(10,10,10,0.1) 100%)',
                }}
                aria-hidden="true"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

export default SubscribersSection;
