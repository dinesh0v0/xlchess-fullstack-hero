import { memo } from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "Premium Online Chess Platform",
    description: "DAChess provides a modern, blazing-fast, and completely free online chess experience tailored for players of all skill levels.",
    icon: "♚"
  },
  {
    title: "Play Free Chess Online Instantly",
    description: "Jump into a game without friction. Play free chess online with no sign-in required. Experience ultra-responsive design.",
    icon: "⚡"
  },
  {
    title: "Advanced Chess Engine Analytics",
    description: "Analyze your games locally with our powerful Stockfish engine integration to find the best moves and climb the ranks.",
    icon: "📈"
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const FeaturesList = memo(function FeaturesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto mb-20">
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          custom={idx}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="bg-brand-surface border border-brand-border rounded-2xl p-8 hover:border-brand-accent/50 transition-colors shadow-lg relative overflow-hidden group"
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/0 to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="text-4xl mb-4 text-brand-accent drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            {feature.title}
          </h3>
          <p className="text-text-secondary leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
});

export default FeaturesList;
