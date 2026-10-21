// src/lib/store.ts

export interface PlayerProfile {
  schemaVersion: number;
  profile: {
    id: string;
    name: string;
  };
  preferences: {
    theme: 'ocean' | 'barbie';
    sound: boolean;
    language: 'ar' | 'en';
  };
  progress: {
    highestScore: number;
    totalPuzzlesSolved: number;
    achievements: string[];
  };
}

const STORAGE_KEY = 'math_magic_player_store_v1';

const defaultProfile: PlayerProfile = {
  schemaVersion: 1,
  profile: {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    name: 'لاعب مجهول',
  },
  preferences: {
    theme: 'ocean',
    sound: true,
    language: 'ar',
  },
  progress: {
    highestScore: 0,
    totalPuzzlesSolved: 0,
    achievements: [],
  },
};

// تحميل البيانات مع الترحيل التلقائي للبيانات القديمة
export function loadPlayerStore(): PlayerProfile {
  if (typeof window === 'undefined') return defaultProfile;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: PlayerProfile = JSON.parse(stored);
      if (data.schemaVersion === 1) {
        return data;
      }
    }
    
    // ترحيل مفتاح النقاط القديم إن وجد (math_magic_score)
    const legacyScore = localStorage.getItem('math_magic_score');
    const initialProfile = { ...defaultProfile };
    
    if (legacyScore) {
      initialProfile.progress.highestScore = parseInt(legacyScore, 10) || 0;
    }
    
    savePlayerStore(initialProfile);
    return initialProfile;
  } catch (e) {
    console.error('خطأ في قراءة تخزين اللاعب:', e);
    return defaultProfile;
  }
}

// حفظ بيانات اللاعب بشكل آمن
export function savePlayerStore(data: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('خطأ في حفظ بيانات اللاعب:', e);
  }
}
