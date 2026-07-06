/**
 * Root application — single-page layout matching xlchess.com.
 *
 * Sections (in order, scrollable):
 *  1. Hero          — Brand + headline + Evergreen Game chessboard
 *  2. Subscribers   — "Build More Than Subscribers" + dashboard visual
 *  3. Engine        — Interactive AI engine playground
 *  4. Contact       — Contact Us form
 *  5. Footer        — Logo + copyright + links
 */

import { HeroContainer } from './components/HeroSection';
import SubscribersSection from './components/SubscribersSection';
import EnginePlayground from './components/EnginePlayground';
import ContactSection from './components/ContactSection';
import SiteFooter from './components/SiteFooter';

function App() {
  return (
    <div className="min-h-screen bg-brand-navy">
      <main>
        {/* Section 1: Hero */}
        <HeroContainer />

        {/* Section 2: Build More Than Subscribers */}
        <SubscribersSection />

        {/* Section 3: Engine Playground */}
        <EnginePlayground />

        {/* Section 4: Contact Us */}
        <ContactSection />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

export default App;
