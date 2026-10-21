// src/lib/store.ts

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'المبتدئ الذكي', description: 'حل أول لغز بنجاح', icon: '🐣' },
  { id: 'score_50', title: 'السريع', description: 'تحقيق 50 نقطة في جولة واحدة', icon: '⚡' },
  { id: 'score_100', title: 'الأسطورة', description: 'وصول أعلى نتيجة إلى 100 نقطة', icon: '🏆' },
  { id: 'challenge_win', title: 'قاهر التحديات', description: 'الفوز في أول تحدٍ ضد صديق', icon: '⚔️' },
];

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

// دالة لإنشاء نسخة افتراضية جديدة في كل مرة (تمنع تلوث الذاكرة)
const createDefaultProfile = (): PlayerProfile => ({
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
});

export function loadPlayerStore(): PlayerProfile {
  if (typeof window === 'undefined') return createDefaultProfile();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: PlayerProfile = JSON.parse(stored);
      if (data.schemaVersion === 1) {
        // الدمج الآمن: نضمن وجود الحقول الجديدة حتى لو كانت البيانات قديمة
        return {
          ...createDefaultProfile(),
          ...data,
          profile: { ...createDefaultProfile().profile, ...data.profile },
          preferences: { ...createDefaultProfile().preferences, ...data.preferences },
          progress: { ...createDefaultProfile().progress, ...data.progress },
        };
      }
    }
    
    // ترحيل البيانات القديمة (أفضل نتيجة) بأمان
    const legacyScore = localStorage.getItem('math_magic_score');
    const initialProfile = createDefaultProfile();
    
    if (legacyScore && !isNaN(parseInt(legacyScore, 10))) {
      initialProfile.progress.highestScore = parseInt(legacyScore, 10);
    }
    
    savePlayerStore(initialProfile);
    return initialProfile;
  } catch (e) {
    console.error('خطأ في قراءة تخزين اللاعب:', e);
    return createDefaultProfile();
  }
}

export function savePlayerStore(data: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('خطأ في حفظ بيانات اللاعب:', e);
  }
}