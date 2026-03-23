import { useState, useEffect, useCallback, useRef } from 'react';
import { CatTile } from './CatTile';
import { Position, Tile } from '../types/game';
import {
  createInitialBoard,
  findMatches,
  removeMatches,
  applyGravity,
  fillEmptyTiles,
  areAdjacent,
  swapTiles,
  BOARD_SIZE_EXPORT as BOARD_SIZE,
  STAGE_REQUIREMENTS,
} from '../utils/gameLogic';

export const GameBoard = () => {
  const [board, setBoard] = useState<(Tile | null)[][]>(() => createInitialBoard());
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(STAGE_REQUIREMENTS[0].timeLimit);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStageRequirement = STAGE_REQUIREMENTS[stage - 1];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (score >= currentStageRequirement.score && stage < 50) {
      const nextStage = stage + 1;
      setStage(nextStage);
      setTimeLeft(STAGE_REQUIREMENTS[nextStage - 1].timeLimit);
    }
  }, [score, stage]);

  const processMatches = useCallback(() => {
    const matchResult = findMatches(board);
    if (matchResult.matches.length > 0) {
      setIsAnimating(true);
      const points = matchResult.comboCount * 10 + (matchResult.comboCount > 4 ? 50 : 0);
      setScore((prev) => prev + points);

      setTimeout(() => {
        let newBoard = removeMatches(board, matchResult.matches, matchResult.powerUpsToCreate);
        newBoard = applyGravity(newBoard);
        newBoard = fillEmptyTiles(newBoard);
        setBoard(newBoard);
        setIsAnimating(false);
      }, 300);
    }
  }, [board]);

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        processMatches();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [board, isAnimating, processMatches]);

  const handleMouseDown = (pos: Position) => {
    if (isAnimating || gameOver) return;
    setSelectedTile(pos);
    setIsDragging(true);
  };

  const handleMouseEnter = (pos: Position) => {
    if (!isDragging || !selectedTile) return;

    if (selectedTile.row === pos.row && selectedTile.col === pos.col) {
      return;
    }

    if (areAdjacent(selectedTile, pos)) {
      performSwap(selectedTile, pos);
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const performSwap = (pos1: Position, pos2: Position) => {
    setIsAnimating(true);
    const newBoard = swapTiles(board, pos1, pos2);

    const matchResult = findMatches(newBoard);

    if (matchResult.matches.length === 0) {
      setTimeout(() => {
        setBoard(swapTiles(newBoard, pos1, pos2));
        setSelectedTile(null);
        setIsAnimating(false);
      }, 300);
    } else {
      setBoard(newBoard);
      setSelectedTile(null);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedTile?.row === row && selectedTile?.col === col;
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setScore(0);
    setStage(1);
    setTimeLeft(STAGE_REQUIREMENTS[0].timeLimit);
    setSelectedTile(null);
    setIsAnimating(false);
    setGameOver(false);
  };

  const progressPercent = (score / currentStageRequirement.score) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl px-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Stage</p>
            <p className="text-3xl font-bold text-blue-600">{stage}</p>
            <p className="text-xs text-gray-500">/50</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-3xl font-bold text-blue-600">{score}</p>
            <p className="text-xs text-gray-500">/ {currentStageRequirement.score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Time</p>
            <p className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
              {timeLeft}s
            </p>
            <p className="text-xs text-gray-500">seconds</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Time's Up!</h2>
            <p className="text-lg text-gray-600 mb-4">
              You reached <span className="font-bold text-blue-600">Stage {stage}</span> with{' '}
              <span className="font-bold text-blue-600">{score}</span> points!
            </p>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <div
        className="grid gap-2 p-4 bg-white rounded-xl shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          width: 'min(90vw, 600px)',
          aspectRatio: '1/1',
        }}
        onMouseLeave={() => setIsDragging(false)}
      >
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) =>
            tile ? (
              <CatTile
                key={tile.id}
                tile={tile}
                isSelected={isSelected(rowIndex, colIndex)}
                isDragging={isDragging}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseUp={handleMouseUp}
              />
            ) : (
              <div key={`empty-${rowIndex}-${colIndex}`} className="w-full h-full" />
            )
          )
        )}
      </div>

      <div className="text-center text-gray-600 max-w-md">
        <p className="font-medium">Drag adjacent cats to swap them!</p>
        <p className="text-sm mt-1">Match 3+ cats. 5-combos create power-ups!</p>
        <p className="text-xs mt-1 text-gray-500">Reach the score goal before time runs out</p>
      </div>
    </div>
  );
};
