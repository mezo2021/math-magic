// src/lib/puzzleEngine.ts

export type InteractionType = 'multi_input_animals' | 'multiple_choice' | 'single_input';

export interface Puzzle {
  id: string;
  puzzle_type: 'farm' | 'distance' | 'sequence';
  interaction_type: InteractionType;
  params: any;
  options?: { id: string; value: number }[];
  correct_answer: any; 
}

export const generatePuzzle = (lang: 'ar' | 'en'): Puzzle => {
  const type = Math.floor(Math.random() * 3);

  if (type === 0) {
    // 🐇 لغز منسا للمزرعة (نطابق النص: البط نصف الدجاج، الأرانب ربع البط)
    // نفرض الأرانب = R. إذن البط = 4R، الدجاج = 8R. المفقود = 3R.
    const rabbits = Math.floor(Math.random() * 4) + 1; // من 1 إلى 4
    const ducks = rabbits * 4;
    const chickens = rabbits * 8;
    const missing = rabbits * 3;

    return {
      id: `farm_${Date.now()}`,
      puzzle_type: 'farm',
      interaction_type: 'multi_input_animals',
      params: { missing },
      correct_answer: { chickens, ducks, rabbits }
    };
  }

  if (type === 1) {
    // 🚗 لغز المسافة (الفخ)
    const distance = Math.floor(Math.random() * 30) + 20; // 20-50 كم
    
    // نخلط الخيارات (نضع المسافة الصحيحة، والمضاعفات كفخاخ)
    const options = [
      { id: "A", value: distance * 2 },
      { id: "B", value: distance },
      { id: "C", value: 0 },
      { id: "D", value: distance * 4 }
    ].sort(() => Math.random() - 0.5);

    const correctOptionId = options.find(o => o.value === distance)?.id;

    return {
      id: `dist_${Date.now()}`,
      puzzle_type: 'distance',
      interaction_type: 'multiple_choice',
      params: { distance },
      options,
      correct_answer: { choice: correctOptionId }
    };
  }

  // 🔢 لغز المتتالية
  const start = Math.floor(Math.random() * 10) + 1;
  const step = Math.floor(Math.random() * 5) + 2;
  const seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
  const correctValue = start + step * 5;

  return {
    id: `seq_${Date.now()}`,
    puzzle_type: 'sequence',
    interaction_type: 'single_input',
    params: { seq },
    correct_answer: { value: correctValue }
  };
};

export const validateAnswer = (puzzle: Puzzle, answer: any): boolean => {
  if (puzzle.interaction_type === 'multi_input_animals') {
    return (
      Number(answer.chickens) === puzzle.correct_answer.chickens &&
      Number(answer.ducks) === puzzle.correct_answer.ducks &&
      Number(answer.rabbits) === puzzle.correct_answer.rabbits
    );
  }
  if (puzzle.interaction_type === 'single_input') {
    return Number(answer.value) === puzzle.correct_answer.value;
  }
  if (puzzle.interaction_type === 'multiple_choice') {
    return answer.choice === puzzle.correct_answer.choice;
  }
  return false;
};