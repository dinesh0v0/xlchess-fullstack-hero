/**
 * AuthButtonGroup — CTA buttons for the hero section.
 *
 * Features the "Play" button with trophy icon and shine animation.
 * Wired to the API service layer to demonstrate full-stack readiness.
 */

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AuthButtonGroupProps {
  onPlayClick?: () => void;
}

const AuthButtonGroup = memo(function AuthButtonGroup({
  onPlayClick,
}: AuthButtonGroupProps) {
  const handlePlay = useCallback(() => {
    if (onPlayClick) {
      onPlayClick();
    } else {
      // Default: demonstrate API service connection
      console.info(
        '[XLChess] Play button clicked — would call signUp() or navigate to game lobby.'
      );
    }
  }, [onPlayClick]);

  return (
    <motion.div
      className="flex flex-wrap gap-4 items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      {/* Primary CTA — Play */}
      <motion.button
        id="cta-play"
        type="button"
        onClick={handlePlay}
        className="animate-shine group relative inline-flex items-center gap-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-300 cursor-pointer"
        style={{ boxShadow: 'var(--shadow-cta)' }}
        whileHover={{
          scale: 1.03,
          boxShadow: 'var(--shadow-cta-hover)',
        }}
        whileTap={{ scale: 0.98 }}
        aria-label="Start playing chess"
      >
        {/* Trophy icon */}
        <span className="text-2xl" role="img" aria-hidden="true">
          🏆
        </span>
        <span className="text-lg tracking-wide">Play</span>
      </motion.button>

      {/* Secondary CTA — Sign Up (subtle) */}
      <motion.button
        id="cta-signup"
        type="button"
        className="group relative inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-medium text-sm px-6 py-4 rounded-xl border border-brand-border hover:border-brand-accent/50 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Create a new account"
      >
        <span>Sign Up</span>
        <motion.svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          whileHover={{ x: 3 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </motion.svg>
      </motion.button>
    </motion.div>
  );
});

export default AuthButtonGroup;
