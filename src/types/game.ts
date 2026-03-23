export type CatType = 'cat1' | 'cat2' | 'cat3' | 'cat4' | 'cat5';
export type PowerUpType = 'horizontal' | 'vertical' | 'bomb' | 'rainbow';

export interface Tile {
  id: string;
  type: CatType;
  row: number;
  col: number;
  powerUp?: PowerUpType;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: (Tile | null)[][];
  score: number;
  stage: number;
  timeLeft: number;
  selectedTile: Position | null;
  isAnimating: boolean;
  gameOver: boolean;
}

export interface StageRequirement {
  score: number;
  timeLimit: number;
}
