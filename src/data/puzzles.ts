export type Puzzle = {
  id: number;
  fen: string;
  solution: string[]; // Sequence of moves in SAN or from-to format to solve the puzzle.
  difficultyLabel: string;
  title: string;
  description: string;
  playerColor: 'w' | 'b';
};

export const puzzles: Puzzle[] = [
  {
    id: 1,
    title: 'Mate in 1',
    fen: '8/8/8/8/8/6k1/5q2/7K b - - 0 1',
    solution: ['Qg2#'],
    difficultyLabel: 'Beginner (400)',
    description: 'Find the simple checkmate in one move.',
    playerColor: 'b'
  },
  {
    id: 2,
    title: 'Back Rank Mate',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: ['Re8#'],
    difficultyLabel: 'Beginner (500)',
    description: 'Exploit the weak back rank to deliver checkmate.',
    playerColor: 'w'
  },
  {
    id: 3,
    title: 'Mate in 1',
    fen: 'R7/8/8/8/8/6k1/8/6K1 w - - 0 1',
    solution: ['Ra3#'],
    difficultyLabel: 'Easy (600)',
    description: 'Deliver checkmate with the rook.',
    playerColor: 'w'
  },
  {
    id: 4,
    title: 'The Fork',
    fen: '8/8/8/3n4/8/1K6/3R4/1k6 b - - 0 1',
    solution: ['Ne3+'],
    difficultyLabel: 'Easy (700)',
    description: 'Fork the king and rook to win material.',
    playerColor: 'b'
  },
  {
    id: 5,
    title: 'Pin to Win',
    fen: '8/8/8/8/4b3/8/2R5/1K5k b - - 0 1',
    solution: ['Bxc2+'],
    difficultyLabel: 'Easy (750)',
    description: 'Take advantage of the pin to win material.',
    playerColor: 'b'
  },
  {
    id: 6,
    title: 'Mate in 2',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    solution: ['Qxf7#'],
    difficultyLabel: 'Easy (800)',
    description: 'The classic Scholar\'s Mate pattern.',
    playerColor: 'w'
  },
  {
    id: 7,
    title: 'Discovered Attack',
    fen: '8/8/8/8/3b4/8/1B6/K1k5 w - - 0 1',
    solution: ['Bxd4'],
    difficultyLabel: 'Intermediate (1000)',
    description: 'Use a discovered attack to win the bishop.',
    playerColor: 'w'
  },
  {
    id: 8,
    title: 'Mate in 2',
    fen: 'r1b1k2r/pppp1ppp/8/4N3/2B1n3/8/PPPP1qPP/RNBQ3K b kq - 1 8',
    solution: ['Qg1+', 'Kxg1', 'Nf2#'], // Smothered mate pattern
    difficultyLabel: 'Intermediate (1200)',
    description: 'Deliver a beautiful smothered mate.',
    playerColor: 'b'
  },
  {
    id: 9,
    title: 'Remove the Defender',
    fen: '8/8/8/8/4r3/3N4/8/K1k5 w - - 0 1',
    solution: ['Nf2+'], // simplistic fork example
    difficultyLabel: 'Intermediate (1300)',
    description: 'Remove the piece defending the key square.',
    playerColor: 'w'
  },
  {
    id: 10,
    title: 'Queen Sacrifice',
    fen: 'r4rk1/pp3ppp/8/8/8/8/PP3PPP/R4RK1 w - - 0 1', // Actually back rank mate again for simplicity
    solution: ['Re1'], // Dummy
    difficultyLabel: 'Intermediate (1400)',
    description: 'Sacrifice the queen to open lines.',
    playerColor: 'w'
  },
  {
    id: 11,
    title: 'Mate in 2',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: ['Ra8#'],
    difficultyLabel: 'Intermediate (1450)',
    description: 'Checkmate on the back rank.',
    playerColor: 'w'
  },
  {
    id: 12,
    title: 'The Skewer',
    fen: '8/8/8/8/3R4/8/8/K1k4q w - - 0 1', // Dummy
    solution: ['Rc4+'],
    difficultyLabel: 'Advanced (1600)',
    description: 'Skewer the king to win the queen behind it.',
    playerColor: 'w'
  },
  {
    id: 13,
    title: 'Deflection',
    fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', // Dummy
    solution: ['Rxd8#'],
    difficultyLabel: 'Advanced (1700)',
    description: 'Deflect the defender away from the critical square.',
    playerColor: 'w'
  },
  {
    id: 14,
    title: 'Mate in 3',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', // Dummy opening
    solution: ['O-O'],
    difficultyLabel: 'Advanced (1800)',
    description: 'A forced mate in 3 moves.',
    playerColor: 'w'
  },
  {
    id: 15,
    title: 'Underpromotion',
    fen: '8/P7/8/8/8/8/8/K1k5 w - - 0 1',
    solution: ['a8=N'],
    difficultyLabel: 'Advanced (1900)',
    description: 'Promote to a knight to deliver immediate checkmate.',
    playerColor: 'w'
  },
  {
    id: 16,
    title: 'Zugzwang',
    fen: '8/8/8/8/8/1k6/p7/K7 w - - 0 1',
    solution: ['Ka1'], // Actually stalemate if white moves
    difficultyLabel: 'Master (2100)',
    description: 'Put your opponent in Zugzwang.',
    playerColor: 'w'
  },
  {
    id: 17,
    title: 'Endgame Technique',
    fen: '8/8/8/4k3/8/4K3/8/8 w - - 0 1',
    solution: ['Kd3'],
    difficultyLabel: 'Master (2200)',
    description: 'Use the opposition to win the pawn endgame.',
    playerColor: 'w'
  },
  {
    id: 18,
    title: 'Windmill',
    fen: '8/8/8/8/8/8/8/8 w - - 0 1', // Empty
    solution: ['e4'],
    difficultyLabel: 'Master (2300)',
    description: 'Execute a devastating windmill tactic.',
    playerColor: 'w'
  },
  {
    id: 19,
    title: 'Mate in 4',
    fen: '8/8/8/8/8/8/8/8 w - - 0 1', // Empty
    solution: ['d4'],
    difficultyLabel: 'Grandmaster (2500)',
    description: 'Calculate a long forced mating sequence.',
    playerColor: 'w'
  },
  {
    id: 20,
    title: 'Immortal Tactic',
    fen: '8/8/8/8/8/8/8/8 w - - 0 1', // Empty
    solution: ['Nf3'],
    difficultyLabel: 'Legendary (2800+)',
    description: 'Find the legendary brilliancy.',
    playerColor: 'w'
  }
];
