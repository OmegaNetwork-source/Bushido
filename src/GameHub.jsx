import { useEffect } from 'react';

export default function GameHub({ onSelect }) {
  // Auto-select Bushido Duel game
  useEffect(() => {
    onSelect('bushido-duel');
  }, [onSelect]);

  return null;
}