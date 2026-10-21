'use client';

import { useState, useEffect } from 'react';
import { parseChallengeToken, ChallengeData } from '@/lib/challenge';
import { loadMathEngine } from '@/lib/wasm-loader';
import ChallengeShare from '@/components/ChallengeShare';
import { usePlayerStore } from '@/lib/usePlayerStore';
import { ALL_ACHIEVEMENTS } from '@/lib/store';

const AchievementToast = ({ achievement }: { achievement: string | null }) => {
  if (!achievement) return null;
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-yellow-500 text-black px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 border-2 border-yellow-300">
        <span>🏅 إنجاز جديد:</span>
        <span>{achievement}</span>
      </div>
    </div>
  );
};

export default function MathGame() {
  const { player, updatePlayer } = usePlayerStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [wasmError, setWasmError] = useState(false);
  const [wasm, setWasm] = useState<any>(null);
  const [screen, setScreen] = useState('menu');
  const [puzzle, setPuzzle] = useState<any>(null);
  const [seed, setSeed] = useState<number>(0);
  
  const [currentRoundScore, setCurrentRoundScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  // حالات الإدخال
  const [inputAnswers, setInputAnswers] = useState<any>({});
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [singleInput, setSingleInput] = useState<string>('');
  
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [activeChallenge, setActiveChallenge] = useState<ChallengeData | null>(null);
  const [toastAchievement, setToastAchievement] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
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
    
    const urlParams = new URLSearchParams(window.location.search);
    const challengeToken = urlParams.get('challenge');
    if (challengeToken) {
      const challengeData = parseChallengeToken(challengeToken);
      if (challengeData) setActiveChallenge(challengeData);
    }
  }, []);

  if (!isMounted || !player) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">جاري التحميل... ⏳</div>;

  const isBarbie = player.preferences.theme === 'barbie';
  const themeStyles = {
    bg: isBarbie ? 'bg-pink-950 text-white' : 'bg-slate-900 text-white',
    card: isBarbie ? 'bg-pink-900/40 border-pink-500/50' : 'bg-slate-800 border-slate-700',
    primaryBtn: isBarbie ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white',
    accentText: isBarbie ? 'text-pink-400' : 'text-blue-400',
    headerBg: isBarbie ? 'bg-pink-900/60' : 'bg-slate-800',
  };

  const startGame = () => {
    setCurrentRoundScore(0);
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
    setSelectedChoice(null);
    setSingleInput('');
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const checkAnswer = () => {
    if (isAnswered) return;
    setIsAnswered(true);

    let answerPayload = {};
    if (puzzle.interaction_type === 'multi_input_animals') {
      answerPayload = inputAnswers;
    } else if (puzzle.interaction_type === 'multiple_choice') {
      answerPayload = { choice: selectedChoice };
    } else if (puzzle.interaction_type === 'single_input') {
      answerPayload = { value: Number(singleInput) };
    }

    const correct = wasm.validate_answer(seed, answerPayload);
    setIsCorrect(correct);

    const pointsEarned = correct ? 10 : 0;
    const newScore = currentRoundScore + pointsEarned;
    if (correct) setCurrentRoundScore(newScore);
    
    setTimeout(() => {
      if (questionsAnswered + 1 >= 5) {
        setScreen('end');
        
        let justUnlockedStr: string | null = null;

        updatePlayer(prev => {
          const highest = Math.max(prev.progress.highestScore, newScore);
          const solvedCount = prev.progress.totalPuzzlesSolved + (correct ? 1 : 0);
          const newAchievements = [...prev.progress.achievements];

          if (solvedCount >= 1 && !newAchievements.includes('first_win')) {
            newAchievements.push('first_win'); justUnlockedStr = '🐣 المبتدئ الذكي';
          }
          if (newScore >= 50 && !newAchievements.includes('score_50')) {
            newAchievements.push('score_50'); justUnlockedStr = '⚡ السريع';
          }
          if (highest >= 100 && !newAchievements.includes('score_100')) {
            newAchievements.push('score_100'); justUnlockedStr = '🏆 الأسطورة';
          }
          if (activeChallenge && newScore > activeChallenge.score && !newAchievements.includes('challenge_win')) {
            newAchievements.push('challenge_win'); justUnlockedStr = '⚔️ قاهر التحديات';
          }

          return { ...prev, progress: { ...prev.progress, highestScore: highest, totalPuzzlesSolved: solvedCount, achievements: newAchievements } };
        });

        if (justUnlockedStr) {
          setToastAchievement(justUnlockedStr);
          setTimeout(() => setToastAchievement(null), 4000);
        }
      } else {
        setQuestionsAnswered(prev => prev + 1);
        generateNewPuzzle();
      }
    }, 2000);
  };

  const toggleTheme = () => {
    updatePlayer(prev => ({ ...prev, preferences: { ...prev.preferences, theme: prev.preferences.theme === 'ocean' ? 'barbie' : 'ocean' } }));
  };

  if (wasmError) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${themeStyles.bg} p-6 text-center`}>
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-4">تعذر تشغيل محرك الألغاز</h1>
      <button onClick={() => window.location.reload()} className={`${themeStyles.primaryBtn} px-6 py-3 rounded-xl font-bold`}>إعادة المحاولة 🔄</button>
    </div>
  );

  if (!isWasmReady) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${themeStyles.bg}`}>
      <div className="text-6xl mb-6 animate-bounce">⚙️</div>
      <div className={`text-2xl font-bold mb-2 ${themeStyles.accentText}`}>جاري تشغيل محرك Rust...</div>
    </div>
  );

  if (screen === 'menu') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${themeStyles.bg} transition-colors duration-300 relative`}>
        <AchievementToast achievement={toastAchievement} />
        
        <div className="absolute top-4 left-4">
          <button onClick={toggleTheme} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-current opacity-80 hover:opacity-100 transition-opacity">
            🎨 الثيم: {isBarbie ? 'الوردي اللامع 🌸' : 'المحيط 🌊'}
          </button>
        </div>

        <h1 className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isBarbie ? 'from-pink-400 to-purple-400' : 'from-blue-400 to-purple-500'} mb-2 text-center`}>
          سحر الرياضيات
        </h1>
        <p className="text-slate-300 mb-6 text-center text-sm">أعلى نتيجة مسجلة: <span className="text-yellow-400 font-bold">{player.progress.highestScore}</span></p>
        
        {activeChallenge && (
          <div className={`${themeStyles.card} border-2 border-yellow-500 p-4 rounded-xl mb-6 text-center shadow-lg`}>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">⚔️ أنت في وضع التحدي!</h3>
            <p className="text-slate-200">تحدي من: <span className="font-bold text-white">{activeChallenge.playerName}</span></p>
          </div>
        )}

        <input 
          type="text" 
          placeholder="أدخل اسمك..." 
          value={player.profile.name}
          onChange={(e) => {
            const newName = e.target.value;
            updatePlayer(prev => ({ ...prev, profile: { ...prev.profile, name: newName } }));
          }}
          className={`mb-6 ${themeStyles.card} border p-3 rounded-xl text-center w-full max-w-md focus:outline-none`}
        />

        <button onClick={startGame} className={`w-full max-w-md ${themeStyles.primaryBtn} p-6 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-lg text-xl font-bold mb-6`}>
          <span className="text-3xl">🧠</span> {activeChallenge ? 'اقبل التحدي وابدأ' : 'ابدأ التحدي'}
        </button>

        <div className={`w-full max-w-md ${themeStyles.card} p-4 rounded-2xl border`}>
          <h3 className="text-md font-bold mb-3 text-center text-yellow-400">🏅 الإنجازات والوسامات</h3>
          <div className="grid grid-cols-4 gap-2">
            {ALL_ACHIEVEMENTS.map(ach => {
              const unlocked = player.progress.achievements.includes(ach.id);
              return (
                <div key={ach.id} className={`flex flex-col items-center p-2 rounded-xl text-center border transition-all ${unlocked ? 'bg-yellow-500/10 border-yellow-500/50 text-white' : 'bg-black/20 border-slate-700 text-slate-500 opacity-50'}`}>
                  <span className="text-2xl mb-1">{ach.icon}</span>
                  <span className="text-[10px] font-bold leading-tight">{ach.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'end') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${themeStyles.bg} text-center transition-colors duration-300 relative`}>
        <AchievementToast achievement={toastAchievement} />
        <span className="text-6xl mb-4">🎉</span>
        <h1 className="text-4xl font-bold mb-2">أحسنت يا {player.profile.name}!</h1>
        
        <div className={`${themeStyles.card} p-8 rounded-2xl border mb-6 w-full max-w-md shadow-xl`}>
          <p className="text-slate-300 mb-2">نقاط هذه الجلسة</p>
          <p className="text-5xl font-black text-yellow-400">{currentRoundScore}</p>
        </div>

        <div className="w-full max-w-md">
           <ChallengeShare playerName={player.profile.name} score={currentRoundScore} puzzleId="session_1" />
        </div>

        <button onClick={() => setScreen('menu')} className="mt-4 text-slate-300 underline">
          العودة للقائمة الرئيسية 🔄
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${themeStyles.bg} transition-colors duration-300 relative`}>
      <AchievementToast achievement={toastAchievement} />
      
      <header className={`flex justify-between items-center p-4 ${themeStyles.headerBg} shadow-md`}>
        <div className={`text-sm font-bold ${themeStyles.accentText} bg-black/20 px-3 py-1 rounded-full`}>
          {puzzle.title} (سؤال {questionsAnswered + 1}/5)
        </div>
        <div className="text-lg font-bold text-yellow-400">🏆 {currentRoundScore}</div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 max-w-md mx-auto w-full mt-4">
        <div className={`w-full ${themeStyles.card} p-6 rounded-2xl border shadow-xl mb-6`}>
          <p className="text-slate-200 mb-4 whitespace-pre-line text-center">{puzzle.description}</p>
        </div>

        {/* 1. خانات الحيوانات (لغز المزرعة) */}
        {puzzle.interaction_type === 'multi_input_animals' && (
          <>
            {['chickens', 'ducks', 'rabbits'].map(field => (
              <div key={field} className={`w-full mb-3 flex flex-col items-center ${themeStyles.card} p-3 rounded-xl border`}>
                <label className="text-sm font-semibold mb-1">
                  {field === 'chickens' ? 'الدجاج 🐔' : field === 'ducks' ? 'البط 🦆' : 'الأرانب 🐇'}
                </label>
                <input
                  type="number"
                  disabled={isAnswered}
                  placeholder="0"
                  value={inputAnswers[field] || ''}
                  onChange={(e) => setInputAnswers({ ...inputAnswers, [field]: Number(e.target.value) })}
                  className="w-full text-center bg-black/30 border border-slate-600 rounded-lg p-2 text-xl font-bold text-white focus:outline-none focus:border-current"
                />
              </div>
            ))}
          </>
        )}

        {/* 2. أزرار الاختيار (لغز المسافة) */}
        {puzzle.interaction_type === 'multiple_choice' && (
          <div className="w-full space-y-3">
            {puzzle.options.map((opt: any) => (
              <button
                key={opt.id}
                disabled={isAnswered}
                onClick={() => setSelectedChoice(opt.id)}
                className={`w-full p-4 rounded-xl border-2 font-bold text-lg transition-all ${
                  selectedChoice === opt.id 
                    ? (isAnswered ? (isCorrect ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white') : 'bg-blue-600 border-blue-400 text-white')
                    : `${themeStyles.card} hover:bg-slate-700`
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {/* 3. حقل الإدخال الواحد (لغز المتتاليات) */}
        {puzzle.interaction_type === 'single_input' && (
          <div className={`w-full flex flex-col items-center ${themeStyles.card} p-4 rounded-xl border`}>
            <label className="text-sm font-semibold mb-2">اكتب الرقم المفقود:</label>
            <input
              type="number"
              disabled={isAnswered}
              placeholder="0"
              value={singleInput}
              onChange={(e) => setSingleInput(e.target.value)}
              className="w-full text-center bg-black/30 border border-slate-600 rounded-lg p-4 text-2xl font-bold text-white focus:outline-none focus:border-current"
            />
          </div>
        )}

        {!isAnswered && (
          <button 
            onClick={checkAnswer} 
            disabled={
              (puzzle.interaction_type === 'multi_input_animals' && (!inputAnswers.chickens || !inputAnswers.ducks || !inputAnswers.rabbits)) ||
              (puzzle.interaction_type === 'multiple_choice' && !selectedChoice) ||
              (puzzle.interaction_type === 'single_input' && !singleInput)
            }
            className={`w-full ${themeStyles.primaryBtn} font-bold py-3 rounded-xl mt-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            تحقق من الإجابة
          </button>
        )}

        {isAnswered && (
          <div className={`w-full p-4 rounded-xl border mt-4 text-center ${isCorrect ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
            <span className={`font-bold block mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'إجابة صحيحة! 🎉 (+10)' : 'إجابة خاطئة ⏳'}
            </span>
            <p className="text-slate-300 text-xs mt-2">جاري الانتقال للسؤال التالي...</p>
          </div>
        )}
      </main>
    </div>
  );
}