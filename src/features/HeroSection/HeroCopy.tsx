/**
 * HeroCopy — Left column of the hero section.
 *
 * Contains the DACHESS brand logo (SVG knight), brand text,
 * main headline, subtitle, description, and CTA buttons.
 * Each element uses Framer Motion staggered fade-up entrance.
 */

import { memo } from 'react';
import { motion} from 'framer-motion';
import AuthButtonGroup from './AuthButtonGroup';
import customLogo from '../../assets/King_Icon.png';


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
      {/* DACHESS Brand Logo + Text */}
      <motion.div
        className="flex flex-col items-start"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        {/* Custom Image Logo */}
        <img
          src={customLogo}
          alt="DAChess King Logo - Premium Online Chess Platform"
          className="w-32 sm:w-40 mb-2 rounded-xl shadow-lg"
        />

        {/* Brand text */}
        <div className="flex flex-col items-start">
          <div className="text-2xl sm:text-3xl font-black tracking-[0.15em] text-white uppercase leading-none">
            DACHESS
          </div>
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

      {/* Scroll indicator */}
      <motion.div
        className="flex items-center gap-2 mt-2"
        custom={0.8}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-text-muted"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <span className="text-[0.65rem] text-text-muted font-medium tracking-wider uppercase">
          Scroll to explore
        </span>
      </motion.div>
    </div>
  );
});

export default HeroCopy;
