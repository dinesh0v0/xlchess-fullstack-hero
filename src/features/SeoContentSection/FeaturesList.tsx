import { memo } from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "Premium Chess Experience",
    description: "A modern, blazing-fast, and completely free online chess platform built with cutting-edge technology for players of every skill level.",
    icon: "♚"
  },
  {
    title: "Stockfish Engine Integration",
    description: "Play against the world's strongest open-source chess engine running locally in your browser — zero latency, full privacy, five difficulty levels.",
    icon: "⚙️"
  },
  {
    title: "Curated Tactical Puzzles",
    description: "Sharpen your pattern recognition with 20+ handcrafted puzzles ranging from beginner forks to grandmaster-level sacrifices and underpromotions.",
    icon: "🧩"
  },
  {
    title: "Real-Time Game Analysis",
    description: "Watch the evaluation bar shift in real-time as you play. See the engine's assessment after every move and learn where you went wrong.",
    icon: "📊"
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const FeaturesList = memo(function FeaturesList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto mb-20">
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          custom={idx}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="group bg-brand-surface border border-brand-border rounded-2xl p-7 hover:border-brand-accent/50 transition-all duration-500 shadow-lg relative overflow-hidden"
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/0 to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="text-4xl mb-4 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform duration-300 inline-block">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
              {feature.title}
            </h3>
            <p className="text-text-secondary leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

export default FeaturesList;
