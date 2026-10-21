'use client';

import { useState, useEffect } from 'react';
import { parseChallengeToken, ChallengeData } from '@/lib/challenge';
import { loadMathEngine } from '@/lib/wasm-loader';
import ChallengeShare from '@/components/ChallengeShare';

export default function MathGame() {
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [wasmError, setWasmError] = useState(false);
  const [wasm, setWasm] = useState<any>(null);
  const [screen, setScreen] = useState('menu'); // menu, puzzle, end
  const [puzzle, setPuzzle] = useState<any>(null);
  const [seed, setSeed] = useState<number>(0);
  
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [inputAnswers, setInputAnswers] = useState<any>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [activeChallenge, setActiveChallenge] = useState<ChallengeData | null>(null);
  const [playerName, setPlayerName] = useState("لاعب مجهول");

  useEffect(() => {
    // 1. تحميل WASM عبر الطبقة المركزية
    async function initEngine() {
      try {
        const module = await loadMathEngine();
        setWasm(module);
        setIsWasmReady(true);
      } catch (e) {
        setWasmError(true);
      }
    }
    initEngine();
    
    // 2. قراءة التحدي من الـ URL
    const urlParams = new URLSearchParams(window.location.search);
    const challengeToken = urlParams.get('challenge');
    if (challengeToken) {
      const challengeData = parseChallengeToken(challengeToken);
      if (challengeData) setActiveChallenge(challengeData);
    }

    // 3. استرجاع أفضل نتيجة
    const savedScore = localStorage.getItem('math_magic_score');
    if (savedScore) setScore(parseInt(savedScore));
  }, []);

  const startGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setScreen('puzzle');
    generateNewPuzzle();
  };

  const generateNewPuzzle = () => {
    if (!isWasmReady || !wasm) return;
    const newSeed = Math.floor(Math.random() * 1000000);
    setSeed(newSeed);
    const newPuzzle = wasm.generate_puzzle(newSeed); 
    setPuzzle(newPuzzle);
    setInputAnswers({});
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const checkAnswer = (answer: any) => {
    if (isAnswered) return;
    setIsAnswered(true);

    const correct = wasm.validate_answer(seed, answer);
    setIsCorrect(correct);

    if (correct) setScore(prev => prev + 10);
    
    setTimeout(() => {
      if (questionsAnswered + 1 >= 5) {
        setScreen('end');
        const currentBest = parseInt(localStorage.getItem('math_magic_score') || '0');
        if (score + (correct ? 10 : 0) > currentBest) {
          localStorage.setItem('math_magic_score', (score + (correct ? 10 : 0)).toString());
        }
      } else {
        setQuestionsAnswered(prev => prev + 1);
        generateNewPuzzle();
      }
    }, 2000);
  };

  // شاشة الخطأ في حال فشل تحميل WASM
  if (wasmError) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-slate-900 p-6 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-4">تعذر تشغيل محرك الألغاز</h1>
      <p className="text-slate-400 mb-6">حدث خطأ أثناء تحميل ملفات النظام. يرجى التأكد من اتصالك بالإنترنت وإعادة المحاولة.</p>
      <button onClick={() => window.location.reload()} className="bg-blue-600 px-6 py-3 rounded-xl font-bold">إعادة المحاولة 🔄</button>
    </div>
  );

  if (!isWasmReady) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-slate-900">
      <div className="text-6xl mb-6 animate-bounce">⚙️</div>
      <div className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        جاري تشغيل محرك Rust...
      </div>
    </div>
  );

  if (screen === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white bg-slate-900">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 text-center">
          سحر الرياضيات
        </h1>
        <p className="text-slate-400 mb-8 text-center">تطبيق يعمل بمحرك Rust فائق السرعة 🚀</p>
        
        {activeChallenge && (
          <div className="bg-slate-800 border-2 border-yellow-500 p-4 rounded-xl mb-6 text-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">⚔️ أنت في وضع التحدي!</h3>
            <p className="text-slate-200">تحدي من: <span className="font-bold text-white">{activeChallenge.playerName}</span></p>
            <p className="text-sm text-slate-300 mt-1">النتيجة المطلوبة: <span className="font-bold text-green-400">{activeChallenge.score + 1} نقطة</span></p>
          </div>
        )}

        <input 
          type="text" 
          placeholder="أدخل اسمك..." 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="mb-6 bg-slate-800 border border-slate-600 p-3 rounded-xl text-center w-full max-w-md"
        />

        <button onClick={startGame} className="w-full max-w-md bg-blue-600 hover:bg-blue-500 p-6 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-lg text-xl font-bold">
          <span className="text-3xl">🧠</span> {activeChallenge ? 'اقبل التحدي وابدأ' : 'ابدأ التحدي'}
        </button>
      </div>
    );
  }

  if (screen === 'end') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white bg-slate-900 text-center">
        <span className="text-6xl mb-4">🎉</span>
        <h1 className="text-4xl font-bold mb-2">أحسنت يا {playerName}!</h1>
        <p className="text-xl text-slate-300 mb-8">لقد أكملت الجلسة.</p>
        
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-600 mb-6 w-full max-w-md">
          <p className="text-slate-400 mb-2">مجموع نقاطك</p>
          <p className="text-5xl font-black text-yellow-400">{score}</p>
        </div>

        {activeChallenge && score > activeChallenge.score && (
          <div className="bg-green-900/50 border border-green-700 p-4 rounded-xl mb-6 w-full max-w-md">
            <p className="text-green-400 font-bold text-lg">🏆 مبروك! لقد تغلبت على {activeChallenge.playerName}!</p>
          </div>
        )}
        
        <div className="w-full max-w-md">
           <ChallengeShare playerName={playerName} score={score} puzzleId="session_1" />
        </div>

        <button onClick={() => setScreen('menu')} className="mt-4 text-slate-400 underline">
          العودة للقائمة الرئيسية 🔄
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white bg-slate-900">
      <header className="flex justify-between items-center p-4 bg-slate-800 shadow-md">
        <div className="text-sm font-bold text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">{puzzle.title} (سؤال {questionsAnswered + 1}/5)</div>
        <div className="text-lg font-bold text-yellow-400">🏆 {score}</div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 max-w-md mx-auto w-full mt-4">
        <div className="w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-6">
          <p className="text-slate-300 mb-4 whitespace-pre-line text-center">{puzzle.description}</p>
          <ul className="list-disc list-inside space-y-2 text-blue-300 text-sm">
            {puzzle.constraints.map((c: any, i: number) => (
              <li key={i}>
                {c.type === 'DIFF' ? `الفرق بين الدجاج والبط هو ${Math.abs(c.value)}.` : 
                 c.type === 'SUM' ? `مجموع عدد الدجاج والأرانب يساوي ${c.value}.` : 
                 c.type === 'WEIGHTED_SUM' ? `إجمالي عدد الأرجل هو ${c.value} رجلاً.` : ''}
              </li>
            ))}
          </ul>
        </div>

        {['chickens', 'ducks', 'rabbits'].map(field => (
          <div key={field} className="w-full mb-3 flex flex-col items-center bg-slate-800 p-3 rounded-xl border border-slate-600">
            <label className="text-sm font-semibold mb-1">
              {field === 'chickens' ? 'الدجاج 🐔' : field === 'ducks' ? 'البط 🦆' : 'الأرانب 🐇'}
            </label>
            <input
              type="number"
              disabled={isAnswered}
              placeholder="0"
              value={inputAnswers[field] || ''}
              onChange={(e) => setInputAnswers({ ...inputAnswers, [field]: e.target.value })}
              className="w-full text-center bg-slate-900 border border-slate-500 rounded-lg p-2 text-xl font-bold text-white focus:outline-none focus:border-blue-400"
            />
          </div>
        ))}

        {!isAnswered && (
          <button onClick={() => checkAnswer(inputAnswers)} className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl mt-2">
            تحقق من الإجابة
          </button>
        )}

        {isAnswered && (
          <div className={`w-full p-4 rounded-xl border mt-4 text-center ${isCorrect ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
            <span className={`font-bold block mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'إجابة صحيحة! 🎉 (+10)' : 'إجابة خاطئة ⏳'}
            </span>
            <p className="text-slate-400 text-xs mt-2">جاري الانتقال للسؤال التالي...</p>
          </div>
        )}
      </main>
    </div>
  );
}