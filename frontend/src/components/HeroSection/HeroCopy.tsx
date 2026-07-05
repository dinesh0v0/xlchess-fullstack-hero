/**
 * HeroCopy — Left column of the hero section.
 *
 * Contains the XLCHESS brand logo (SVG knight), brand text,
 * main headline, subtitle, description, and CTA buttons.
 * Each element uses Framer Motion staggered fade-up entrance.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import AuthButtonGroup from './AuthButtonGroup';

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const HeroCopy = memo(function HeroCopy() {
  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* XLCHESS Brand Logo + Text */}
      <motion.div
        className="flex flex-col items-start"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        {/* Knight Logo SVG */}
        <svg
          className="w-20 h-24 sm:w-24 sm:h-28 text-white mb-2"
          viewBox="0 0 80 100"
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Knight silhouette */}
          <path
            d="M55.5 15c-3.5-4-8.5-7-14-8.5C38 5.5 34 5 30 5.5c-2 .3-4 1-5.5 2.2-1.5 1.2-2.5 3-2.8 5-.3 2 .2 4 1 5.8.8 1.8 2 3.3 3.5 4.5-3 2.5-5.5 5.5-7 9-2 4.5-2.5 9.5-1.5 14.5 1 5 3.5 9.5 7 13l.5.5v20c0 2 .8 3.8 2 5.2 1.2 1.3 3 2.2 4.8 2.3h26c2 0 3.8-.8 5.2-2.2 1.3-1.3 2.2-3 2.3-5V60.5c3-4 5-8.5 5.5-13.5.5-5-.5-10-3-14.5-2.5-4.5-6-8-10.5-10.5-1-.5-2-1-2.5-2-.3-.8-.5-1.8-.5-3V15zM40 20c2.5 0 5 .5 7.2 1.5 2.2 1 4 2.5 5.5 4.3 1.5 1.8 2.5 4 3 6.2.5 2.3.5 4.5 0 6.8-.8 3-2.5 5.5-4.8 7.5-2.3 2-5 3.2-8 3.5-3 .3-6-.2-8.5-1.5-2.5-1.3-4.5-3.3-6-5.8-1-1.8-1.8-3.8-2-6-.3-2.2 0-4.5.8-6.5 1-2.5 2.5-4.5 4.5-6 2-1.8 4.2-3 6.5-3.5.5-.2 1.2-.3 1.8-.5z"
            opacity="0.95"
          />
          {/* Mane detail */}
          <path
            d="M35 25c-1 1.5-1.5 3.2-1.5 5s.5 3.5 1.5 5c1 1.5 2.3 2.5 4 3.2 1.5.7 3.2 1 5 .8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
        </svg>

        {/* Brand text */}
        <div className="flex flex-col items-start">
          <h2 className="text-2xl sm:text-3xl font-black tracking-[0.15em] text-white uppercase leading-none">
            XLCHESS
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-[1.5px] bg-text-muted" />
            <span className="text-[0.65rem] font-medium tracking-[0.2em] text-text-muted uppercase">
              Excel at Chess
            </span>
            <div className="w-6 h-[1.5px] bg-text-muted" />
          </div>
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight"
        custom={0.15}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <span className="text-white">Build the Future of</span>
        <br />
        <span className="text-brand-accent bg-gradient-to-r from-brand-accent to-brand-accent-light bg-clip-text text-transparent">
          Online Chess
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg sm:text-xl font-semibold text-white/90 leading-snug"
        custom={0.3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        Making the Best Move on the Way to the Top
      </motion.p>

      {/* Description */}
      <motion.p
        className="text-base text-text-secondary leading-relaxed max-w-lg"
        custom={0.45}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        A complete chess platform to play, learn, compete, and grow—built
        to become the world's #1 destination for chess.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        custom={0.6}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <AuthButtonGroup />
      </motion.div>
    </div>
  );
});

export default HeroCopy;
