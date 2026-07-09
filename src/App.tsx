/**
 * Root application — single-page layout matching dachess.com.
 *
 * Sections (in order, scrollable):
 *  1. Hero          — Brand + headline + Evergreen Game chessboard
 *  2. Subscribers   — "Build More Than Subscribers" + dashboard visual
 *  3. Engine        — Interactive AI engine playground
 *  4. Contact       — Contact Us form
 *  5. Footer        — Logo + copyright + links
 */

import { HeroContainer } from './features/HeroSection';
import SubscribersSection from './features/SubscribersSection';
import EnginePlayground from './features/EnginePlayground';
import ContactSection from './features/ContactSection';
import SiteFooter from './layouts/SiteFooter';
import FallingPiecesBackground from './components/FallingPiecesBackground';

function App() {
  return (
    <div className="min-h-screen bg-brand-navy relative">
      <FallingPiecesBackground />
      <main className="relative z-10">
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
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

export default App;
