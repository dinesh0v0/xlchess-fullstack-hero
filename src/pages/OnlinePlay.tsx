import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess, Move } from 'chess.js';
import type { Square } from 'chess.js';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import Icon from '../assets/Icon.png';
import KingIcon from '../assets/King_Icon.png';
import { gameRoomService } from '../services/gameRoom';

/* ─── Types & Constants ──────────────────────────── */

type Color = 'w' | 'b';
type RoomState = 'idle' | 'creating' | 'waiting' | 'joining' | 'connected';
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

interface MatchHistoryItem {
  id: string;
  date: string;
  result: 'Won' | 'Lost' | 'Draw';
  playedAs: 'White' | 'Black';
  pgn: string;
}

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

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const SOUND_URLS = {
  move: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
  capture: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
  check: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
  start: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-start.mp3',
  end: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3'
};

/* ─── Main Component ─────────────────────────────── */

export default function OnlinePlay() {
  /* ── Core Match State ──────────────────── */
  const [matchState, setMatchState] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
  const [myColor, setMyColor] = useState<'white' | 'black'>('white');
  const [matchTimeControl, setMatchTimeControl] = useState<number>(3);
  const navigate = useNavigate();
  const [opponentOnline, setOpponentOnline] = useState(false);

  // Timers (in milliseconds)
  const [timers, setTimers] = useState<{ w: number; b: number }>({ w: 3 * 60000, b: 3 * 60000 });
  const syncedTimersRef = useRef<{ w: number; b: number }>({ w: 3 * 60000, b: 3 * 60000 });
  const lastMoveTimestampRef = useRef<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{ onConfirm: () => void; onCancel?: () => void } | null>(null);

  // Board State
  const gameRef = useRef(new Chess());
  const [triggerRender, setTriggerRender] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [moveLog, setMoveLog] = useState<Array<{ w: string; b: string }>>([]);
  const [lastMove, setLastMove] = useState<{ from: string, to: string } | null>(null);
  const pieceIdMapRef = useRef<Record<string, string>>({});

  // Game Over Details
  const [gameOverDetails, setGameOverDetails] = useState<{ winner: 'white' | 'black' | 'draw' | null, reason: string } | null>(null);
  const [hideGameOverModal, setHideGameOverModal] = useState(false);
  const [drawOffer, setDrawOffer] = useState<'white' | 'black' | null>(null);
  const [analysisStack, setAnalysisStack] = useState<Move[]>([]);

  // Import State
  const [isImportedGame, setIsImportedGame] = useState(false);
  const [boardFlipped, setBoardFlipped] = useState(false);

  // Sound
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  /* ── Modal & Room State ────────────────── */
  const [activeModal, setActiveModal] = useState<'play' | 'history' | null>(null);
  const [importExpanded, setImportExpanded] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const lastSavedMatchIdRef = useRef<string | null>(null);

  const [playTab, setPlayTab] = useState<'create' | 'join'>('create');
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');
  const [timeControl, setTimeControl] = useState<number>(3);

  const [roomState, setRoomState] = useState<RoomState>('idle');
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState(['', '', '', '']);
  const joinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [pgnText, setPgnText] = useState('');
  const [pgnError, setPgnError] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'chat' | 'moves'>('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; sender: 'you' | 'enemy' }>>([]);
  const firebaseMovesRef = useRef<Array<{ san: string; from: string; to: string; color: 'w' | 'b'; timestamp: number }>>([]);

  useEffect(() => {
    document.title = 'Online Play | DAChess';
    // Preload sounds
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRefs.current[key] = audio;
    });
    
    // Load history
    const storedHistory = localStorage.getItem('dachess_match_history');
    if (storedHistory) {
      try { setMatchHistory(JSON.parse(storedHistory)); } catch { }
    }

    return () => { document.title = 'DAChess | Premium Online Chess Platform'; };
  }, []);

  const playSound = useCallback((type: keyof typeof SOUND_URLS) => {
    if (isMuted) return;
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => { }); // Catch browser auto-play restrictions
    }
  }, [isMuted]);

  const updatePieceMap = useCallback((from: string, to: string, san: string) => {
    const newMap = { ...pieceIdMapRef.current };
    const id = newMap[from];
    delete newMap[from];
    if (id) newMap[to] = id;
    
    // Handle castling rook movement
    if (san === 'O-O') {
      if (to === 'g1') { newMap['f1'] = newMap['h1']; delete newMap['h1']; }
      else if (to === 'g8') { newMap['f8'] = newMap['h8']; delete newMap['h8']; }
    } else if (san === 'O-O-O') {
      if (to === 'c1') { newMap['d1'] = newMap['a1']; delete newMap['a1']; }
      else if (to === 'c8') { newMap['d8'] = newMap['a8']; delete newMap['a8']; }
    }
    
    pieceIdMapRef.current = newMap;
  }, []);

  const formatTime = (ms: number) => {
    const totalDeciSeconds = Math.max(0, Math.floor(ms / 100));
    const minutes = Math.floor(totalDeciSeconds / 600);
    const seconds = Math.floor((totalDeciSeconds % 600) / 10);
    const fraction = totalDeciSeconds % 10;

    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${mm}:${ss}.${fraction}`;
  };

  /* ── Navigation Safety & Presence Setup ──────────────── */
  useEffect(() => {
    if (matchState === 'playing' && generatedCode) {
      // Setup presence for ourselves
      gameRoomService.setupPresence(generatedCode, myColor);
      
      // Setup history block
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = () => {
        setConfirmModalConfig({
          onConfirm: () => {
            if (generatedCode) gameRoomService.endGame(generatedCode, myColor === 'white' ? 'black' : 'white', 'Resignation');
            navigate('/');
            setConfirmModalConfig(null);
          },
          onCancel: () => {
            window.history.pushState(null, '', window.location.href);
            setConfirmModalConfig(null);
          }
        });
      };
      
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      
      window.addEventListener('popstate', handlePopState);
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [matchState, generatedCode, myColor, navigate]);

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (matchState === 'playing') {
      setConfirmModalConfig({
        onConfirm: () => {
          if (generatedCode) gameRoomService.endGame(generatedCode, myColor === 'white' ? 'black' : 'white', 'Resignation');
          navigate('/');
          setConfirmModalConfig(null);
        },
        onCancel: () => {
          setConfirmModalConfig(null);
        }
      });
    } else {
      navigate('/');
    }
  };

  /* ── Timer & Timeout Logic ──────────────────── */
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (matchState === 'playing' && isTimerRunning && !gameRef.current.isGameOver()) {
      interval = setInterval(() => {
        setTimers(prev => {
          if (!lastMoveTimestampRef.current) return prev;
          
          const currentTurn = gameRef.current.turn() as 'w' | 'b';
          const elapsed = Date.now() - lastMoveTimestampRef.current;
          const baseTime = syncedTimersRef.current[currentTurn];
          const nextTime = Math.max(0, baseTime - elapsed);

          if (nextTime <= 0) {
            // Timer ran out!
            setIsTimerRunning(false);
            if (generatedCode) {
              const winner = currentTurn === 'w' ? 'black' : 'white';
              gameRoomService.endGame(generatedCode, winner, 'Timeout');
            }
            return { ...syncedTimersRef.current, [currentTurn]: 0 };
          }

          return { ...syncedTimersRef.current, [currentTurn]: nextTime };
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [matchState, isTimerRunning, generatedCode]);

  /* ── Start Match ─────────────────────── */
  const startGame = useCallback((color: 'white' | 'black', tcMinutes: number, fen?: string) => {
    if (fen) gameRef.current.load(fen);
    else gameRef.current.reset();

    setTriggerRender(prev => prev + 1);
    setMyColor(color);
    setMatchTimeControl(tcMinutes);
    setTimers({ w: tcMinutes * 60000, b: tcMinutes * 60000 });
    syncedTimersRef.current = { w: tcMinutes * 60000, b: tcMinutes * 60000 };
    lastMoveTimestampRef.current = null;
    setMatchState('playing');
    setIsTimerRunning(true);
    setMoveLog([]);
    setChatMessages([]);
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setGameOverDetails(null);
    setHideGameOverModal(false);
    setDrawOffer(null);
    setActiveModal(null);
    setRoomState('idle');
  }, []);

  /* ── Firebase Room Listener ──────────────────── */
  useEffect(() => {
    if (!generatedCode) return;

    const unsubscribe = gameRoomService.listenToRoom(generatedCode, (roomData) => {
      if (!roomData) {
        if (matchState === 'playing') {
          setMatchState('lobby');
          setIsTimerRunning(false);
          setNetworkError("Opponent left the room.");
        }
        return;
      }

      if (roomState === 'waiting' && roomData.players === 2) {
        setRoomState('connected');
        setTimeout(() => {
          startGame(roomData.hostColor, roomData.timeControl, roomData.fen);
          playSound('start');
        }, 600);
      }
      
      if (roomData.timers) {
        syncedTimersRef.current = roomData.timers;
        setTimers(roomData.timers);
      }
      if (roomData.lastMoveTimestamp) {
        lastMoveTimestampRef.current = roomData.lastMoveTimestamp;
      }
      
      if (roomData.presence) {
        const enemyColor = myColor === 'white' ? 'black' : 'white';
        setOpponentOnline(!!roomData.presence[enemyColor]);
      } else {
        setOpponentOnline(false);
      }

      // Store Firebase moves for later replay (used by Review Board)
      if (roomData.moves) {
        const moves = Object.values(roomData.moves).sort((a, b) => a.timestamp - b.timestamp);
        firebaseMovesRef.current = moves;

        if (matchState === 'playing') {
          if (roomData.fen && roomData.fen !== gameRef.current.fen()) {
            try {
              const prevTurn = gameRef.current.turn();
              // Replay all moves to preserve history for analysis
              const newChess = new Chess();
              for (const m of moves) {
                newChess.move(m.san);
              }
              gameRef.current = newChess;
              const currentTurn = gameRef.current.turn();

              // Play sound if opponent moved
              if (prevTurn !== currentTurn && currentTurn === (myColor === 'white' ? 'w' : 'b')) {
                const lastMoveObj = moves[moves.length - 1];
                updatePieceMap(lastMoveObj.from, lastMoveObj.to, lastMoveObj.san);
                setLastMove({ from: lastMoveObj.from, to: lastMoveObj.to });

                if (gameRef.current.inCheck()) playSound('check');
                else if (lastMoveObj.san.includes('x')) playSound('capture');
                else playSound('move');
              }
              setTriggerRender(prev => prev + 1);
            } catch { }
          }

          const newMoveLog: Array<{ w: string; b: string }> = [];
          for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            if (move.color === 'w') {
              newMoveLog.push({ w: move.san, b: '' });
            } else {
              if (newMoveLog.length > 0) newMoveLog[newMoveLog.length - 1].b = move.san;
              else newMoveLog.push({ w: '', b: move.san });
            }
          }
          setMoveLog(newMoveLog);
        }
      }

      if (roomData.chat) {
        const chats = Object.values(roomData.chat).sort((a, b) => a.timestamp - b.timestamp);
        setChatMessages(chats.map(c => ({
          text: c.text,
          sender: c.sender === myColor ? 'you' : 'enemy'
        })));
      }
      
      if (roomData.drawOffer) {
        setDrawOffer(roomData.drawOffer);
      } else {
        setDrawOffer(null);
      }

      if (roomData.status === 'finished') {
        setIsTimerRunning(false);
        if (matchState !== 'gameover') {
            setMatchState('gameover');
            setGameOverDetails({ winner: roomData.winner || 'draw', reason: roomData.reason || 'Unknown' });
            playSound('end');
            
            // Save to match history if not saved yet
            if (lastSavedMatchIdRef.current !== roomData.fen) {
                lastSavedMatchIdRef.current = roomData.fen || 'empty';
                const result = roomData.winner === 'draw' ? 'Draw' : (roomData.winner === myColor ? 'Won' : 'Lost');
                const historyItem: MatchHistoryItem = {
                    id: Date.now().toString(),
                    date: new Date().toLocaleDateString(),
                    result,
                    playedAs: myColor === 'white' ? 'White' : 'Black',
                    pgn: gameRef.current.pgn()
                };
                setMatchHistory(prev => {
                    const next = [historyItem, ...prev];
                    localStorage.setItem('dachess_match_history', JSON.stringify(next));
                    return next;
                });
            }
        }
      }
    });

    return () => unsubscribe();
  }, [generatedCode, roomState, matchState, myColor, playSound, startGame, updatePieceMap]);

  /* ── Checkmate & Draw Handlers ─────────────────── */
  const checkGameEndConditions = useCallback(async () => {
    if (!generatedCode) return;
    const chess = gameRef.current;
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'black' : 'white';
      await gameRoomService.endGame(generatedCode, winner, 'Checkmate');
    } else if (chess.isDraw()) {
      let reason = 'Draw';
      if (chess.isStalemate()) reason = 'Stalemate';
      else if (chess.isThreefoldRepetition()) reason = 'Threefold Repetition';
      else if (chess.isInsufficientMaterial()) reason = 'Insufficient Material';
      await gameRoomService.endGame(generatedCode, 'draw', reason);
    }
  }, [generatedCode]);

  /* ── Make Move Logic ─────────────────── */
  const makeMove = useCallback(async (moveStr: string | { from: string; to: string; promotion?: string }) => {
    try {
      const result = gameRef.current.move(moveStr);
      if (result) {
        updatePieceMap(result.from, result.to, result.san);
        setTriggerRender(prev => prev + 1);
        setSelectedSquare(null);
        setValidMoves([]);
        setLastMove({ from: result.from, to: result.to });

        if (gameRef.current.isCheckmate()) playSound('end');
        else if (gameRef.current.inCheck()) playSound('check');
        else if (result.captured) playSound('capture');
        else playSound('move');

        checkGameEndConditions();

        if (generatedCode) {
          const currentTurn = result.color;
          let elapsed = 0;
          if (lastMoveTimestampRef.current) {
            elapsed = Date.now() - lastMoveTimestampRef.current;
          }
          
          const newTimers = {
            ...syncedTimersRef.current,
            [currentTurn]: Math.max(0, syncedTimersRef.current[currentTurn] - elapsed)
          };
          
          syncedTimersRef.current = newTimers;
          
          await gameRoomService.sendMove(generatedCode, {
            from: result.from,
            to: result.to,
            san: result.san,
            color: result.color as 'w' | 'b',
            timestamp: Date.now()
          }, gameRef.current.fen(), newTimers);
        }
      }
    } catch (e) {
      console.warn("Invalid move attempted", e);
    }
  }, [generatedCode, playSound, checkGameEndConditions, updatePieceMap]);

  const handleSquareClick = useCallback((square: string) => {
    if (matchState !== 'playing' || !isTimerRunning) return;

    const turn = gameRef.current.turn();
    const myColorShort = myColor === 'white' ? 'w' : 'b';

    if (turn !== myColorShort) return;

    const piece = gameRef.current.get(square as Square);
    const move = validMoves.find(m => m.to === square);

    if (move) {
      makeMove({ from: move.from, to: move.to, promotion: 'q' });
      return;
    }

    if (piece && piece.color === myColorShort) {
      setSelectedSquare(square);
      setValidMoves(gameRef.current.moves({ square: square as Square, verbose: true }) as Move[]);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [matchState, isTimerRunning, myColor, validMoves, makeMove]);

  /* ── Room Creation Flow ──────────────── */
  const handleCreateRoom = useCallback(async () => {
    if (roomState !== 'idle') return;
    setRoomState('creating');
    setNetworkError(null);
    try {
      let code: string;
      let exists = true;
      do {
        code = String(Math.floor(1000 + Math.random() * 9000));
        exists = await gameRoomService.checkRoomExists(code);
      } while (exists);
      await gameRoomService.createRoom(code, timeControl, selectedColor);
      setGeneratedCode(code);
      setRoomState('waiting');
    } catch {
      setNetworkError("Connection error. Please try again.");
      setRoomState('idle');
    }
  }, [selectedColor, timeControl, roomState]);

  const cancelRoom = useCallback(async () => {
    if (generatedCode) await gameRoomService.deleteRoom(generatedCode);
    setRoomState('idle');
    setGeneratedCode(null);
  }, [generatedCode]);

  /* ── Room Joining Flow ───────────────── */
  const handleJoinRoom = useCallback(async (overrideCode?: string | React.MouseEvent) => {
    if (roomState === 'joining' || roomState === 'connected') return;
    const code = typeof overrideCode === 'string' ? overrideCode : joinCode.join('');
    if (code.length !== 4) return;
    setRoomState('joining');
    setNetworkError(null);
    try {
      const result = await gameRoomService.joinRoom(code);
      if (!result.success) {
        setNetworkError(result.error || 'Failed to join room');
        setRoomState('idle');
        return;
      }
      setGeneratedCode(code);
      setRoomState('connected');

      await new Promise(res => setTimeout(res, 600));
      const joinerColor = result.hostColor === 'white' ? 'black' : 'white';
      startGame(joinerColor, timeControl, result.fen);
      playSound('start');
    } catch {
      setNetworkError("Connection error. Please try again.");
      setRoomState('idle');
    }
  }, [joinCode, timeControl, startGame, playSound, roomState]);

  const handleJoinCodeChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;
    
    const nextCode = [...joinCode];
    nextCode[index] = value;
    setJoinCode(nextCode);
    setNetworkError(null);

    if (value && index < 3) {
      joinInputRefs.current[index + 1]?.focus();
    } else if (!nextCode.some(d => !d) && roomState === 'idle') {
      handleJoinRoom(nextCode.join(''));
    }
  }, [joinCode, roomState, handleJoinRoom]);

  const handleJoinCodePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const digits = pasted.split('');
    const nextCode = [...joinCode];
    digits.forEach((d, i) => { nextCode[i] = d; });
    
    setJoinCode(nextCode);
    setNetworkError(null);
    if (digits.length > 0) joinInputRefs.current[Math.min(digits.length, 3)]?.focus();

    if (!nextCode.some(d => !d) && roomState === 'idle') {
      handleJoinRoom(nextCode.join(''));
    }
  }, [joinCode, roomState, handleJoinRoom]);

  const handleJoinCodeKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !joinCode[index] && index > 0) joinInputRefs.current[index - 1]?.focus();
    if (e.key === 'Enter' && !joinCode.some(d => !d) && roomState === 'idle') handleJoinRoom();
  }, [joinCode, roomState, handleJoinRoom]);

  const handleChatSend = useCallback(async () => {
    if (!chatMessage.trim() || !generatedCode) return;
    await gameRoomService.sendChat(generatedCode, { text: chatMessage.trim(), sender: myColor });
    setChatMessage('');
  }, [chatMessage, generatedCode, myColor]);

  const openPlayModal = useCallback(() => {
    setActiveModal('play');
    setPlayTab('create');
    setRoomState('idle');
    setNetworkError(null);
    setGeneratedCode(null);
    setSelectedColor('white');
    setTimeControl(3);
    setJoinCode(['', '', '', '']);
    setAnalysisStack([]);
  }, []);

  const closeModal = useCallback(() => {
    if (roomState === 'waiting') cancelRoom();
    setActiveModal(null);
    setRoomState('idle');
    setNetworkError(null);
    setGeneratedCode(null);
    setJoinCode(['', '', '', '']);
    setPgnError(null);
  }, [roomState, cancelRoom]);

  const handleResign = useCallback(async () => {
    if (generatedCode) {
      await gameRoomService.resignGame(generatedCode, myColor);
    }
  }, [generatedCode, myColor]);

  const handleDraw = useCallback(async () => {
    if (generatedCode) {
      await gameRoomService.offerDraw(generatedCode, myColor);
    }
  }, [generatedCode, myColor]);

  const exitGameToLobby = useCallback(async () => {
    if (generatedCode) await gameRoomService.deleteRoom(generatedCode);
    setMatchState('lobby');
    setGameOverDetails(null);
    setDrawOffer(null);
    setGeneratedCode(null);
    gameRef.current.reset();
    setMoveLog([]);
    setChatMessages([]);
    setAnalysisStack([]);
    setTriggerRender(prev => prev + 1);
    setIsImportedGame(false);
    setBoardFlipped(false);
  }, [generatedCode]);

  const syncBoardVisuals = useCallback((stack: Move[]) => {
    const history = gameRef.current.history({ verbose: true }) as Move[];
    const fullHistory = [...history, ...stack];
    const newMoveLog: Array<{ w: string; b: string }> = [];
    for (let i = 0; i < fullHistory.length; i++) {
      if (fullHistory[i].color === 'w') {
        newMoveLog.push({ w: fullHistory[i].san, b: '' });
      } else {
        if (newMoveLog.length > 0) newMoveLog[newMoveLog.length - 1].b = fullHistory[i].san;
      }
    }
    setMoveLog(newMoveLog);

    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
    setTriggerRender(p => p + 1);
  }, []);

  const reverseUpdatePieceMap = useCallback((move: Move) => {
    const newMap = { ...pieceIdMapRef.current };
    const id = newMap[move.to];
    delete newMap[move.to];
    if (id) newMap[move.from] = id;
    
    // Handle castling rook reverse movement
    if (move.san === 'O-O') {
      if (move.to === 'g1') { newMap['h1'] = newMap['f1']; delete newMap['f1']; }
      else if (move.to === 'g8') { newMap['h8'] = newMap['f8']; delete newMap['f8']; }
    } else if (move.san === 'O-O-O') {
      if (move.to === 'c1') { newMap['a1'] = newMap['d1']; delete newMap['d1']; }
      else if (move.to === 'c8') { newMap['a8'] = newMap['d8']; delete newMap['d8']; }
    }
    
    pieceIdMapRef.current = newMap;
  }, []);

  const handlePrevMove = useCallback(() => {
    const move = gameRef.current.undo();
    if (move) {
      const nextStack = [move, ...analysisStack];
      setAnalysisStack(nextStack);
      reverseUpdatePieceMap(move);
      syncBoardVisuals(nextStack);
    }
  }, [analysisStack, reverseUpdatePieceMap, syncBoardVisuals]);

  const handleNextMove = useCallback(() => {
    if (analysisStack.length > 0) {
      const move = analysisStack[0];
      gameRef.current.move(move);
      const nextStack = analysisStack.slice(1);
      setAnalysisStack(nextStack);
      updatePieceMap(move.from, move.to, move.san);
      syncBoardVisuals(nextStack);
    }
  }, [analysisStack, updatePieceMap, syncBoardVisuals]);

  const handleImportGame = useCallback(() => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgnText);
      gameRef.current = chess;
      
      const history = chess.history({ verbose: true }) as Move[];
      const newMoveLog: Array<{ w: string; b: string }> = [];
      
      // Rebuild pieceIdMapRef from final position
      pieceIdMapRef.current = {};
      const board = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p) {
            pieceIdMapRef.current[p.square] = `${p.color}-${p.type}-${p.square}-${Math.random()}`;
          }
        }
      }
      
      for (let i = 0; i < history.length; i++) {
        if (history[i].color === 'w') {
          newMoveLog.push({ w: history[i].san, b: '' });
        } else {
          if (newMoveLog.length > 0) newMoveLog[newMoveLog.length - 1].b = history[i].san;
        }
      }
      setMoveLog(newMoveLog);
      setAnalysisStack([]);
      setLastMove(null);
      
      setMatchState('lobby');
      setLeftTab('moves');
      setImportExpanded(false);
      setPgnText('');
      setPgnError(null);
      setIsImportedGame(true);
      setTriggerRender(prev => prev + 1);
    } catch {
      setPgnError("Invalid PGN format. Please check the text.");
    }
  }, [pgnText]);

  /* ── Board & Logic (memoised) ─────────── */
  const boardOrientation = (matchState === 'playing' || matchState === 'gameover') ? myColor : (boardFlipped ? 'black' : 'white');
  const boardSquares = useMemo(() => {
    const sq: Array<{ sq: string; row: number; col: number; isLight: boolean }> = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const rank = boardOrientation === 'white' ? 8 - r : r + 1;
        const fileIdx = boardOrientation === 'white' ? c : 7 - c;
        sq.push({ sq: `${FILES[fileIdx]}${rank}`, row: r, col: c, isLight: (r + c) % 2 === 0 });
      }
    }
    return sq;
  }, [boardOrientation]);

  // Derived Board State
  const boardState = useMemo(() => {
    const out: Array<{ id: string; color: Color; type: string; square: string; row: number; col: number }> = [];
    const board = gameRef.current.board();

    // Material Advantage Calculation
    const counts = { w: 0, b: 0 };
    const piecesMap = { w: [] as string[], b: [] as string[] };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          let id = pieceIdMapRef.current[p.square];
          if (!id) {
            id = `${p.color}-${p.type}-${p.square}-${Math.random()}`;
            pieceIdMapRef.current[p.square] = id;
          }

          const visualRow = boardOrientation === 'white' ? r : 7 - r;
          const visualCol = boardOrientation === 'white' ? c : 7 - c;
          out.push({ id, color: p.color as Color, type: p.type, square: p.square, row: visualRow, col: visualCol });

          counts[p.color] += PIECE_VALUES[p.type] || 0;
          piecesMap[p.color].push(p.type);
        }
      }
    }

    // Captured pieces calculation (compared to starting 16 pieces)
    const initialCounts = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    const captured = { w: [] as string[], b: [] as string[] };

    const countOccurrences = (arr: string[], val: string) => arr.filter(v => v === val).length;

    Object.keys(initialCounts).forEach(type => {
      const wMissing = initialCounts[type as keyof typeof initialCounts] - countOccurrences(piecesMap.w, type);
      const bMissing = initialCounts[type as keyof typeof initialCounts] - countOccurrences(piecesMap.b, type);
      for (let i = 0; i < wMissing; i++) captured.w.push(type);
      for (let i = 0; i < bMissing; i++) captured.b.push(type);
    });

    // Check square
    let checkSquare = null;
    if (gameRef.current.inCheck()) {
      const king = out.find(p => p.type === 'k' && p.color === gameRef.current.turn());
      if (king) checkSquare = king.square;
    }

    return {
      pieces: out,
      material: { w: Math.max(0, counts.w - counts.b), b: Math.max(0, counts.b - counts.w) },
      captured,
      checkSquare
    };
  // triggerRender forces this memo to recompute when gameRef.current mutates (refs don't trigger re-renders)
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRender, boardOrientation]);

  const year = new Date().getFullYear();
  const currentTurn = gameRef.current.turn();
  const myColorShort = myColor === 'white' ? 'w' : 'b';
  const enemyColorShort = myColor === 'white' ? 'b' : 'w';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmModalConfig) {
          confirmModalConfig.onCancel?.();
        } else if (activeModal) {
          closeModal();
        } else if (importExpanded) {
          setImportExpanded(false);
        }
      } else if (e.key === 'Enter') {
        if (activeModal === 'play' && playTab === 'create' && roomState === 'idle') {
          handleCreateRoom();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModalConfig, activeModal, closeModal, importExpanded, playTab, roomState, handleCreateRoom]);

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col text-white font-sans overflow-x-hidden">
      <header className="relative w-full h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-12 border-b border-brand-border/30 z-10 bg-brand-surface/80 backdrop-blur-md shrink-0">
        <a href="/" onClick={handleBackToHome} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors cursor-pointer group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-semibold tracking-wide">Back to Home</span>
        </a>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <img src={Icon} alt="Logo" className="h-8 sm:h-10 w-auto mb-0.5 sm:mb-1 opacity-90" />
          <span className="text-lg sm:text-xl font-black tracking-widest text-white leading-none">DACHESS</span>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center gap-4 w-32 justify-end">
          <button onClick={() => setIsMuted(!isMuted)} className="text-text-secondary hover:text-brand-accent transition-colors">
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex flex-col lg:flex-row w-full max-w-[1300px] mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-10 gap-4 lg:gap-6 flex-1 items-start">
          <motion.div className="w-full lg:w-[300px] shrink-0 flex flex-col order-3 lg:order-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <AnimatePresence mode="wait">
              {matchState === 'lobby' ? (
                <motion.div key="lobby-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-brand-surface rounded-t-2xl p-4 sm:p-5 border border-brand-border/30 border-b-0">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={KingIcon} alt="Chess" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover" />
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">Welcome to DaChess</h2>
                      <p className="text-sm text-green-400 font-medium">Get ready, and have fun!</p>
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-white leading-tight mb-4">Gear up,<br />Let&apos;s start a game</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <p className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">You</p>
                      <p className="text-2xl font-black text-white font-mono tracking-widest">-- : --</p>
                    </div>
                    <div className="w-px h-10 bg-brand-border/50" />
                    <div className="flex-1 text-center">
                      <p className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Enemy</p>
                      <p className="text-2xl font-black text-white font-mono tracking-widest">-- : --</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="match-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-brand-surface rounded-t-2xl p-5 border border-brand-border/30 border-b-0 relative overflow-hidden">
                  {currentTurn === myColorShort && matchState === 'playing' && (
                    <div className="absolute inset-0 bg-brand-accent/5 pointer-events-none animate-pulse" />
                  )}
                  <div className="flex items-start gap-3 mb-4 relative z-10">
                    <img src={KingIcon} alt="Chess" className="w-10 h-10 rounded-lg object-cover bg-white" />
                    <div>
                      <h2 className="text-[1.05rem] font-bold text-white leading-tight">{matchTimeControl} Minutes Game</h2>
                      <p className="text-xs text-brand-accent/80 font-medium mt-0.5">Move {Math.floor(gameRef.current.history().length / 2) + 1} | You as {myColor === 'white' ? 'White' : 'Black'}</p>
                    </div>
                  </div>
                  <p className="text-[1.35rem] font-black text-white leading-tight mb-5 mt-2 relative z-10">
                    {matchState === 'gameover' ? (
                      <><span className="text-brand-accent">Game Over</span><br /><span className="text-text-secondary text-base">{gameOverDetails?.reason}</span></>
                    ) : currentTurn === myColorShort ? (
                      <>Your Turn,<br />Make a Move!</>
                    ) : (
                      <>Enemy's Turn,<br /><span className="text-text-secondary">Waiting for network...</span></>
                    )}
                  </p>
                  <div className="flex items-center justify-between bg-black/30 rounded-xl p-3 relative z-10">
                    <div className="flex-1 text-center">
                      <p className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">You</p>
                      <p className={`text-2xl font-black font-mono tracking-widest ${currentTurn === myColorShort && matchState === 'playing' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-white/40'}`}>
                        {formatTime(timers[myColorShort])}
                      </p>
                    </div>
                    <div className="flex-1 text-center border-l border-brand-border/30 pl-3">
                      <p className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Enemy</p>
                      <p className={`text-2xl font-black font-mono tracking-widest ${currentTurn !== myColorShort && matchState === 'playing' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-white/40'}`}>
                        {formatTime(timers[enemyColorShort])}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex border-x border-brand-border/30 bg-brand-surface relative z-10">
              {(['chat', 'moves'] as const).map(tab => (
                <button key={tab} onClick={() => setLeftTab(tab)} className={`flex-1 py-3 text-sm font-bold transition-all cursor-pointer border-b-2 ${leftTab === tab ? 'text-white border-brand-accent' : 'text-text-secondary hover:text-white border-transparent'}`}>
                  {tab === 'chat' ? 'Chat Room' : 'Move History'}
                </button>
              ))}
            </div>

            <div className="bg-brand-surface border-x border-brand-border/30 flex-1 min-h-[160px] max-h-[220px] sm:max-h-[280px] lg:max-h-[300px] overflow-y-auto flex flex-col relative z-10 custom-scrollbar">
              <AnimatePresence mode="wait">
                {leftTab === 'chat' ? (
                  <motion.div key="chat-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-4 gap-2">
                    {chatMessages.length === 0 ? (
                      <p className="text-text-secondary text-sm leading-relaxed">{matchState !== 'lobby' ? "Say hello to your opponent!" : "Start a conversation with your opponent."}</p>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className="mb-1">
                          {matchState !== 'lobby' ? (
                            msg.sender === 'you' ? (
                              <p className="text-sm pl-2 border-l-2 border-brand-accent text-white py-0.5"><span className="text-text-secondary">You : </span>{msg.text}</p>
                            ) : (
                              <p className="text-sm text-white py-0.5"><span className="text-text-secondary">Enemy : </span>{msg.text}</p>
                            )
                          ) : (
                            <div className="flex justify-end"><span className="bg-brand-accent/20 text-white text-sm px-3 py-1.5 rounded-xl rounded-br-sm max-w-[80%]">{msg.text}</span></div>
                          )}
                        </div>
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="moves-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-3 font-mono text-sm">
                    {moveLog.length === 0 ? (
                      <div className="h-full flex items-center justify-center"><p className="text-text-muted text-sm text-center">No moves yet.<br />Start a game to see move history.</p></div>
                    ) : (
                      moveLog.map((m, i) => {
                        const currentHalfMoveIndex = gameRef.current.history().length - 1;
                        const wIndex = i * 2;
                        const bIndex = i * 2 + 1;
                        const isWActive = wIndex === currentHalfMoveIndex;
                        const isBActive = bIndex === currentHalfMoveIndex;
                        
                        return (
                          <div key={i} className={`flex gap-4 py-1.5 px-2 rounded transition-colors ${isWActive || isBActive ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                            <span className="text-text-secondary w-6 text-right">{i + 1}.</span>
                            <span className={`w-14 font-semibold ${isWActive ? 'text-brand-accent drop-shadow-md' : 'text-white'}`}>{m.w}</span>
                            <span className={`w-14 ${isBActive ? 'text-brand-accent drop-shadow-md font-semibold' : 'text-white/70'}`}>{m.b}</span>
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-brand-surface rounded-b-2xl border border-brand-border/30 border-t-0 px-4 py-3 relative z-10">
              <form onSubmit={e => { e.preventDefault(); handleChatSend(); }} className="flex items-center gap-2">
                <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder={matchState !== 'lobby' ? "Type your message here..." : "Please start the game to chat."} disabled={matchState === 'lobby'} className="flex-1 bg-transparent text-sm text-white placeholder:text-text-muted/60 outline-none disabled:opacity-50" />
                {chatMessage.trim() && (
                  <button type="submit" className="text-brand-accent hover:text-brand-accent-light transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                )}
              </form>
            </div>
          </motion.div>

          <div className="flex-1 flex flex-col items-center order-2 lg:order-2 w-full min-w-0 relative">

            {/* Game Over Modal Overlay inside the board area */}
            <AnimatePresence>
              {matchState === 'gameover' && gameOverDetails && !hideGameOverModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-surface border border-brand-border p-5 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center w-[90%] sm:w-auto sm:min-w-[320px]"
                >
                  <h2 className="text-3xl font-black text-white mb-1">
                    {gameOverDetails.winner === 'draw' ? 'Draw!' : (gameOverDetails.winner === myColor ? 'You Won!' : 'You Lost!')}
                  </h2>
                  <p className="text-brand-accent font-semibold mb-6 uppercase tracking-widest">{gameOverDetails.reason}</p>
                  
                  <div className="flex w-full gap-3">
                    <button onClick={() => {
                      // Rebuild chess engine with full history so undo() works for analysis
                      const moves = firebaseMovesRef.current;
                      if (moves.length > 0) {
                        const newChess = new Chess();
                        pieceIdMapRef.current = {};
                        for (const m of moves) {
                          newChess.move(m.san);
                        }
                        gameRef.current = newChess;
                        // Rebuild pieceIdMapRef from final position
                        const board = newChess.board();
                        for (let r = 0; r < 8; r++) {
                          for (let c = 0; c < 8; c++) {
                            const p = board[r][c];
                            if (p) {
                              pieceIdMapRef.current[p.square] = `${p.color}-${p.type}-${p.square}-${Math.random()}`;
                            }
                          }
                        }
                        setAnalysisStack([]);
                        setTriggerRender(prev => prev + 1);
                      }
                      setHideGameOverModal(true);
                    }} className="flex-1 py-3 rounded-lg border border-brand-accent text-brand-accent font-bold hover:bg-brand-accent hover:text-brand-navy transition-colors">
                      Review Board
                    </button>
                    <button onClick={exitGameToLobby} className="flex-1 py-3 rounded-lg bg-brand-accent text-brand-navy font-bold hover:bg-brand-accent-light transition-colors shadow-lg">
                      Back to Lobby
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className={`w-full max-w-[560px] max-h-full aspect-square relative rounded-lg overflow-hidden border border-[#d4af37]/20 ${matchState === 'gameover' && !hideGameOverModal ? 'opacity-60 blur-sm pointer-events-none' : ''} transition-all duration-500 mx-auto`}
              style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(212,175,55,0.15)' }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 grid grid-cols-8">
                {boardSquares.map(({ sq, row, col, isLight }) => {
                  const bg = isLight ? '#739552' : '#ebecd0'; // Classic elegant green/white
                  const isSelected = selectedSquare === sq;
                  const isValidDest = validMoves.some(m => m.to === sq);
                  const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
                  const isKingInCheck = boardState.checkSquare === sq;

                  // Blend logic for square colors
                  let squareBg = bg;
                  if (isSelected) squareBg = 'rgba(212,175,55,0.7)';
                  else if (isKingInCheck) squareBg = 'rgba(239, 68, 68, 0.8)'; // Red for check
                  else if (isLastMove) squareBg = 'rgba(255, 255, 0, 0.4)'; // Yellow highlight for last move

                  return (
                    <div
                      key={sq}
                      onClick={() => handleSquareClick(sq)}
                      className="relative select-none flex items-center justify-center"
                      style={{
                        backgroundColor: isLight ? '#ebecd0' : '#739552', // Base color
                      }}
                    >
                      {/* Highlight Overlays */}
                      <div className="absolute inset-0" style={{ background: squareBg !== bg ? squareBg : 'transparent' }} />

                      {col === 0 && (
                        <span className="absolute top-0.5 left-0.5 leading-none font-bold select-none pointer-events-none" style={{ color: isLight ? '#739552' : '#ebecd0', fontSize: '0.65rem' }}>
                          {boardOrientation === 'white' ? 8 - row : row + 1}
                        </span>
                      )}
                      {row === 7 && (
                        <span className="absolute bottom-0.5 right-0.5 leading-none font-bold select-none pointer-events-none" style={{ color: isLight ? '#739552' : '#ebecd0', fontSize: '0.65rem' }}>
                          {FILES[boardOrientation === 'white' ? col : 7 - col]}
                        </span>
                      )}

                      {isValidDest && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <div className={`rounded-full ${gameRef.current.get(sq as Square) ? 'w-[85%] h-[85%] border-[5px] border-black/20' : 'w-4 h-4 bg-black/20'}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <LayoutGroup id="online-board">
                <AnimatePresence>
                  {boardState.pieces.map(p => (
                    <motion.div
                      key={p.id}
                      layoutId={p.id}
                      layout
                      className="absolute flex items-center justify-center pointer-events-none select-none z-10"
                      style={{ width: '12.5%', height: '12.5%', left: `${p.col * 12.5}%`, top: `${p.row * 12.5}%` }}
                      transition={{ layout: { type: 'spring', stiffness: 380, damping: 28, mass: 0.85 } }}
                    >
                      <img
                        src={PIECE_IMAGES[p.color][p.type]}
                        alt={`${p.color} ${p.type}`}
                        className="w-[90%] h-[90%] object-contain drop-shadow-md"
                        style={{
                          filter: selectedSquare === p.square ? 'drop-shadow(0 0 10px rgba(212,175,55,0.9))' : 'none',
                          transition: 'filter 0.15s ease',
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </LayoutGroup>
              <div className="absolute inset-0 pointer-events-none bg-black/5 mix-blend-overlay" />
            </motion.div>

            {/* Contextual Import Controls */}
            <AnimatePresence>
              {matchState === 'lobby' && isImportedGame && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-[560px] mt-3 sm:mt-4 flex flex-wrap justify-between gap-2 sm:gap-3">
                  <div className="flex bg-brand-surface border border-brand-border/50 rounded-lg overflow-hidden">
                      <button onClick={handlePrevMove} disabled={gameRef.current.history().length === 0} className="w-12 sm:w-14 flex items-center justify-center text-white hover:bg-white/5 transition-colors border-r border-brand-border/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button onClick={handleNextMove} disabled={analysisStack.length === 0} className="w-12 sm:w-14 flex items-center justify-center text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                  </div>

                  <div className="flex justify-end gap-2 flex-1">
                    <button onClick={() => setBoardFlipped(!boardFlipped)} className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-brand-surface border border-brand-border/50 text-white font-bold text-sm hover:bg-brand-surface-light transition-colors flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      <span className="hidden sm:inline">Flip Board</span>
                    </button>
                    <button onClick={() => {
                      gameRef.current.reset();
                      setMoveLog([]);
                      setAnalysisStack([]);
                      setTriggerRender(prev => prev + 1);
                      setIsImportedGame(false);
                      setBoardFlipped(false);
                    }} className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      <span className="hidden sm:inline">Reset Board</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4 order-1 lg:order-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <AnimatePresence mode="wait">
              {matchState === 'lobby' ? (
                <motion.div key="lobby-actions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-3">
                  {/* On mobile these 3 buttons are arranged in a row; on lg screens stacked vertically */}
                  <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                    <button onClick={openPlayModal} className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 py-4 lg:py-5 rounded-xl bg-brand-surface border border-brand-border/50 text-white text-sm lg:text-xl font-bold transition-all cursor-pointer hover:border-brand-accent/60 hover:bg-brand-surface-light shadow-lg group">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-brand-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      <span>Online Play</span>
                    </button>
                    <button onClick={() => setImportExpanded(prev => !prev)} className={`flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 py-4 lg:py-5 bg-brand-surface border border-brand-border/50 text-white text-sm lg:text-xl font-bold transition-all cursor-pointer hover:border-brand-accent/60 hover:bg-brand-surface-light group rounded-xl`}>
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-brand-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span>Import Game</span>
                    </button>
                    <button onClick={() => setActiveModal('history')} className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 py-4 lg:py-5 rounded-xl bg-brand-surface border border-brand-border/50 text-white text-sm lg:text-xl font-bold transition-all cursor-pointer hover:border-brand-accent/60 hover:bg-brand-surface-light shadow-lg group">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-brand-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                      <span>Match History</span>
                    </button>
                  </div>
                  {/* Import PGN expanded panel - shown below buttons */}
                  <AnimatePresence>
                    {importExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-brand-surface border border-brand-border/50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Paste PGN</p>
                          <textarea value={pgnText} onChange={e => { setPgnText(e.target.value); setPgnError(null); }} placeholder="Paste PGN here..." className={`w-full h-24 rounded-lg bg-brand-navy border ${pgnError ? 'border-red-500' : 'border-brand-border'} p-3 text-sm text-white placeholder:text-text-muted resize-none custom-scrollbar outline-none focus:border-brand-accent/60`} />
                          {pgnError && <p className="text-red-400 text-xs mt-1">{pgnError}</p>}
                          <div className="flex justify-end gap-2 mt-3">
                            <button onClick={() => { setImportExpanded(false); setPgnError(null); setPgnText(''); }} className="px-5 py-2 rounded-lg border border-brand-border text-text-secondary hover:text-white text-sm font-bold cursor-pointer">Cancel</button>
                            <button onClick={handleImportGame} disabled={!pgnText.trim()} className="px-5 py-2 rounded-lg bg-brand-accent text-brand-navy text-sm font-bold cursor-pointer hover:bg-brand-accent-light disabled:opacity-50">Import</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div key="match-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full bg-brand-surface rounded-xl border border-brand-border/50 overflow-hidden shadow-lg flex flex-col">
                  <div className="flex items-center justify-center gap-3 py-4 border-b border-brand-border/50 bg-white/5">
                    <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                    <h3 className="text-lg font-bold text-white tracking-wide">Game Panel</h3>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-brand-border/50 flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                          Enemy
                          {matchState === 'playing' && (
                            <span className={`w-2 h-2 rounded-full ${opponentOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} title={opponentOnline ? 'Online' : 'Offline'} />
                          )}
                        </h4>
                        {boardState.material[enemyColorShort] > 0 && <span className="text-sm font-bold text-white">+{boardState.material[enemyColorShort]}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 min-h-[24px]">
                        {boardState.captured[myColorShort].map((ptype, idx) => (
                          <img key={idx} src={PIECE_IMAGES[myColorShort][ptype]} alt={ptype} className="w-5 h-5 opacity-80 drop-shadow" />
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border-b border-brand-border/50 flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                          You
                          {matchState === 'playing' && (
                            <span className="w-2 h-2 rounded-full bg-green-500" title="Online" />
                          )}
                        </h4>
                        {boardState.material[myColorShort] > 0 && <span className="text-sm font-bold text-white">+{boardState.material[myColorShort]}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 min-h-[24px]">
                        {boardState.captured[enemyColorShort].map((ptype, idx) => (
                          <img key={idx} src={PIECE_IMAGES[enemyColorShort][ptype]} alt={ptype} className="w-5 h-5 opacity-80 drop-shadow" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {matchState === 'gameover' && hideGameOverModal ? (
                    <div className="flex border-t border-brand-border/50">
                      <button onClick={handlePrevMove} disabled={gameRef.current.history().length === 0} className="w-16 flex items-center justify-center py-4 text-sm font-bold text-white hover:bg-white/5 transition-colors border-r border-brand-border/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button onClick={handleNextMove} disabled={analysisStack.length === 0} className="w-16 flex items-center justify-center py-4 text-sm font-bold text-white hover:bg-white/5 transition-colors border-r border-brand-border/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                      <button onClick={exitGameToLobby} className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold text-brand-accent hover:bg-brand-accent/10 transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Exit to Lobby
                      </button>
                    </div>
                  ) : (
                    <div className="flex">
                      <button onClick={handleDraw} disabled={matchState === 'gameover' || drawOffer === myColor} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors border-r border-brand-border/50 cursor-pointer disabled:opacity-50 ${drawOffer && drawOffer !== myColor ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'text-white hover:bg-white/5'}`}>
                        <svg className="w-4 h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        {drawOffer === myColor ? 'Draw Offered' : (drawOffer && drawOffer !== myColor ? 'Accept Draw' : 'Offer Draw')}
                      </button>
                      <button onClick={handleResign} disabled={matchState === 'gameover'} className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold text-white hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50">
                        <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                        Resign
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <footer className="w-full text-center py-5 text-text-muted text-sm border-t border-brand-border/20 shrink-0">@ {year} DAChess</footer>
      </main>

      <AnimatePresence>
        {activeModal === 'play' && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
            <motion.div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="relative bg-brand-surface border border-brand-border rounded-2xl w-full max-w-[540px] overflow-hidden z-10" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(212,175,55,0.12)' }} initial={{ scale: 0.88, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.88, y: 30, opacity: 0 }}>
              <div className="flex border-b border-brand-border">
                {(['create', 'join'] as const).map(tab => (
                  <button key={tab} disabled={roomState !== 'idle'} onClick={() => { setPlayTab(tab); setGeneratedCode(null); setRoomState('idle'); setNetworkError(null); }} className={`flex-1 flex items-center justify-center gap-2 py-4 text-lg font-bold transition-all border-b-2 ${playTab === tab ? 'text-white bg-white/5 border-brand-accent' : 'text-text-secondary border-transparent'} ${roomState === 'idle' ? 'hover:text-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                    {tab === 'create' ? 'Create Room' : 'Join Room'}
                  </button>
                ))}
              </div>
              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {playTab === 'create' ? (
                    <motion.div key="create-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                      {roomState === 'idle' || roomState === 'creating' ? (
                        <>
                          <h3 id="modal-title" className="text-xl font-bold text-white text-center mb-2">Game Settings</h3>
                          <p className="text-text-secondary text-sm text-center mb-6">Select your preferred settings before generating a room code.</p>
                          <div className="flex flex-col sm:flex-row gap-3 mb-5">
                            <div className="flex-1 flex rounded-xl overflow-hidden border border-brand-border">
                              {(['white', 'black'] as const).map(c => (
                                <button key={c} onClick={() => setSelectedColor(c)} disabled={roomState === 'creating'} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all cursor-pointer ${selectedColor === c ? 'bg-brand-accent text-brand-navy' : 'bg-brand-surface-light text-text-secondary hover:text-white'}`}>
                                  {c === 'white' ? '♔' : ''} {c.charAt(0).toUpperCase() + c.slice(1)} {c === 'black' ? '♚' : ''}
                                </button>
                              ))}
                            </div>
                            <div className="flex-1 flex rounded-xl overflow-hidden border border-brand-border">
                              {[{ label: '3m', icon: '⚡', value: 3 }, { label: '10m', icon: '⏱', value: 10 }, { label: '30m', icon: '🐢', value: 30 }].map(tc => (
                                <button key={tc.value} onClick={() => setTimeControl(tc.value)} disabled={roomState === 'creating'} className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm font-bold transition-all cursor-pointer ${timeControl === tc.value ? 'bg-brand-accent text-brand-navy' : 'bg-brand-surface-light text-text-secondary hover:text-white'}`}>
                                  <span>{tc.icon}</span> {tc.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between mt-8">
                            <button onClick={closeModal} className="px-8 py-2.5 rounded-lg border border-brand-border text-text-secondary hover:text-white hover:border-brand-accent font-bold text-sm transition-all cursor-pointer">CLOSE</button>
                            <button onClick={handleCreateRoom} disabled={roomState === 'creating'} className="px-8 py-2.5 rounded-lg border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-navy font-bold text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2">
                              {roomState === 'creating' ? 'CREATING...' : 'CREATE ROOM'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 id="modal-title" className="text-xl font-bold text-white text-center mb-2">Room Created</h3>
                          <p className="text-text-secondary text-sm text-center mb-6">Share this code with your opponent to join the match.</p>
                          <motion.div className="flex items-center justify-center mb-4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="border-2 border-green-500 rounded-xl px-8 py-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                              <span className="text-4xl font-black text-white tracking-[0.4em] font-mono">{generatedCode}</span>
                            </div>
                          </motion.div>
                          <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                            <p className="text-brand-accent text-sm font-semibold animate-pulse">Waiting for opponent to join...</p>
                          </div>
                          <div className="flex justify-end">
                            <button onClick={cancelRoom} className="px-8 py-2.5 rounded-lg border border-brand-border text-text-secondary hover:text-white hover:border-red-400 hover:text-red-400 font-bold text-sm transition-all cursor-pointer">CANCEL ROOM</button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="join-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <h3 id="modal-title" className="text-xl font-bold text-white text-center mb-2">Joining Game</h3>
                      <p className="text-text-secondary text-sm text-center mb-6">Enter the 4-digit room code provided by your opponent.</p>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        {[0, 1, 2, 3].map(i => (
                          <input key={i} ref={el => { joinInputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={joinCode[i]} onChange={e => handleJoinCodeChange(i, e.target.value)} onPaste={i === 0 ? handleJoinCodePaste : undefined} onKeyDown={e => handleJoinCodeKeyDown(i, e)} disabled={roomState === 'joining'} className={`w-14 h-16 rounded-lg bg-white text-black text-2xl font-black text-center outline-none focus:ring-2 focus:ring-brand-accent transition-all shadow-inner disabled:opacity-50 ${networkError ? 'ring-2 ring-red-500' : ''}`} />
                        ))}
                      </div>
                      <div className="h-6 flex items-center justify-center mb-6">
                        <AnimatePresence>
                          {networkError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-sm font-semibold">{networkError}</motion.p>}
                        </AnimatePresence>
                      </div>
                      <div className="flex justify-between mt-2">
                        <button onClick={closeModal} className="px-8 py-2.5 rounded-lg border border-brand-border text-text-secondary hover:text-white hover:border-brand-accent font-bold text-sm transition-all cursor-pointer">CLOSE</button>
                        <button disabled={joinCode.some(d => !d) || roomState === 'joining' || roomState === 'connected'} onClick={handleJoinRoom} className="px-8 py-2.5 rounded-lg border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-navy font-bold text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2">
                          {roomState === 'connected' ? 'CONNECTED — Starting...' : roomState === 'joining' ? 'CONNECTING...' : 'JOIN ROOM'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModalConfig && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={confirmModalConfig.onCancel} />
            <motion.div className="relative bg-brand-surface border border-brand-border/50 rounded-2xl w-full max-w-[400px] overflow-hidden z-10 p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.1)]" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}>
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Leave Match?</h3>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                You are currently in an active match. Leaving will automatically forfeit the game. Are you sure you want to leave?
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={confirmModalConfig.onCancel} className="flex-1 py-3 rounded-lg border border-brand-border text-text-secondary hover:text-white hover:bg-white/5 font-bold text-sm transition-all cursor-pointer">
                  STAY
                </button>
                <button onClick={confirmModalConfig.onConfirm} className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20 cursor-pointer">
                  LEAVE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'history' && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
            <motion.div className="relative bg-brand-surface border border-brand-border rounded-2xl w-full max-w-[540px] p-6 sm:p-8 z-10" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(212,175,55,0.12)' }} initial={{ scale: 0.88, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}>
              <h3 className="text-xl font-bold text-white text-center mb-2">Game History</h3>
              <p className="text-text-secondary text-sm text-center mb-6">Please select a chess game that you would like to load</p>
              <div className="border border-brand-border rounded-xl overflow-hidden mb-6 shadow-inner">
                <div className="flex items-center bg-brand-surface-light border-b border-brand-border/50 px-4">
                  <span className="py-3 flex-[1.5] text-xs font-bold text-text-secondary uppercase tracking-wider">Result</span>
                  <span className="py-3 flex-1 text-xs font-bold text-text-secondary uppercase tracking-wider hidden sm:block">Played As</span>
                  <span className="py-3 flex-1 text-xs font-bold text-text-secondary uppercase tracking-wider hidden sm:block">Date</span>
                  <span className="py-3 sm:w-[150px] text-xs font-bold text-text-secondary uppercase tracking-wider sm:text-right">Actions</span>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {matchHistory.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center bg-black/10">
                      <svg className="w-10 h-10 text-brand-border mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-text-muted text-sm font-medium">No history available yet.</p>
                    </div>
                  ) : (
                    matchHistory.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center px-4 py-3 border-b border-brand-border/20 hover:bg-white/5 transition-colors gap-2 sm:gap-0">
                        {/* Info row */}
                        <div className="flex items-center gap-2 sm:contents">
                          <span className={`flex-[1.5] text-sm font-bold ${item.result === 'Won' ? 'text-green-400' : item.result === 'Lost' ? 'text-red-400' : 'text-gray-400'}`}>{item.result}</span>
                          <span className="flex-1 text-sm text-white hidden sm:block">{item.playedAs}</span>
                          <span className="flex-1 text-sm text-text-secondary hidden sm:block">{item.date}</span>
                          <span className="text-xs text-text-secondary sm:hidden">{item.playedAs} · {item.date}</span>
                        </div>
                        {/* Action buttons — always visible */}
                        <div className="flex items-center gap-1.5 sm:w-[150px] sm:justify-end">
                           <button onClick={() => {
                              const pgn = item.pgn;
                              setPgnText(pgn);
                              // Use pgn directly to avoid stale state race condition
                              try {
                                const chess = new Chess();
                                chess.loadPgn(pgn);
                                gameRef.current = chess;
                                const history = chess.history({ verbose: true }) as Move[];
                                const newMoveLog: Array<{ w: string; b: string }> = [];
                                pieceIdMapRef.current = {};
                                const board = chess.board();
                                for (let r = 0; r < 8; r++) {
                                  for (let c = 0; c < 8; c++) {
                                    const p = board[r][c];
                                    if (p) pieceIdMapRef.current[p.square] = `${p.color}-${p.type}-${p.square}-${Math.random()}`;
                                  }
                                }
                                for (let i = 0; i < history.length; i++) {
                                  if (history[i].color === 'w') newMoveLog.push({ w: history[i].san, b: '' });
                                  else if (newMoveLog.length > 0) newMoveLog[newMoveLog.length - 1].b = history[i].san;
                                }
                                setMoveLog(newMoveLog);
                                setAnalysisStack([]);
                                setLastMove(null);
                                setMatchState('lobby');
                                setLeftTab('moves');
                                setImportExpanded(false);
                                setPgnError(null);
                                setIsImportedGame(true);
                                setTriggerRender(prev => prev + 1);
                                closeModal();
                              } catch {
                                // PGN corrupt — silently ignore
                              }
                           }} className="px-2.5 py-1 rounded bg-brand-accent/20 text-brand-accent hover:bg-brand-accent hover:text-brand-navy text-xs font-bold transition-colors cursor-pointer" title="Load Game">
                             LOAD
                           </button>
                           <button onClick={() => navigator.clipboard.writeText(item.pgn)} className="p-1.5 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors cursor-pointer" title="Copy PGN">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                           </button>
                           <button onClick={() => {
                              const blob = new Blob([item.pgn], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `dachess_game_${item.id}.pgn`;
                              a.click();
                              URL.revokeObjectURL(url);
                           }} className="p-1.5 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors cursor-pointer" title="Download PGN">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                           </button>
                           <button onClick={() => {
                              const updated = matchHistory.filter(h => h.id !== item.id);
                              setMatchHistory(updated);
                              localStorage.setItem('dachess_match_history', JSON.stringify(updated));
                           }} className="p-1.5 hover:bg-red-500/20 rounded text-text-secondary hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </div>

                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={closeModal} className="px-8 py-2.5 rounded-lg border border-brand-border text-text-secondary hover:text-white hover:border-brand-accent font-bold text-sm transition-all cursor-pointer">CLOSE</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
