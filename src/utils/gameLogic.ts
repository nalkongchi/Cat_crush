import { CatType, Tile, Position, PowerUpType, StageRequirement } from '../types/game';

const CAT_TYPES: CatType[] = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5'];
const BOARD_SIZE = 8;

export const STAGE_REQUIREMENTS: StageRequirement[] = Array.from({ length: 50 }, (_, i) => ({
  score: 100 + i * 150,
  timeLimit: 120 - Math.floor(i / 5) * 5,
}));

export const createTile = (row: number, col: number, powerUp?: PowerUpType): Tile => {
  const type = CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)];
  return {
    id: `${row}-${col}-${Date.now()}-${Math.random()}`,
    type,
    row,
    col,
    powerUp,
  };
};

export const createInitialBoard = (): (Tile | null)[][] => {
  const board: (Tile | null)[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = createTile(row, col);
    }
  }
  return board;
};

export interface MatchResult {
  matches: Position[];
  comboCount: number;
  powerUpsToCreate: Array<{ pos: Position; type: PowerUpType }>;
}

export const findMatches = (board: (Tile | null)[][]): MatchResult => {
  const matches = new Set<string>();
  const matchLengths = new Map<string, number>();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile = board[row][col];
      if (!tile) continue;

      let horizontalCount = 1;
      while (
        col + horizontalCount < BOARD_SIZE &&
        board[row][col + horizontalCount]?.type === tile.type
      ) {
        horizontalCount++;
      }
      if (horizontalCount >= 3) {
        for (let i = 0; i < horizontalCount; i++) {
          const key = `${row}-${col + i}`;
          matches.add(key);
          matchLengths.set(key, Math.max(matchLengths.get(key) || 0, horizontalCount));
        }
      }

      let verticalCount = 1;
      while (
        row + verticalCount < BOARD_SIZE &&
        board[row + verticalCount][col]?.type === tile.type
      ) {
        verticalCount++;
      }
      if (verticalCount >= 3) {
        for (let i = 0; i < verticalCount; i++) {
          const key = `${row + i}-${col}`;
          matches.add(key);
          matchLengths.set(key, Math.max(matchLengths.get(key) || 0, verticalCount));
        }
      }
    }
  }

  const matchPositions = Array.from(matches).map((key) => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });

  const comboCount = matches.size;
  const powerUpsToCreate: Array<{ pos: Position; type: PowerUpType }> = [];

  matches.forEach((key) => {
    const [row, col] = key.split('-').map(Number);
    const matchLength = matchLengths.get(key) || 0;

    if (matchLength >= 5) {
      powerUpsToCreate.push({ pos: { row, col }, type: 'bomb' });
    } else if (matchLength === 4) {
      powerUpsToCreate.push({ pos: { row, col }, type: 'horizontal' });
    }
  });

  return { matches: matchPositions, comboCount, powerUpsToCreate };
};

export const removeMatches = (
  board: (Tile | null)[][],
  matches: Position[],
  powerUpsToCreate: Array<{ pos: Position; type: PowerUpType }> = []
): (Tile | null)[][] => {
  const newBoard = board.map((row) => [...row]);
  matches.forEach(({ row, col }) => {
    newBoard[row][col] = null;
  });

  powerUpsToCreate.forEach(({ pos, type }) => {
    if (newBoard[pos.row][pos.col] === null) {
      newBoard[pos.row][pos.col] = createTile(pos.row, pos.col, type);
    } else {
      newBoard[pos.row][pos.col]!.powerUp = type;
    }
  });

  return newBoard;
};

export const applyGravity = (board: (Tile | null)[][]): (Tile | null)[][] => {
  const newBoard = board.map((row) => [...row]);

  for (let col = 0; col < BOARD_SIZE; col++) {
    let emptyRow = BOARD_SIZE - 1;
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col] !== null) {
        if (row !== emptyRow) {
          newBoard[emptyRow][col] = newBoard[row][col];
          if (newBoard[emptyRow][col]) {
            newBoard[emptyRow][col]!.row = emptyRow;
          }
          newBoard[row][col] = null;
        }
        emptyRow--;
      }
    }
  }

  return newBoard;
};

export const fillEmptyTiles = (board: (Tile | null)[][]): (Tile | null)[][] => {
  const newBoard = board.map((row) => [...row]);
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = createTile(row, col);
      }
    }
  }
  return newBoard;
};

export const areAdjacent = (pos1: Position, pos2: Position): boolean => {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

export const swapTiles = (
  board: (Tile | null)[][],
  pos1: Position,
  pos2: Position
): (Tile | null)[][] => {
  const newBoard = board.map((row) => [...row]);
  const temp = newBoard[pos1.row][pos1.col];
  newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col];
  newBoard[pos2.row][pos2.col] = temp;

  if (newBoard[pos1.row][pos1.col]) {
    newBoard[pos1.row][pos1.col]!.row = pos1.row;
    newBoard[pos1.row][pos1.col]!.col = pos1.col;
  }
  if (newBoard[pos2.row][pos2.col]) {
    newBoard[pos2.row][pos2.col]!.row = pos2.row;
    newBoard[pos2.row][pos2.col]!.col = pos2.col;
  }

  return newBoard;
};

export const BOARD_SIZE_EXPORT = BOARD_SIZE;
