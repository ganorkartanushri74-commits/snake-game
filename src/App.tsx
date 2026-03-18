/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gamepad2 } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // UP
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_INCREMENT = 2;

type Point = { x: number; y: number };
type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export default function App() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const directionRef = useRef<Point>(INITIAL_DIRECTION);
  const gameLoopRef = useRef<number | null>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setFood(generateFood(INITIAL_SNAKE));
    setGameState('PLAYING');
  };

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameState('GAME_OVER');
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameState('GAME_OVER');
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setFood(generateFood(newSnake));
        setSpeed((s) => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameLoopRef.current = window.setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, moveSnake, speed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y === 0) {
            setDirection({ x: 0, y: -1 });
            directionRef.current = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
          if (directionRef.current.y === 0) {
            setDirection({ x: 0, y: 1 });
            directionRef.current = { x: 0, y: 1 };
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current.x === 0) {
            setDirection({ x: -1, y: 0 });
            directionRef.current = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
          if (directionRef.current.x === 0) {
            setDirection({ x: 1, y: 0 });
            directionRef.current = { x: 1, y: 0 };
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-brutal-black relative overflow-hidden selection:bg-neon-green selection:text-brutal-black">
      {/* Background Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 scanline" />
      
      {/* Header Section */}
      <div className="w-full max-w-[400px] flex justify-between items-end mb-6 z-10">
        <div>
          <h1 className="font-display text-5xl text-neon-green tracking-tighter leading-none">
            NEON<br />SNAKE
          </h1>
          <p className="font-mono text-[10px] text-neon-green/60 mt-2 uppercase tracking-widest">
            System.v2.0 // Active
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-neon-green">
            <Trophy size={14} />
            <span className="font-mono text-sm font-bold">{highScore.toString().padStart(5, '0')}</span>
          </div>
          <div className="font-display text-4xl text-gallery-white">
            {score.toString().padStart(5, '0')}
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative p-1 border-2 border-neon-green/30 bg-neon-green/5 shadow-[0_0_50px_rgba(0,255,0,0.1)] z-10">
        {/* Grid Background */}
        <div 
          className="grid gap-0 bg-brutal-black"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-neon-green/5" />
          ))}
        </div>

        {/* Snake and Food Overlay */}
        <div className="absolute inset-1 pointer-events-none">
          <div 
            className="relative w-full h-full"
            style={{ 
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
          >
            {/* Food */}
            <motion.div
              initial={false}
              animate={{
                gridColumnStart: food.x + 1,
                gridRowStart: food.y + 1,
              }}
              className="w-full h-full p-[10%]"
            >
              <div className="w-full h-full bg-neon-red shadow-[0_0_10px_#FF003C] rounded-sm animate-pulse" />
            </motion.div>

            {/* Snake Segments */}
            {snake.map((segment, i) => (
              <motion.div
                key={`${i}-${segment.x}-${segment.y}`}
                initial={false}
                animate={{
                  gridColumnStart: segment.x + 1,
                  gridRowStart: segment.y + 1,
                }}
                className="w-full h-full p-[5%]"
              >
                <div 
                  className={`w-full h-full ${i === 0 ? 'bg-neon-green' : 'bg-neon-green/60'} rounded-sm shadow-[0_0_8px_rgba(0,255,0,0.4)]`}
                  style={{
                    opacity: 1 - (i / snake.length) * 0.5
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'START' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brutal-black/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm"
            >
              <Gamepad2 className="text-neon-green mb-4 animate-bounce" size={48} />
              <h2 className="font-display text-4xl text-gallery-white mb-2">READY?</h2>
              <p className="font-mono text-xs text-neon-green/60 mb-8 uppercase tracking-wider">
                Use arrow keys to navigate
              </p>
              <button 
                onClick={resetGame}
                className="group relative px-8 py-3 bg-neon-green text-brutal-black font-display text-xl hover:bg-gallery-white transition-colors cursor-pointer"
              >
                <div className="absolute -inset-1 border border-neon-green group-hover:border-gallery-white transition-colors" />
                START_GAME
              </button>
            </motion.div>
          )}

          {gameState === 'GAME_OVER' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neon-red/20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md"
            >
              <div className="bg-brutal-black p-8 border-2 border-neon-red shadow-[0_0_30px_rgba(255,0,60,0.3)]">
                <h2 className="font-display text-5xl text-neon-red mb-2">CRASHED</h2>
                <div className="font-mono text-sm text-gallery-white/60 mb-6 uppercase">
                  Final Score: <span className="text-neon-red font-bold">{score}</span>
                </div>
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-3 bg-neon-red text-gallery-white font-display text-lg hover:bg-gallery-white hover:text-neon-red transition-all cursor-pointer mx-auto"
                >
                  <RotateCcw size={20} />
                  REBOOT_SYSTEM
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Help (Mobile/Visual) */}
      <div className="mt-8 grid grid-cols-3 gap-2 z-10 opacity-40 hover:opacity-100 transition-opacity">
        <div />
        <div className="p-3 border border-neon-green/30 rounded flex justify-center"><ArrowUp size={20} className="text-neon-green" /></div>
        <div />
        <div className="p-3 border border-neon-green/30 rounded flex justify-center"><ArrowLeft size={20} className="text-neon-green" /></div>
        <div className="p-3 border border-neon-green/30 rounded flex justify-center"><ArrowDown size={20} className="text-neon-green" /></div>
        <div className="p-3 border border-neon-green/30 rounded flex justify-center"><ArrowRight size={20} className="text-neon-green" /></div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-8 w-full max-w-[400px] flex justify-between font-mono text-[9px] text-neon-green/30 uppercase tracking-[0.2em] z-10">
        <span>Sector_7G</span>
        <span>Grid_Sync_OK</span>
        <span>Latency_0.4ms</span>
      </div>
    </div>
  );
}
