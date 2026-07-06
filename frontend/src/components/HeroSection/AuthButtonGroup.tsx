/**
 * AuthButtonGroup — Single "Play" CTA button (Sign Up removed).
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
    }
    // Scroll to the engine playground section
    const el = document.getElementById('engine-playground');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [onPlayClick]);

  return (
    <motion.div
      className="flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      {/* Primary CTA — Play */}
      <motion.button
        id="cta-play"
        type="button"
        onClick={handlePlay}
        className="animate-shine group relative inline-flex items-center gap-3 bg-brand-cta hover:bg-brand-cta-hover text-white font-semibold text-lg px-10 py-4 rounded-xl transition-all duration-300 cursor-pointer"
        style={{ boxShadow: 'var(--shadow-cta)' }}
        whileHover={{ scale: 1.03, boxShadow: 'var(--shadow-cta-hover)' }}
        whileTap={{ scale: 0.98 }}
        aria-label="Start playing chess"
      >
        <span className="text-2xl" role="img" aria-hidden="true">🏆</span>
        <span className="tracking-wide">Play</span>
      </motion.button>
    </motion.div>
  );
});

export default AuthButtonGroup;
