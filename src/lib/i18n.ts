/**
 * ==========================================
 * 📂 المسار: src/lib/i18n.ts
 * ⚙️ الوظيفة: قاموس الترجمة (عربي/إنجليزي) ونصوص الألغاز والحلول.
 * 📅 تاريخ التعديل: 2026-07-24
 * 🛠️ التعديلات: 
 * - تغيير النقاط من (+10) إلى (+20) في اللغتين.
 * - تحديث دالة hint_age لتكون ديناميكية تعتمد على عدد السنوات.
 * - إضافة مفتاح footer لحقوق النشر (2026).
 * - إضافة دالة share_message لنصوص المشاركة المترجمة.
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
  hint: string;
  footer: string;
  
  farm_template: (missing: number) => string;
  distance_template: (distance: number) => string;
  sequence_template: (seq: string) => string;
  age_template: (years: number) => string;

  solution_farm: (rabbits: number) => string;
  solution_distance: (distance: number) => string;
  solution_sequence: (value: number) => string;
  solution_age: (age: number, years: number) => string;

  hint_age: (years: number) => string;
  hint_farm: string;
  hint_distance: string;
  hint_sequence: (seq: number[]) => string;
  share_message: (score: number, url: string) => string;

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
    correctAnswer: "إجابة صحيحة! 🎉 (+20)",
    wrongAnswer: "إجابة خاطئة ⏳",
    nextQuestion: "جاري الانتقال للسؤال التالي...",
    sessionScore: "نقاط هذه الجلسة",
    backToMenu: "العودة للقائمة الرئيسية 🔄",
    congrats: "أحسنت يا",
    completedSession: "لقد أكملت الجلسة.",
    theme: "الثيم",
    language: "اللغة",
    hint: "💡 تلميح",
    footer: "تصميم وتطوير: أ. مصطفى علي اكر - جميع الحقوق محفوظة © 2026",

    farm_template: (missing: number) => 
      `في مزرعة ذكية تضم دجاجاً، بطاً، وأرانب:\n• عدد البط = نصف عدد الدجاج.\n• عدد الأرانب = ربع عدد البط.\n• مجموع عدد الأرانب والبط = عدد الدجاج ناقصاً منه ${missing} دجاجات.\nفما هو عدد كل حيوان بدقة؟`,
    
    distance_template: (distance: number) => 
      `المسافة بين مدينتي الكويت والأحمدي ${distance} كم. إذا قطعتها مرتين ذهاباً وإياباً، فكم تكون المسافة الثابتة بين البلدين؟`,
    
    sequence_template: (seq: string) => 
      `اكتشف النمط الرياضي وأوجد الرقم المفقود:\n${seq} ، ؟`,

    age_template: (years: number) => 
      `سُئِلَ شَخْصٌ عَنْ عُمْرِهِ فَقَالَ:\n• خُذْ ثَلَاثَةَ أَضْعَافِ عُمْرِي بَعْدَ ${years} سَنَوَاتٍ.\n• وَاطْرَحْ مِنْهَا ثَلَاثَةَ أَضْعَافِ عُمْرِي قَبْلَ ${years} سَنَوَاتٍ.\n• سَيَكُونُ لَدَيْكَ عَدَدُ سَنَوَاتِ عُمْرِي.\nفَمَا هُوَ عُمْرُهُ؟`,

    solution_farm: (rabbits: number) => 
      `الحل: الأرانب = ${rabbits}، إذن البط = ${rabbits * 4}، والدجاج = ${rabbits * 8}. (تحقق: ${rabbits} + ${rabbits * 4} = ${rabbits * 8} - ${rabbits * 3}).`,

    solution_distance: (distance: number) => 
      `الحل: الفخ هنا! السؤال يسأل عن "المسافة الثابتة" وليس المسافة المقطوعة. المسافة الثابتة هي ${distance} كم.`,

    solution_sequence: (value: number) => 
      `الحل: النمط هو إضافة رقم ثابت في كل مرة. الرقم المفقود هو ${value}.`,

    solution_age: (age: number, years: number) => 
      `الحل: نفرض العمر = س.\n• بعد ${years} سنوات: 3(س + ${years}) = 3س + ${3*years}\n• قبل ${years} سنوات: 3(س - ${years}) = 3س - ${3*years}\n• بالطرح: (3س + ${3*years}) - (3س - ${3*years}) = س\n• إذن: ${3*years + 3*years} = س\n• العمر هو ${age} عاماً.`,

    hint_age: (years: number) => 
      `تلميح: لاحظ أن (3س) تلغي بعضها البعض. يتبقى لديك (3 × ${years}) + (3 × ${years}) وهو ما يساوي (6 × ${years}). جرب حساب هذا الناتج وقارنه بالخيارات.`,
    hint_farm: "ابدأ بعدد الأرانب: عدد البط يساوي 4 أضعافها، وعدد الدجاج يساوي ضعفي عدد البط. استخدم العدد الناقص للتحقق من إجابتك.",
    hint_distance: "انتبه إلى صياغة السؤال: هل يتغير بُعد المدينتين الحقيقي إذا سافرت بينهما مرة أو عدة مرات؟ ميّز بين المسافة الثابتة والمسافة التي قطعتها.",
    hint_sequence: (seq: number[]) => `احسب الفرق بين أول رقمين (${seq[1] - seq[0]}). تحقّق هل يتكرر الفرق نفسه بين بقية الأرقام.`,

    share_message: (score: number, url: string) => 
      `🧠 تحدي سحر الرياضيات!\nلقد حققت ${score} نقطة! هل تستطيع التغلب عليّ؟ 🏆\n\nاضغط على الرابط لقبول التحدي:\n${url}`,

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
    correctAnswer: "Correct! 🎉 (+20)",
    wrongAnswer: "Wrong! ⏳",
    nextQuestion: "Moving to next question...",
    sessionScore: "Session Score",
    backToMenu: "Back to Main Menu 🔄",
    congrats: "Well done",
    completedSession: "You completed the session.",
    theme: "Theme",
    language: "Language",
    hint: "💡 Hint",
    footer: "Designed & Developed by Mr. Mustafa Ali Eker - All Rights Reserved © 2026",

    farm_template: (missing: number) => 
      `In a smart farm with chickens, ducks, and rabbits:\n• Ducks = half of chickens.\n• Rabbits = quarter of ducks.\n• Sum of rabbits and ducks = Chickens minus ${missing} chickens.\nWhat is the exact number of each animal?`,
    
    distance_template: (distance: number) => 
      `The distance between Kuwait and Al-Ahmadi is ${distance} km. If you travel it twice (back and forth), what is the fixed distance between the two cities?`,
    
    sequence_template: (seq: string) => 
      `Find the pattern and the missing number:\n${seq} , ?`,

    age_template: (years: number) =>
      `A person was asked about his age. He said:\n• Take 3 times my age in ${years} years.\n• Subtract 3 times my age ${years} years ago.\n• You will get my age.\nHow old is he?`,

    solution_farm: (rabbits: number) => 
      `Solution: Rabbits = ${rabbits}, so Ducks = ${rabbits * 4}, and Chickens = ${rabbits * 8}. (Check: ${rabbits} + ${rabbits * 4} = ${rabbits * 8} - ${rabbits * 3}).`,

    solution_distance: (distance: number) => 
      `Solution: Trick question! The fixed distance between the cities doesn't change. It remains ${distance} km.`,

    solution_sequence: (value: number) => 
      `Solution: The pattern is adding a constant number. The missing number is ${value}.`,

    solution_age: (age: number, years: number) => 
      `Solution: Let age = x.\n• In ${years} years: 3(x + ${years}) = 3x + ${3*years}\n• ${years} years ago: 3(x - ${years}) = 3x - ${3*years}\n• Subtracting: (3x + ${3*years}) - (3x - ${3*years}) = x\n• So: ${3*years + 3*years} = x\n• The age is ${age}.`,

    hint_age: (years: number) =>
      `Hint: Notice that (3x) cancels out. You are left with (3 × ${years}) + (3 × ${years}) which equals (6 × ${years}). Try calculating this result and compare it to the options.`,
    hint_farm: "Start with the rabbits: ducks are four times the rabbits, and chickens are twice the ducks. Use the missing-number clue to check your answer.",
    hint_distance: "Pay attention to the wording: does the actual distance between two cities change when you travel between them once or several times? Distinguish fixed distance from distance traveled.",
    hint_sequence: (seq: number[]) => `Find the difference between the first two numbers (${seq[1] - seq[0]}). Check whether the same difference repeats throughout the sequence.`,

    share_message: (score: number, url: string) => 
      `🧠 Math Magic Challenge!\nI scored ${score} points! Can you beat me? 🏆\n\nClick the link to accept the challenge:\n${url}`,

    chickens: "Chickens 🐔",
    ducks: "Ducks 🦆",
    rabbits: "Rabbits 🐇",
    km: "km",
    zero: "Zero",
  }
};