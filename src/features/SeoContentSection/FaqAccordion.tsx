import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: "Is DAChess really free?",
    a: "Yes! DAChess is a premium online chess platform where you can play free chess online instantly. There are no hidden fees or forced subscriptions."
  },
  {
    q: "What chess engine does DAChess use?",
    a: "We use the powerful Stockfish engine running directly in your browser via Web Workers. This provides ultra-fast, local chess analysis — your moves never leave your device."
  },
  {
    q: "How do the chess puzzles work?",
    a: "Our curated puzzle collection tests your tactical vision across all skill levels — from beginner forks to grandmaster-level sacrifices. Each puzzle has one correct solution that you must find."
  },
  {
    q: "Is DAChess available on mobile?",
    a: "Absolutely. Our platform is built with a responsive design, meaning you get the exact same premium online chess experience on your phone, tablet, or desktop."
  }
];

const FaqAccordion = memo(function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <h3 className="text-2xl font-bold text-white text-center mb-6">Frequently Asked Questions</h3>
      {faqs.map((faq, idx) => (
        <div 
          key={idx} 
          className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-md"
        >
          <button
            onClick={() => toggle(idx)}
            className="w-full px-6 py-5 text-left flex justify-between items-center bg-transparent focus:outline-none cursor-pointer"
            aria-expanded={openIndex === idx}
          >
            <span className="font-semibold text-white/90 text-lg">{faq.q}</span>
            <motion.span
              className="text-brand-accent font-mono text-xl ml-4 flex-shrink-0"
              animate={{ rotate: openIndex === idx ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              +
            </motion.span>
          </button>
          
          <AnimatePresence initial={false}>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 pt-1 text-text-secondary leading-relaxed border-t border-brand-border/30 mt-2">
                  {faq.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
});

export default FaqAccordion;
