'use client';

import { useState, useEffect } from 'react';

export default function MathGame() {
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [wasm, setWasm] = useState<any>(null);
  const [screen, setScreen] = useState('menu');
  const [puzzle, setPuzzle] = useState<any>(null);
  
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [inputAnswers, setInputAnswers] = useState<any>({});
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    async function loadWasm() {
      try {
        const module = await import(/* webpackIgnore: true */ '/math-magic/math_engine.js');
        await module.default('/math-magic/math_engine_bg.wasm');
        
        setWasm(module);
        setIsWasmReady(true);
      } catch (e) {
        console.error("فشل تحميل محرك Rust", e);
      }
    }
    loadWasm();
    
    const savedScore = localStorage.getItem('math_magic_score');
    if (savedScore) setScore(parseInt(savedScore));
  }, []);

  const startGame = () => {
    setScore(0);
    localStorage.setItem('math_magic_score', '0');
    setScreen('puzzle');
    generateNewPuzzle();
  };

  const generateNewPuzzle = () => {
    if (!isWasmReady || !wasm) return;
    const randomType = Math.random() > 0.5 ? 'animal' : 'sequence';
    const newPuzzle = randomType === 'animal' ? wasm.generate_animal_puzzle() : wasm.generate_sequence_puzzle();
    setPuzzle(newPuzzle);
    setSelectedAnswer(null);
    setInputAnswers({});
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const checkAnswer = (answer: any) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    let correct = false;

    if (puzzle.interaction_type === 'multi_input') {
      // التحقق الذكي: هل إجابة المستخدم تحقق نفس مجموع الأرجل؟
      const userLegs = (parseInt(answer.chickens) * 2) + (parseInt(answer.ducks) * 2) + (parseInt(answer.rabbits) * 4);
      const correctLegs = (puzzle.correct_answer.chickens * 2) + (puzzle.correct_answer.ducks * 2) + (puzzle.correct_answer.rabbits * 4);
      
      // إذا كان مجموع الأرجل متطابقاً ومجموع الدجاج والأرانب متطابقاً، فالإجابة صحيحة رياضياً
      const userSum = parseInt(answer.chickens) + parseInt(answer.rabbits);
      const correctSum = puzzle.correct_answer.chickens + puzzle.correct_answer.rabbits;

      if (userLegs === correctLegs && userSum === correctSum) {
        correct = true;
      }
    } else {
      correct = String(answer) === String(puzzle.correct_answer);
    }

    setIsCorrect(correct);

    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      localStorage.setItem('math_magic_score', newScore.toString());
    }
  };

  // --- شاشة التحميل الأنيقة ---
  if (!isWasmReady) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-slate-900">
      <div className="text-6xl mb-6 animate-bounce">⚙️</div>
      <div className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        جاري تشغيل محرك Rust...
      </div>
      <p className="text-slate-400 text-sm animate-pulse">يتم تحميل الألغاز لأول مرة (يعمل بعدها بدون إنترنت)</p>
    </div>
  );

  // --- شاشة القائمة الرئيسية ---
  if (screen === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white bg-slate-900">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 text-center">
          سحر الرياضيات
        </h1>
        <p className="text-slate-400 mb-12 text-center">تطبيق يعمل بمحرك Rust فائق السرعة 🚀</p>
        <button onClick={startGame} className="w-full max-w-md bg-slate-800 hover:bg-slate-700 border border-slate-600 p-6 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-lg text-xl font-bold">
          <span className="text-3xl">🧠</span> ابدأ التحدي
        </button>
        {score > 0 && <p className="mt-8 text-yellow-400">أفضل نتيجة لك: {score} 🏆</p>}
      </div>
    );
  }

  // --- شاشة اللغز ---
  return (
    <div className="min-h-screen flex flex-col text-white bg-slate-900">
      <header className="flex justify-between items-center p-4 bg-slate-800 shadow-md">
        <button onClick={() => setScreen('menu')} className="text-slate-400 hover:text-white">← خروج</button>
        <div className="text-sm font-bold text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">{puzzle.category}</div>
        <div className="text-lg font-bold text-yellow-400">🏆 {score}</div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 max-w-md mx-auto w-full mt-4">
        <div className="w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">{puzzle.title}</h2>
          <p className="text-slate-300 mb-6 whitespace-pre-line text-center leading-relaxed">{puzzle.prompt}</p>
        </div>

        {puzzle.interaction_type === 'multi_input' && (
          <div className="w-full space-y-4">
            {puzzle.config.inputs.map((input: any) => (
              <div key={input.name} className="flex flex-col items-center bg-slate-800 p-4 rounded-xl border border-slate-600">
                <span className="text-4xl mb-2">{input.icon}</span>
                <label className="text-sm font-semibold mb-2">{input.label}</label>
                <input
                  type="number"
                  disabled={isAnswered}
                  placeholder={input.placeholder}
                  value={inputAnswers[input.name] || ''}
                  onChange={(e) => setInputAnswers({ ...inputAnswers, [input.name]: e.target.value })}
                  className="w-full text-center bg-slate-900 border border-slate-500 rounded-lg p-2 text-xl font-bold text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            ))}
            {!isAnswered && (
              <button onClick={() => checkAnswer(inputAnswers)} className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl mt-4">
                تحقق من الإجابة
              </button>
            )}
          </div>
        )}

        {puzzle.interaction_type === 'single_input' && !isAnswered && (
           <div className="w-full flex flex-col items-center gap-4">
             <input
                type="number"
                placeholder="اكتب الرقم المفقود هنا"
                value={selectedAnswer || ''}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="w-full text-center bg-slate-800 border-2 border-slate-600 rounded-xl p-4 text-2xl font-bold text-white focus:outline-none focus:border-blue-500"
             />
             <button onClick={() => checkAnswer(selectedAnswer)} className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl">
                تأكيد
             </button>
           </div>
        )}

        {isAnswered && (
          <div className="w-full mt-6">
            <div className={`p-4 rounded-xl border mb-4 text-center ${isCorrect ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
              <span className={`font-bold block mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'إجابة صحيحة! 🎉 (+10)' : 'إجابة خاطئة ⏳'}
              </span>
              <p className="text-slate-300 text-sm whitespace-pre-line">{puzzle.explanation}</p>
            </div>
            <button onClick={generateNewPuzzle} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl">
              اللغز التالي ➔
            </button>
          </div>
        )}
      </main>
    </div>
  );
}