/**
 * ==========================================
 * 📂 المسار: src/lib/puzzleEngine.ts
 * ⚙️ الوظيفة: محرك توليد الألغاز والتحقق من صحة الإجابات (قلب التطبيق).
 * 📅 تاريخ التعديل: 2024-05-24
 * 🛠️ التعديلات: 
 * - إضافة نظام التدوير العادل (Round Robin) لضمان تنوع الأسئلة.
 * - تثبيت المعادلات الرياضية للغز المزرعة (حل فريد 100%).
 * - تحسين الخيارات العشوائية لألغاز المسافة والمتسلسلة.
 * ==========================================
 */

export type InteractionType = 'multi_input_animals' | 'multiple_choice' | 'single_input';

export interface PuzzleOption {
  id: string;
  value: number;
}

export interface Puzzle {
  id: string;
  puzzle_type: 'farm' | 'distance' | 'sequence';
  title: string;
  interaction_type: InteractionType;
  params: any;
  options?: PuzzleOption[];
  correct_answer: any;
}

// دالة خلط المصفوفة لضمان التنوع العادل
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// طابور لتخزين أنواع الألغاز ومنع التكرار العشوائي
let puzzleQueue: ('farm' | 'distance' | 'sequence')[] = [];

export function generatePuzzle(lang: 'ar' | 'en'): Puzzle {
  // إعادة ملء الطابور عند فراغه لضمان المرور على جميع الأنواع
  if (puzzleQueue.length === 0) {
    puzzleQueue = shuffleArray(['farm', 'distance', 'sequence', 'farm', 'sequence']);
  }

  const puzzleType = puzzleQueue.pop() || 'farm';

  if (puzzleType === 'farm') {
    // 🐇 معادلات المزرعة الصارمة (لضمان الحل الوحيد)
    const multiplier = Math.floor(Math.random() * 3) + 1; // 1, 2, أو 3
    const rabbits = multiplier;
    const ducks = rabbits * 4;
    const chickens = ducks * 2;
    const missing = chickens - (ducks + rabbits); // دائماً يساوي 3 أضعاف الأرانب

    return {
      id: `farm_${Date.now()}`,
      puzzle_type: 'farm',
      title: 'لغز المزرعة الذكية',
      interaction_type: 'multi_input_animals',
      params: { missing },
      correct_answer: { chickens, ducks, rabbits }
    };
  } else if (puzzleType === 'distance') {
    // 🚗 لغز المسافة (الفخ)
    const dists = [40, 60, 75, 90, 120, 150];
    const distance = dists[Math.floor(Math.random() * dists.length)];

    const options = shuffleArray([
      { id: 'opt1', value: distance },
      { id: 'opt2', value: distance * 2 },
      { id: 'opt3', value: distance + 20 },
      { id: 'opt4', value: 0 }
    ]);

    return {
      id: `distance_${Date.now()}`,
      puzzle_type: 'distance',
      title: 'لغز المسافة',
      interaction_type: 'multiple_choice',
      params: { distance },
      options,
      correct_answer: { choice: 'opt1' } // الخيار الأول قبل الخلط هو الإجابة الصحيحة دائماً
    };
  } else {
    // 🔢 لغز المتسلسلة
    const steps = [3, 4, 5, 6, 7, 8];
    const step = steps[Math.floor(Math.random() * steps.length)];
    const start = Math.floor(Math.random() * 10) + 1;
    
    const seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
    const nextVal = start + step * 5;

    return {
      id: `seq_${Date.now()}`,
      puzzle_type: 'sequence',
      title: 'لغز المتسلسلة',
      interaction_type: 'single_input',
      params: { seq },
      correct_answer: { value: nextVal }
    };
  }
}

export function validateAnswer(puzzle: Puzzle, answer: any): boolean {
  if (puzzle.puzzle_type === 'farm') {
    return (
      Number(answer.chickens) === puzzle.correct_answer.chickens &&
      Number(answer.ducks) === puzzle.correct_answer.ducks &&
      Number(answer.rabbits) === puzzle.correct_answer.rabbits
    );
  } else if (puzzle.puzzle_type === 'distance') {
    return answer.choice === puzzle.correct_answer.choice;
  } else if (puzzle.puzzle_type === 'sequence') {
    return Number(answer.value) === puzzle.correct_answer.value;
  }
  return false;
}