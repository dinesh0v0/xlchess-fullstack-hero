import { memo } from 'react';
import { motion } from 'framer-motion';

const PIECES = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];

const FallingPiecesBackground = memo(function FallingPiecesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-brand-accent/10 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[10%] w-[35vw] h-[35vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />

      {/* Floating Chess Pieces */}
      <div className="absolute inset-0 opacity-[0.03]">
        <motion.div
          animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[5%] text-[10rem] text-white select-none"
        >
          {PIECES[1]}
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 50, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[15%] right-[8%] text-[14rem] text-white select-none"
        >
          {PIECES[10]}
        </motion.div>

        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[60%] left-[12%] text-[8rem] text-white select-none"
        >
          {PIECES[4]}
        </motion.div>

        <motion.div
          animate={{ y: [0, 45, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[15%] text-[12rem] text-white select-none"
        >
          {PIECES[2]}
        </motion.div>
        
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[40%] left-[40%] text-[16rem] text-white select-none"
        >
          {PIECES[7]}
        </motion.div>
      </div>
    </div>
  );
});

export default FallingPiecesBackground;
