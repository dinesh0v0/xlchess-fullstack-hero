import { memo } from 'react';
import FeaturesList from './FeaturesList';
import FaqAccordion from './FaqAccordion';

const SeoContentSection = memo(function SeoContentSection() {
  return (
    <section 
      id="about-dachess" 
      className="w-full bg-brand-navy py-16 lg:py-24 px-6 sm:px-8 lg:px-12 relative overflow-hidden"
      aria-label="About DAChess Features and FAQ"
    >
      {/* Decorative background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, var(--color-brand-accent) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
            Why Choose DAChess?
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover why players around the world are switching to the ultimate premium online chess platform.
          </p>
        </div>

        <FeaturesList />
        <FaqAccordion />
      </div>
    </section>
  );
});

export default SeoContentSection;
