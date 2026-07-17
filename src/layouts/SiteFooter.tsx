/**
 * SiteFooter — Footer matching dachess.com.
 * DACHESS knight logo, copyright, Play | Puzzles links.
 */

import { memo } from 'react';

const SiteFooter = memo(function SiteFooter() {
  return (
    <footer
      className="w-full bg-brand-surface border-t border-brand-border/50 py-8 px-6"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row flex-wrap items-center justify-between gap-8 sm:gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center sm:items-start gap-1 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-brand-accent text-2xl">♞</span>
            <span className="text-white font-black tracking-[0.15em] text-lg uppercase">DACHESS</span>
          </div>
          <span className="text-[0.6rem] text-text-muted tracking-[0.2em] uppercase">— Excel at Chess —</span>
        </div>

        {/* Copyright */}
        <p className="text-text-muted text-sm order-last sm:order-none w-full sm:w-auto text-center sm:text-left mt-4 sm:mt-0">
          DINESH :D
        </p>

        {/* Nav links */}
        <nav aria-label="Footer navigation" className="w-full sm:w-auto flex justify-center sm:justify-end">
          <ul className="flex items-center gap-4 text-sm">
            <li>
              <a
                href="#hero"
                onClick={(e) => { e.preventDefault(); document.getElementById('engine-playground')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-text-secondary hover:text-white transition-colors duration-200"
              >
                Play
              </a>
            </li>
            <li className="text-brand-border">|</li>
            <li>
              <a
                href="#hero"
                onClick={(e) => { e.preventDefault(); document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-text-secondary hover:text-white transition-colors duration-200"
              >
                Puzzles
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
});

export default SiteFooter;
