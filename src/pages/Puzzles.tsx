import { useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { puzzles } from '../data/puzzles';
import Icon from '../assets/Icon.png';

type Color = 'w' | 'b';
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

const PIECE_IMAGES: Record<Color, Record<string, string>> = {
  w: {
    k: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    q: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    r: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    b: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    n: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    p: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  },
  b: {
    k: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    q: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    r: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    b: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    n: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    p: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  },
};

let gPieceCounter = 0;
function initPieceIds(game: Chess): Map<string, string> {
  const m = new Map<string, string>();
  for (const row of game.board()) {
    for (const p of row) {
      if (p) m.set(p.square, `puz${gPieceCounter++}`);
    }
  }
  return m;
}

function applyMoveIds(ids: Map<string, string>, mv: { from: string; to: string; flags: string; color: string }) {
  const fid = ids.get(mv.from);
  if (!fid) return;
  ids.delete(mv.from);
  ids.delete(mv.to);
  ids.set(mv.to, fid);
  const rk = mv.color === 'w' ? '1' : '8';
  if (mv.flags.includes('k')) {
    const rid = ids.get(`h${rk}`);
    if (rid) { ids.delete(`h${rk}`); ids.set(`f${rk}`, rid); }
  } else if (mv.flags.includes('q')) {
    const rid = ids.get(`a${rk}`);
    if (rid) { ids.delete(`a${rk}`); ids.set(`d${rk}`, rid); }
  }
  if (mv.flags.includes('e')) ids.delete(`${mv.to[0]}${mv.from[1]}`);
}

export default function Puzzles() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = puzzles[puzzleIndex];
  
  const gameRef = useRef(new Chess(puzzle.fen));
  const pieceIdsRef = useRef(initPieceIds(gameRef.current));
  
  const [tick, setTick] = useState(0);
  const [selectedSq, setSelectedSq] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  
  const [status, setStatus] = useState<'playing' | 'success' | 'failed'>('playing');
  const [hintSq, setHintSq] = useState<string | null>(null);
  const [moveStep, setMoveStep] = useState(0);

  const loadPuzzle = useCallback((index: number) => {
    setPuzzleIndex(index);
    const newGame = new Chess(puzzles[index].fen);
    gameRef.current = newGame;
    pieceIdsRef.current = initPieceIds(newGame);
    setLastMove(null);
    setSelectedSq(null);
    setLegalTargets([]);
    setStatus('playing');
    setHintSq(null);
    setMoveStep(0);
    setTick(t => t + 1);
  }, []);

  const handleNextPuzzle = () => {
    const randomIdx = Math.floor(Math.random() * puzzles.length);
    loadPuzzle(randomIdx);
  };

  const handleReset = () => {
    loadPuzzle(puzzleIndex);
  };

  const handleHint = () => {
    if (status !== 'playing') return;
    const currentSolutionMove = puzzle.solution[moveStep];
    if (currentSolutionMove) {
       const g = new Chess(gameRef.current.fen());
       const mv = g.move(currentSolutionMove);
       if (mv) {
         setHintSq(mv.from);
         setTimeout(() => setHintSq(null), 2000);
       }
    }
  };

  const executeMove = useCallback((from: string, to: string) => {
    const g = gameRef.current;
    const currentSolutionMove = puzzle.solution[moveStep];
    
    // Find what the correct move object is BEFORE we mutate the game state
    const tempG = new Chess(g.fen());
    let correctMv = null;
    try { correctMv = tempG.move(currentSolutionMove); } catch { /* */ }

    let mv: ReturnType<typeof g.move> | null = null;
    try { mv = g.move({ from, to, promotion: 'q' }); } catch { return; }
    if (!mv) return;

    let isCorrect = false;
    if (correctMv && correctMv.from === mv.from && correctMv.to === mv.to) {
       isCorrect = true;
    }

    if (!isCorrect) {
       // Wrong move
       g.undo(); // revert
       setStatus('failed');
       setTick(t => t + 1);
       setTimeout(() => {
          setStatus(s => s === 'failed' ? 'playing' : s);
          handleReset();
       }, 1000);
       return;
    }

    // Correct move!
    applyMoveIds(pieceIdsRef.current, { from: mv.from, to: mv.to, flags: mv.flags, color: mv.color });
    setLastMove({ from: mv.from, to: mv.to });
    setSelectedSq(null);
    setLegalTargets([]);
    setTick(t => t + 1);
    
    if (moveStep + 1 >= puzzle.solution.length) {
       setStatus('success');
    } else {
       setMoveStep(s => s + 1);
    }
  }, [puzzle, moveStep]);

  const handleSquareClick = useCallback((sq: string) => {
    if (status !== 'playing') return;
    const g = gameRef.current;
    if (g.turn() !== puzzle.playerColor) return;

    const piece = g.get(sq as Parameters<typeof g.get>[0]);
    const isOwn = piece && piece.color === puzzle.playerColor;

    if (!selectedSq) {
      if (!isOwn) return;
      setSelectedSq(sq);
      const mvs = g.moves({ square: sq as Parameters<typeof g.moves>[0]['square'], verbose: true }) as Array<{ to: string }>;
      setLegalTargets(mvs.map(m => m.to));
    } else if (selectedSq === sq) {
      setSelectedSq(null); setLegalTargets([]);
    } else if (legalTargets.includes(sq)) {
      executeMove(selectedSq, sq);
    } else if (isOwn) {
      setSelectedSq(sq);
      const mvs = g.moves({ square: sq as Parameters<typeof g.moves>[0]['square'], verbose: true }) as Array<{ to: string }>;
      setLegalTargets(mvs.map(m => m.to));
    } else {
      setSelectedSq(null); setLegalTargets([]);
    }
  }, [status, puzzle, selectedSq, legalTargets, executeMove]);

  // Pieces & Squares rendering logic
  const boardOrientation = puzzle.playerColor === 'w' ? 'white' : 'black';
  const pieces = useMemo(() => {
    const out: Array<{ id: string; color: Color; type: string; square: string; row: number; col: number }> = [];
    const board = gameRef.current.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          const visualRow = boardOrientation === 'black' ? 7 - r : r;
          const visualCol = boardOrientation === 'black' ? 7 - c : c;
          out.push({
            id: pieceIdsRef.current.get(p.square) ?? p.square,
            color: p.color as Color, type: p.type,
            square: p.square, row: visualRow, col: visualCol,
          });
        }
      }
    }
    return out;
  }, [tick, boardOrientation]);

  const boardSquares = useMemo(() => {
    const sq: Array<{ sq: string; row: number; col: number; isLight: boolean }> = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const boardRow = boardOrientation === 'black' ? 7 - r : r;
        const boardCol = boardOrientation === 'black' ? 7 - c : c;
        sq.push({ sq: `${FILES[boardCol]}${8 - boardRow}`, row: r, col: c, isLight: (r + c) % 2 === 0 });
      }
    }
    return sq;
  }, [boardOrientation]);

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col text-white font-sans overflow-x-hidden">
      <header className="relative w-full h-20 flex items-center justify-between px-6 lg:px-12 border-b border-brand-border/30 z-10 bg-brand-surface/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-semibold tracking-wide">Back to Home</span>
        </Link>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
           <img src={Icon} alt="Logo" className="h-10 w-auto mb-1 opacity-90" />
           <span className="text-xl font-black tracking-widest text-white leading-none">DACHESS</span>
        </div>
        <div className="w-32"></div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-start justify-center max-w-[1200px] w-full mx-auto px-4 py-8 lg:py-16 gap-10 lg:gap-20">
        
        <div className="flex-1 w-full max-w-[600px] flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-4xl lg:text-5xl font-black mb-2 text-white">{puzzle.title}</h1>
            <p className="text-text-secondary font-medium tracking-wide">Puzzle #{puzzle.id}</p>
          </div>
          
          <motion.div 
            className={`w-full aspect-square rounded-xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative transition-colors duration-300 ${status === 'success' ? 'ring-4 ring-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)]' : status === 'failed' ? 'ring-4 ring-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'ring-1 ring-brand-border'}`}
            animate={status === 'failed' ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
              {boardSquares.map(({ sq, row, col, isLight }) => {
                const isFrom = lastMove?.from === sq;
                const isTo = lastMove?.to === sq;
                const isSel = selectedSq === sq;
                const isHint = hintSq === sq;
                let bg = isLight ? '#e0e0e0' : '#4a4a4a';
                if (isFrom || isTo) bg = isLight ? '#fcd34d' : '#d4af37';
                if (isHint) bg = isLight ? '#FDE68A' : '#D97706';
                const selClasses = isSel ? 'ring-inset ring-[3px] ring-[#fcd34d] shadow-[inset_0_0_20px_rgba(252,211,77,0.7)] z-10 bg-brand-accent/40 mix-blend-screen' : '';
                return (
                  <div key={sq} style={{ background: bg }} className={`relative cursor-pointer select-none ${isTo ? 'z-10' : ''} ${selClasses}`} onClick={() => handleSquareClick(sq)}>
                    {col === 0 && <span className="absolute top-0.5 left-0.5 leading-none font-bold select-none pointer-events-none" style={{ color: isLight ? '#4a4a4a' : '#e0e0e0', fontSize: '0.6rem' }}>{boardOrientation === 'black' ? row + 1 : 8 - row}</span>}
                    {row === 7 && <span className="absolute bottom-0.5 right-0.5 leading-none font-bold select-none pointer-events-none" style={{ color: isLight ? '#4a4a4a' : '#e0e0e0', fontSize: '0.6rem' }}>{boardOrientation === 'black' ? FILES[7 - col] : FILES[col]}</span>}
                  </div>
                );
              })}
            </div>
            <LayoutGroup id="puz-board">
              <AnimatePresence>
                {pieces.map(p => (
                  <motion.div key={p.id} layoutId={p.id} layout className="absolute flex items-center justify-center pointer-events-none select-none z-10" style={{ width: '12.5%', height: '12.5%', left: `${p.col * 12.5}%`, top: `${p.row * 12.5}%` }} transition={{ layout: { type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }}}>
                      <img src={PIECE_IMAGES[p.color][p.type]} alt="" className="w-[90%] h-[90%] object-contain drop-shadow-md" style={{ filter: selectedSq === p.square ? 'drop-shadow(0 0 8px rgba(252,211,77,0.85))' : 'none', transition: 'filter 0.15s ease' }} />
                    </motion.div>
                ))}
              </AnimatePresence>
            </LayoutGroup>
            {legalTargets.length > 0 && (
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 pointer-events-none z-20">
                {boardSquares.map(({ sq }) => {
                  const isLegal = legalTargets.includes(sq);
                  if (!isLegal) return <div key={sq} />;
                  const pHere = gameRef.current.get(sq as Parameters<typeof gameRef.current.get>[0]);
                  const isCapture = pHere && pHere.color !== puzzle.playerColor;
                  return (
                    <div key={sq} className="relative">
                      {isCapture ? <div className="absolute inset-[3px] rounded-full border-[4px] border-[#d4af37]/70 shadow-[inset_0_0_6px_rgba(212,175,55,0.3)]" /> : <div className="absolute inset-0 flex items-center justify-center"><div className="rounded-full animate-pulse" style={{ width: '32%', height: '32%', backgroundColor: 'rgba(212, 175, 55, 0.8)', boxShadow: '0 0 10px 2px rgba(212,175,55,0.6)' }} /></div>}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
          
          <div className="w-full flex items-center justify-center gap-4 mt-8">
            <h2 className={`text-xl font-bold mr-4 transition-colors duration-300 ${status === 'success' ? 'text-green-400' : status === 'failed' ? 'text-red-400' : 'text-white'}`}>
               {status === 'success' ? 'Puzzle Solved!' : status === 'failed' ? 'Incorrect Move' : `${puzzle.playerColor === 'w' ? 'White' : 'Black'} to Move`}
            </h2>
            <button onClick={handleHint} disabled={status !== 'playing'} className="px-6 py-2.5 rounded-lg border border-brand-border hover:bg-brand-surface text-text-secondary hover:text-white transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Hint</button>
            <button onClick={handleReset} className="px-6 py-2.5 rounded-lg border border-brand-border hover:bg-brand-surface text-text-secondary hover:text-white transition-all font-semibold cursor-pointer">Reset</button>
            <button onClick={handleNextPuzzle} className="px-8 py-2.5 rounded-lg bg-brand-accent text-brand-navy hover:bg-brand-accent-light shadow-[0_4px_15px_rgba(212,175,55,0.4)] transition-all font-bold cursor-pointer hover:scale-105 active:scale-95">Next Puzzle</button>
          </div>
        </div>
        
        <motion.div 
          key={puzzle.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[350px] flex flex-col pt-4 lg:pt-24"
        >
          <h2 className="text-3xl font-black mb-2 text-white">{puzzle.title}</h2>
          <div className="flex items-center gap-2 mb-8 text-sm">
            <span className="text-text-secondary">Difficulty:</span>
            <span className="font-bold text-white px-3 py-1 bg-white/10 rounded-full border border-white/20">{puzzle.difficultyLabel}</span>
          </div>
          
          <hr className="border-brand-border mb-8" />
          
          <div className="flex flex-col gap-6 text-text-secondary text-[15px] leading-relaxed bg-brand-surface p-6 rounded-2xl border border-white/5 shadow-inner">
            <p>{puzzle.description}</p>
            <div className="flex items-center gap-3">
               <div className={`w-4 h-4 rounded-full ${puzzle.playerColor === 'w' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-black border border-white/30 shadow-[0_0_10px_rgba(0,0,0,0.5)]'}`} />
               <p className="font-bold text-white text-lg">{puzzle.playerColor === 'w' ? 'White' : 'Black'} to move.</p>
            </div>
            <p className="text-sm opacity-80">Incorrect moves will display an error and automatically reset the puzzle.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
