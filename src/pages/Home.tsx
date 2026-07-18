import { HeroContainer } from '../features/HeroSection';
import SubscribersSection from '../features/SubscribersSection';
import EnginePlayground from '../features/EnginePlayground';
import ContactSection from '../features/ContactSection';
import SeoContentSection from '../features/SeoContentSection';
import SiteFooter from '../layouts/SiteFooter';
import FallingPiecesBackground from '../components/FallingPiecesBackground';

export default function Home() {
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

        {/* Section 3.5: SEO Features & FAQ */}
        <SeoContentSection />

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
