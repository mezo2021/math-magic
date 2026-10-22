/**
 * ==========================================
 * 📂 المسار: src/lib/puzzleEngine.ts
 * ⚙️ الوظيفة: محرك توليد الألغاز والتحقق من صحة الإجابات.
 * 📅 تاريخ التعديل: 2024-05-24
 * 🛠️ التعديلات: 
 * - تطبيق هندسة "VariantId" لمنع التكرار بشكل قطعي.
 * - دالة getSessionPlan لبناء خطة الجلسة وتحديد نسخ الألغاز.
 * ==========================================
 */

export type InteractionType = 'multi_input_animals' | 'multiple_choice' | 'single_input';
export type PuzzleType = 'farm' | 'distance' | 'sequence' | 'age';

export interface PuzzleOption {
  id: string;
  value: number;
}

export interface PuzzleVariant {
  type: PuzzleType;
  variantId: string;
}

export interface Puzzle {
  id: string;
  puzzle_type: PuzzleType;
  title: string;
  interaction_type: InteractionType;
  params: any;
  options?: PuzzleOption[];
  correct_answer: any;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 1. إنشاء خطة الجلسة (تضمن التنوع وتحدد النسخ الفريدة)
export function getSessionPlan(): PuzzleVariant[] {
  const plan: PuzzleVariant[] = [
    { type: 'farm', variantId: 'farm-random' },
    { type: 'distance', variantId: 'distance-random' },
    { type: 'sequence', variantId: 'sequence-random' },
    { type: 'age', variantId: 'age-3' }, // نسخة 3 سنوات (إجابة 18)
    { type: 'age', variantId: 'age-4' }, // نسخة 4 سنوات (إجابة 24)
  ];
  
  return shuffleArray(plan);
}

// 2. توليد اللغز بناءً على المعرف (Variant)
export function generatePuzzle(lang: 'ar' | 'en', variant: PuzzleVariant): Puzzle {
  const { type, variantId } = variant;

  if (type === 'farm') {
    const multiplier = Math.floor(Math.random() * 3) + 1;
    const rabbits = multiplier;
    const ducks = rabbits * 4;
    const chickens = ducks * 2;
    const missing = chickens - (ducks + rabbits);

    return {
      id: `farm_${Date.now()}`,
      puzzle_type: 'farm',
      title: 'لغز المزرعة الذكية',
      interaction_type: 'multi_input_animals',
      params: { missing },
      correct_answer: { chickens, ducks, rabbits }
    };
  } 
  
  if (type === 'distance') {
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
      correct_answer: { choice: 'opt1' }
    };
  } 
  
  if (type === 'age') {
    // تحديد عدد السنوات بناءً على معرف النسخة
    const years = variantId === 'age-3' ? 3 : 4;
    const correctAge = years * 6;
    
    let distractors = new Set<number>();
    while (distractors.size < 3) {
      const offset = Math.floor(Math.random() * 6) + 1;
      const wrong = correctAge + (Math.random() > 0.5 ? offset : -offset);
      if (wrong > 0 && wrong !== correctAge) {
        distractors.add(wrong);
      }
    }
    
    const options = shuffleArray([
      { id: 'opt1', value: correctAge },
      ...Array.from(distractors).map((val, i) => ({ id: `dist_${i}`, value: val }))
    ]);

    return {
      id: `age_${Date.now()}`,
      puzzle_type: 'age',
      title: 'لغز الأعمار',
      interaction_type: 'multiple_choice',
      params: { years },
      options,
      correct_answer: { choice: 'opt1' }
    };
  } 
  
  // sequence
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

export function validateAnswer(puzzle: Puzzle, answer: any): boolean {
  if (puzzle.puzzle_type === 'farm') {
    return (
      Number(answer.chickens) === puzzle.correct_answer.chickens &&
      Number(answer.ducks) === puzzle.correct_answer.ducks &&
      Number(answer.rabbits) === puzzle.correct_answer.rabbits
    );
  } else if (puzzle.puzzle_type === 'distance') {
    return answer.choice === puzzle.correct_answer.choice;
  } else if (puzzle.puzzle_type === 'age') {
    return answer.choice === puzzle.correct_answer.choice;
  } else if (puzzle.puzzle_type === 'sequence') {
    return Number(answer.value) === puzzle.correct_answer.value;
  }
  return false;
}