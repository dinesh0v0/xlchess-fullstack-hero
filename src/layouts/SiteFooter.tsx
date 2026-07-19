/**
 * SiteFooter — Premium footer for DAChess.
 * Three-column layout: brand, navigation, social/contact.
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../assets/Icon.png';

const SiteFooter = memo(function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full bg-brand-surface border-t border-brand-border/30"
      role="contentinfo"
    >
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <img src={Icon} alt="DAChess Logo" className="w-9 h-9 rounded-lg object-cover" />
              <span className="text-white font-black tracking-[0.15em] text-xl uppercase">DACHESS</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs mt-1">
              The premium online chess platform. Play against Stockfish, solve tactical puzzles, and master your game — completely free.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h4>
            <nav aria-label="Footer navigation">
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="#engine-playground"
                    onClick={(e) => { e.preventDefault(); document.getElementById('engine-playground')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="text-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-accent/40 group-hover:bg-brand-accent transition-colors" />
                    Live Demo
                  </a>
                </li>
                <li>
                  <Link
                    to="/puzzles"
                    className="text-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-accent/40 group-hover:bg-brand-accent transition-colors" />
                    Practice Puzzles
                  </Link>
                </li>
                <li>
                  <a
                    href="#about-dachess"
                    onClick={(e) => { e.preventDefault(); document.getElementById('about-dachess')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="text-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-accent/40 group-hover:bg-brand-accent transition-colors" />
                    Features & FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="text-text-secondary hover:text-brand-accent transition-colors duration-200 text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-accent/40 group-hover:bg-brand-accent transition-colors" />
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Built With */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Stockfish', 'Framer Motion', 'Tailwind CSS', 'Vite'].map((tech) => (
                <span
                  key={tech}
                  className="text-xs text-text-muted bg-white/5 border border-brand-border/50 rounded-full px-3 py-1.5 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-border/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs tracking-wide">
            © {year} DAChess — Made with ♟ by Dinesh
          </p>
          <p className="text-text-muted/50 text-xs">
            All chess positions are analyzed locally. No data leaves your browser.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default SiteFooter;
