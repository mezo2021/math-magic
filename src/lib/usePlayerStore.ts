// src/lib/usePlayerStore.ts
'use client';

import { useState, useEffect } from 'react';
import { loadPlayerStore, savePlayerStore, PlayerProfile } from './store';

export function usePlayerStore() {
  // نبدأ بحالة فارغة لتجنب التعارض
  const [player, setPlayer] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    // نقرأ البيانات فقط بعد أن يفتح المتصفح
    setPlayer(loadPlayerStore());
  }, []);

  const updatePlayer = (updater: (prev: PlayerProfile) => PlayerProfile) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      savePlayerStore(next);
      return next;
    });
  };

  return { player, updatePlayer };
}