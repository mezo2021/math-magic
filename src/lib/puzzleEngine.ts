export type InteractionType = 'multi_input_animals' | 'multiple_choice' | 'single_input';

export interface Puzzle {
  challenge_id: number;
  puzzle_type: 'farm' | 'distance' | 'sequence';
  interaction_type: InteractionType;
  params: any;
  options: { id: string; value: number }[];
}

function seededRandom(seed: number) {
  let s = seed;
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

const getRange = (rng: () => number, min: number, max: number) => {
  return Math.floor(rng() * (max - min + 1)) + min;
};

export const generatePuzzle = (seed: number): Puzzle => {
  const rng = seededRandom(seed);
  const puzzleType = getRange(rng, 0, 2);

  if (puzzleType === 0) {
    const rabbits = getRange(rng, 2, 8);
    const chickens = getRange(rng, 5, 15);
    const ducks = getRange(rng, 2, 8);
    const totalHeads = rabbits + chickens + ducks;
    const totalLegs = (rabbits * 4) + (chickens * 2) + (ducks * 2);

    return {
      challenge_id: seed,
      puzzle_type: 'farm',
      interaction_type: 'multi_input_animals',
      params: { totalHeads, totalLegs },
      options: []
    };
  } else if (puzzleType === 1) {
    const distance = getRange(rng, 15, 50);
    const options = [
      { id: "A", value: distance * 2 },
      { id: "B", value: distance },
      { id: "C", value: 0 },
      { id: "D", value: distance * 4 },
    ];

    return {
      challenge_id: seed,
      puzzle_type: 'distance',
      interaction_type: 'multiple_choice',
      params: { distance },
      options
    };
  } else {
    const start = getRange(rng, 1, 10);
    const step = getRange(rng, 2, 6);
    const seq = [0, 1, 2, 3, 4].map(i => start + i * step);

    return {
      challenge_id: seed,
      puzzle_type: 'sequence',
      interaction_type: 'single_input',
      params: { seq },
      options: []
    };
  }
};

export const validateAnswer = (seed: number, answer: any): boolean => {
  const rng = seededRandom(seed);
  const puzzleType = getRange(rng, 0, 2);

  if (puzzleType === 0) {
    const rabbits = getRange(rng, 2, 8);
    const chickens = getRange(rng, 5, 15);
    const ducks = getRange(rng, 2, 8);
    return (
      Number(answer.chickens) === chickens &&
      Number(answer.ducks) === ducks &&
      Number(answer.rabbits) === rabbits
    );
  } else if (puzzleType === 1) {
    return answer.choice === "B";
  } else {
    const start = getRange(rng, 1, 10);
    const step = getRange(rng, 2, 6);
    const correct = start + 5 * step;
    return Number(answer.value) === correct;
  }
};