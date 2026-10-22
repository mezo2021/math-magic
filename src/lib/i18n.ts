/**
 * ==========================================
 * 📂 المسار: src/lib/i18n.ts
 * ⚙️ الوظيفة: قاموس الترجمة (عربي/إنجليزي) ونصوص الألغاز والحلول.
 * 📅 تاريخ التعديل: 2024-05-24
 * 🛠️ التعديلات: 
 * - إضافة واجهة TranslationSchema.
 * - إضافة نصوص شرح الحل (solution_farm, solution_distance, solution_sequence) المطابقة لكتاب منسا.
 * ==========================================
 */

export type Language = 'ar' | 'en';

export interface TranslationSchema {
  appTitle: string;
  highestScore: string;
  enterName: string;
  startChallenge: string;
  acceptChallenge: string;
  achievements: string;
  newAchievement: string;
  question: string;
  checkAnswer: string;
  correctAnswer: string;
  wrongAnswer: string;
  nextQuestion: string;
  sessionScore: string;
  backToMenu: string;
  congrats: string;
  completedSession: string;
  theme: string;
  language: string;
  
  farm_template: (missing: number) => string;
  distance_template: (distance: number) => string;
  sequence_template: (seq: string) => string;

  solution_farm: (rabbits: number) => string;
  solution_distance: (distance: number) => string;
  solution_sequence: (value: number) => string;

  chickens: string;
  ducks: string;
  rabbits: string;
  km: string;
  zero: string;
}

export const translations: Record<Language, TranslationSchema> = {
  ar: {
    appTitle: "سحر الرياضيات",
    highestScore: "أعلى نتيجة مسجلة:",
    enterName: "أدخل اسمك...",
    startChallenge: "ابدأ التحدي",
    acceptChallenge: "اقبل التحدي وابدأ",
    achievements: "الإنجازات والوسامات",
    newAchievement: "إنجاز جديد:",
    question: "سؤال",
    checkAnswer: "تحقق من الإجابة",
    correctAnswer: "إجابة صحيحة! 🎉 (+10)",
    wrongAnswer: "إجابة خاطئة ⏳",
    nextQuestion: "جاري الانتقال للسؤال التالي...",
    sessionScore: "نقاط هذه الجلسة",
    backToMenu: "العودة للقائمة الرئيسية 🔄",
    congrats: "أحسنت يا",
    completedSession: "لقد أكملت الجلسة.",
    theme: "الثيم",
    language: "اللغة",

    farm_template: (missing: number) => 
      `في مزرعة ذكية تضم دجاجاً، بطاً، وأرانب:\n• عدد البط = نصف عدد الدجاج.\n• عدد الأرانب = ربع عدد البط.\n• مجموع عدد الأرانب والبط = عدد الدجاج ناقصاً منه ${missing} دجاجات.\nفما هو عدد كل حيوان بدقة؟`,
    
    distance_template: (distance: number) => 
      `المسافة بين مدينتي الكويت والأحمدي ${distance} كم. إذا قطعتها مرتين ذهاباً وإياباً، فكم تكون المسافة الثابتة بين البلدين؟`,
    
    sequence_template: (seq: string) => 
      `اكتشف النمط الرياضي وأوجد الرقم المفقود:\n${seq} ، ؟`,

    solution_farm: (rabbits: number) => 
      `الحل: الأرانب = ${rabbits}، إذن البط = ${rabbits * 4}، والدجاج = ${rabbits * 8}. (تحقق: ${rabbits} + ${rabbits * 4} = ${rabbits * 8} - ${rabbits * 3}).`,

    solution_distance: (distance: number) => 
      `الحل: الفخ هنا! السؤال يسأل عن "المسافة الثابتة" وليس المسافة المقطوعة. المسافة الثابتة هي ${distance} كم.`,

    solution_sequence: (value: number) => 
      `الحل: النمط هو إضافة رقم ثابت في كل مرة. الرقم المفقود هو ${value}.`,

    chickens: "الدجاج 🐔",
    ducks: "البط 🦆",
    rabbits: "الأرانب 🐇",
    km: "كم",
    zero: "صفر",
  },

  en: {
    appTitle: "Math Magic",
    highestScore: "Highest Score:",
    enterName: "Enter your name...",
    startChallenge: "Start Challenge",
    acceptChallenge: "Accept Challenge",
    achievements: "Achievements",
    newAchievement: "New Achievement:",
    question: "Question",
    checkAnswer: "Check Answer",
    correctAnswer: "Correct! 🎉 (+10)",
    wrongAnswer: "Wrong! ⏳",
    nextQuestion: "Moving to next question...",
    sessionScore: "Session Score",
    backToMenu: "Back to Main Menu 🔄",
    congrats: "Well done",
    completedSession: "You completed the session.",
    theme: "Theme",
    language: "Language",

    farm_template: (missing: number) => 
      `In a smart farm with chickens, ducks, and rabbits:\n• Ducks = half of chickens.\n• Rabbits = quarter of ducks.\n• Sum of rabbits and ducks = Chickens minus ${missing} chickens.\nWhat is the exact number of each animal?`,
    
    distance_template: (distance: number) => 
      `The distance between Kuwait and Al-Ahmadi is ${distance} km. If you travel it twice (back and forth), what is the fixed distance between the two cities?`,
    
    sequence_template: (seq: string) => 
      `Find the pattern and the missing number:\n${seq} , ?`,

    solution_farm: (rabbits: number) => 
      `Solution: Rabbits = ${rabbits}, so Ducks = ${rabbits * 4}, and Chickens = ${rabbits * 8}. (Check: ${rabbits} + ${rabbits * 4} = ${rabbits * 8} - ${rabbits * 3}).`,

    solution_distance: (distance: number) => 
      `Solution: Trick question! The fixed distance between the cities doesn't change. It remains ${distance} km.`,

    solution_sequence: (value: number) => 
      `Solution: The pattern is adding a constant number. The missing number is ${value}.`,

    chickens: "Chickens 🐔",
    ducks: "Ducks 🦆",
    rabbits: "Rabbits 🐇",
    km: "km",
    zero: "Zero",
  }
};