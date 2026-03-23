import { CatType, PowerUpType } from '../types/game';

interface CatEmojiProps {
  type: CatType;
  powerUp?: PowerUpType;
}

const getCatEmoji = (type: CatType): string => {
  switch (type) {
    case 'cat1':
      return '😺';
    case 'cat2':
      return '😸';
    case 'cat3':
      return '😻';
    case 'cat4':
      return '😽';
    case 'cat5':
      return '😿';
  }
};

const getPowerUpEmoji = (powerUp: PowerUpType): string => {
  switch (powerUp) {
    case 'horizontal':
      return '➡️';
    case 'vertical':
      return '⬇️';
    case 'bomb':
      return '💣';
    case 'rainbow':
      return '🌈';
  }
};

export const CatEmoji = ({ type, powerUp }: CatEmojiProps) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="text-5xl">{getCatEmoji(type)}</div>
      {powerUp && (
        <div className="absolute top-0 right-0 text-2xl transform translate-x-1 -translate-y-1">
          {getPowerUpEmoji(powerUp)}
        </div>
      )}
    </div>
  );
};
