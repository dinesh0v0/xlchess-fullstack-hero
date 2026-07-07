/**
 * AuthButtonGroup — Single "Play" CTA button.
 * On hover: trophy icon slides right and glows, "Play" label fades in.
 * Matches Screenshot (133).
 */

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AuthButtonGroupProps {
  onPlayClick?: () => void;
}

const AuthButtonGroup = memo(function AuthButtonGroup({ onPlayClick }: AuthButtonGroupProps) {
  const handlePlay = useCallback(() => {
    if (onPlayClick) onPlayClick();
    document.getElementById('engine-playground')?.scrollIntoView({ behavior: 'smooth' });
  }, [onPlayClick]);

  return (
    <motion.div
      className="flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      {/* Play button with premium hover */}
      <motion.button
        id="cta-play"
        type="button"
        onClick={handlePlay}
        className="group relative inline-flex items-center overflow-hidden rounded-xl cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #d4af37 0%, #fcd34d 100%)',
          boxShadow: '0 4px 20px rgba(212,175,55,0.45), 0 1px 0 rgba(255,255,255,0.08) inset',
          padding: '14px 28px',
        }}
        whileTap={{ scale: 0.97 }}
        aria-label="Start playing chess"
      >
        {/* Shine sweep on hover */}
        <motion.span
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
            backgroundSize: '200% 100%',
            backgroundPosition: '-100% 0',
          }}
          whileHover={{ backgroundPosition: '200% 0' }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        />

        {/* Trophy — slides right on hover */}
        <motion.span
          className="text-xl z-10 relative"
          style={{ willChange: 'transform' }}
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          role="img" aria-hidden="true"
        >
          🏆
        </motion.span>

        {/* "Play" text — fades and slides in on hover */}
        <motion.span
          className="z-10 relative font-bold text-white tracking-wide overflow-hidden"
          style={{ fontSize: '1.05rem' }}
          initial={{ width: 0, opacity: 0, marginLeft: 0 }}
          whileHover={{ width: 'auto', opacity: 1, marginLeft: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          Play
        </motion.span>

        {/* Glow ring that intensifies on hover */}
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{ boxShadow: '0 0 0px rgba(212,175,55,0)' }}
          whileHover={{ boxShadow: '0 0 28px 4px rgba(252,211,77,0.55)' }}
          transition={{ duration: 0.25 }}
        />
      </motion.button>
    </motion.div>
  );
});

export default AuthButtonGroup;
