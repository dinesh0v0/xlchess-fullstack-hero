/**
 * HeroContainer — Top-level wrapper for the hero section.
 *
 * Implements the two-column responsive grid layout:
 * - Left: HeroCopy (branding, headline, CTAs)
 * - Right: GameVisual (interactive chessboard)
 * - Background: FloatingPieces (decorative silhouettes)
 *
 * Uses semantic HTML (`<section>`, `<header>`) and mobile-first
 * Tailwind layout with absolutely zero overflow issues.
 */

import { memo } from 'react';
import HeroCopy from './HeroCopy';
import GameVisual from './GameVisual';
import FloatingPieces from './FloatingPieces';

const HeroContainer = memo(function HeroContainer() {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-brand-navy flex flex-col"
      aria-label="DAChess Hero Section"
    >
      {/* Background decorative elements */}
      <FloatingPieces />

      {/* Top gradient edge (subtle blue line seen on dachess.com) */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(91,110,245,0.6) 30%, rgba(110,99,246,0.8) 50%, rgba(91,110,245,0.6) 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Main content grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex-1 flex flex-col justify-center py-12 lg:py-24">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Copy */}
          <div className="order-1">
            <HeroCopy />
          </div>

          {/* Right Column — Game Visual */}
          <div className="order-2">
            <GameVisual />
          </div>
        </div>
      </div>

      {/* Bottom fade gradient into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background:
            'linear-gradient(to bottom, transparent, var(--color-brand-navy))',
        }}
        aria-hidden="true"
      />
    </section>
  );
});

export default HeroContainer;
