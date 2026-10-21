// src/lib/i18n.ts

export type Language = 'ar' | 'en';

export const translations = {
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

    // قوالب الألغاز كدوال تفاعلية
    farm_template: (missing: number) => 
      `في مزرعة ذكية تضم دجاجاً، بطاً، وأرانب:\n• عدد البط = نصف عدد الدجاج.\n• عدد الأرانب = ربع عدد البط.\n• مجموع عدد الأرانب والبط = عدد الدجاج ناقصاً منه ${missing} دجاجات.\nفما هو عدد كل حيوان بدقة؟`,
    
    distance_template: (distance: number) => 
      `المسافة بين مدينتي الكويت والأحمدي ${distance} كم. إذا قطعتها مرتين ذهاباً وإياباً، فكم تكون المسافة الثابتة بين البلدين؟`,
    
    sequence_template: (seq: string) => 
      `اكتشف النمط الرياضي وأوجد الرقم المفقود:\n${seq} ، ؟`,

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

    // Puzzle Templates
    farm_template: (missing: number) => 
      `In a smart farm with chickens, ducks, and rabbits:\n• Ducks = half of chickens.\n• Rabbits = quarter of ducks.\n• Sum of rabbits and ducks = Chickens minus ${missing} chickens.\nWhat is the exact number of each animal?`,
    
    distance_template: (distance: number) => 
      `The distance between Kuwait and Al-Ahmadi is ${distance} km. If you travel it twice (back and forth), what is the fixed distance between the two cities?`,
    
    sequence_template: (seq: string) => 
      `Find the pattern and the missing number:\n${seq} , ?`,

    chickens: "Chickens 🐔",
    ducks: "Ducks 🦆",
    rabbits: "Rabbits 🐇",
    km: "km",
    zero: "Zero",
  }
};