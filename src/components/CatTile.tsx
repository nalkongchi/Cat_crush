import { Tile, Position } from '../types/game';
import { CatEmoji } from './CatEmoji';

interface CatTileProps {
  tile: Tile;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (pos: Position) => void;
  onMouseEnter: (pos: Position) => void;
  onMouseUp: () => void;
}

export const CatTile = ({
  tile,
  isSelected,
  isDragging,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}: CatTileProps) => {
  return (
    <button
      onMouseDown={() => onMouseDown({ row: tile.row, col: tile.col })}
      onMouseEnter={() => isDragging && onMouseEnter({ row: tile.row, col: tile.col })}
      onMouseUp={onMouseUp}
      className={`
        w-full h-full rounded-lg flex items-center justify-center
        transition-all duration-150
        bg-gradient-to-br from-blue-100 to-blue-50
        ${isSelected ? 'ring-4 ring-blue-500 scale-95' : 'hover:scale-105'}
        ${isSelected ? 'shadow-lg' : 'shadow-md hover:shadow-lg'}
      `}
    >
      <CatEmoji type={tile.type} powerUp={tile.powerUp} />
    </button>
  );
};
