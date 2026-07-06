/**
 * SubscribersSection — "Build More Than Subscribers" section.
 * Second section of the single-page layout matching xlchess.com.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

const SubscribersSection = memo(function SubscribersSection() {
  return (
    <section
      id="subscribers"
      className="relative w-full overflow-hidden bg-brand-navy py-24 lg:py-32"
      aria-label="Build More Than Subscribers"
    >
      {/* Floating background pieces */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <span className="absolute top-10 left-8 text-white/[0.03] text-8xl animate-float">♜</span>
        <span className="absolute bottom-20 left-20 text-white/[0.03] text-6xl animate-float-delayed">♝</span>
        <span className="absolute top-1/3 right-16 text-white/[0.02] text-7xl animate-float-slow">♛</span>
        <span className="absolute bottom-10 right-10 text-white/[0.025] text-5xl animate-float">♞</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — Text */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              <span className="text-white">Build More Than</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to right, #6e63f6, #8B7FFD)' }}
              >
                Subscribers
              </span>
            </h2>

            <p className="text-lg text-text-secondary leading-relaxed max-w-md">
              You've already done the hard part: building an audience.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed max-w-md">
              Now build a platform around your brand that grows with you.
            </p>

            <motion.button
              id="cta-build-platform"
              type="button"
              className="inline-flex items-center gap-2 font-bold text-base text-white px-8 py-4 rounded-2xl w-fit cursor-pointer transition-all duration-300"
              style={{
                background: 'linear-gradient(to right, #6e63f6, #7268f8, #7b6dff)',
                boxShadow: '0 0 34px rgba(110,99,246,0.35), 0 12px 42px rgba(0,0,0,0.35)',
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Build your platform"
            >
              Build Your Platform
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Right — Dashboard visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          >
            {/* Dashboard card mockup */}
            <div
              className="relative rounded-2xl overflow-hidden border border-brand-accent/30 bg-brand-surface"
              style={{ boxShadow: '0 0 60px rgba(110,99,246,0.2), 0 30px 80px rgba(0,0,0,0.5)' }}
            >
              {/* YouTube-style video thumbnail area */}
              <div className="relative bg-brand-surface-light p-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-[#0a0f1e] flex items-center justify-center relative">
                  {/* Chess pieces silhouette */}
                  <div className="text-center select-none">
                    <div className="text-7xl opacity-40 tracking-widest">♜♞♝♛♚♝♞♜</div>
                    <div className="text-5xl opacity-30 mt-2 tracking-widest">♟♟♟♟♟♟♟♟</div>
                  </div>
                  {/* YouTube play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600 rounded-xl px-5 py-3 flex items-center gap-2 shadow-2xl opacity-90">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard stats panel */}
              <div className="bg-brand-surface border-t border-brand-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-brand-accent text-lg">♜</div>
                  <span className="text-white font-bold text-sm tracking-widest uppercase">Your Brand</span>
                </div>
                {/* Tabs */}
                <div className="flex gap-3 mb-4 text-xs">
                  {['Overview', 'Content', 'Audience', 'Revenue', 'Settings'].map((t, i) => (
                    <span
                      key={t}
                      className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                        i === 0
                          ? 'bg-brand-accent text-white font-semibold'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Subscribers', value: '145,231', change: '+12.5%' },
                    { label: 'Monthly Revenue', value: '$24,560', change: '+18.3%' },
                    { label: 'Total Views', value: '3.2M', change: '+9.7%' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-brand-navy/50 rounded-lg p-2.5">
                      <p className="text-[0.6rem] text-text-muted mb-1">{stat.label}</p>
                      <p className="text-white font-bold text-sm">{stat.value}</p>
                      <p className="text-green-400 text-[0.6rem] font-semibold mt-0.5">↑ {stat.change}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glow border accent */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(110,99,246,0.15) 0%, transparent 50%, rgba(91,110,245,0.1) 100%)',
                }}
              />
            </div>

            {/* Outer glow */}
            <div
              className="absolute -inset-4 rounded-3xl -z-10 opacity-40 blur-2xl"
              style={{ background: 'radial-gradient(ellipse, rgba(110,99,246,0.3) 0%, transparent 70%)' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
});

export default SubscribersSection;
