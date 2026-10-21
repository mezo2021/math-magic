'use client';

import { useState, useEffect } from 'react';
import { parseChallengeToken, ChallengeData } from '@/lib/challenge';
import { loadMathEngine } from '@/lib/wasm-loader';
import ChallengeShare from '@/components/ChallengeShare';
import { usePlayerStore } from '@/lib/usePlayerStore';
import { ALL_ACHIEVEMENTS } from '@/lib/store';
import { translations } from '@/lib/i18n';

const AchievementToast = ({ achievement, text }: { achievement: string | null, text: string }) => {
  if (!achievement) return null;
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-yellow-500 text-black px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 border-2 border-yellow-300">
        <span>{text}</span>
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
  
  const [inputAnswers, setInputAnswers] = useState<any>({});
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [singleInput, setSingleInput] = useState<string>('');
  
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // 🆕 تغيير النوع ليقبل نصوص الأخطاء
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [activeChallenge, setActiveChallenge] = useState<ChallengeData | null>(null);
  const [toastAchievement, setToastAchievement] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    async function initEngine() {
      try {
        const module = await loadMathEngine();
        setWasm(module);
        setIsWasmReady(true);
      } catch (e: any) {
        setWasmError(true);
        console.error("WASM Load Error:", e);
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

  const lang = player.preferences?.language || 'ar';
  const t = translations[lang] || translations['ar'];
  const isBarbie = player.preferences?.theme === 'barbie';
  const isRTL = lang === 'ar';

  const themeStyles = {
    bg: isBarbie ? 'bg-fuchsia-950 text-white' : 'bg-slate-900 text-white',
    card: isBarbie ? 'bg-fuchsia-900/30 border-fuchsia-500/40' : 'bg-slate-800 border-slate-700',
    primaryBtn: isBarbie ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)]' : 'bg-blue-600 hover:bg-blue-500 text-white',
    accentText: isBarbie ? 'text-fuchsia-400' : 'text-blue-400',
    headerBg: isBarbie ? 'bg-fuchsia-900/50' : 'bg-slate-800',
  };

  const generateNewPuzzle = () => {
    if (!isWasmReady || !wasm) return;
    setGenerationError(null); 
    
    try {
      if (typeof wasm.generate_puzzle !== 'function') {
        throw new Error("الدالة generate_puzzle غير موجودة في ملف الـ WASM. تأكد من عمل Build صحيح.");
      }

      const newSeed = Math.floor(Math.random() * 1000000);
      console.log("⏳ جاري توليد اللغز بالـ Seed:", newSeed);
      const newPuzzle = wasm.generate_puzzle(newSeed); 
      
      if (!newPuzzle) {
        throw new Error("المحرك أعاد قيمة فارغة (null/undefined). قد يكون هناك خطأ في كود Rust.");
      }

      setSeed(newSeed);
      setPuzzle(newPuzzle);
      setInputAnswers({});
      setSelectedChoice(null);
      setSingleInput('');
      setIsAnswered(false);
      setIsCorrect(false);
    } catch (error: any) {
      console.error("🚨 WASM Generation Error:", error);
      // 🆕 عرض نص الخطأ على الشاشة
      setGenerationError(error.message || String(error));
    }
  };

  const startGame = () => {
    setCurrentRoundScore(0);
    setQuestionsAnswered(0);
    setScreen('puzzle');
    generateNewPuzzle();
  };

  const checkAnswer = () => {
    if (isAnswered || !puzzle) return;
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
          const newAchievements = [...(prev.progress.achievements || [])];

          if (solvedCount >= 1 && !newAchievements.includes('first_win')) {
            newAchievements.push('first_win'); justUnlockedStr = lang === 'ar' ? '🐣 المبتدئ الذكي' : '🐣 Smart Beginner';
          }
          if (newScore >= 50 && !newAchievements.includes('score_50')) {
            newAchievements.push('score_50'); justUnlockedStr = lang === 'ar' ? '⚡ السريع' : '⚡ Fast';
          }
          if (highest >= 100 && !newAchievements.includes('score_100')) {
            newAchievements.push('score_100'); justUnlockedStr = lang === 'ar' ? '🏆 الأسطورة' : '🏆 Legend';
          }
          if (activeChallenge && newScore > activeChallenge.score && !newAchievements.includes('challenge_win')) {
            newAchievements.push('challenge_win'); justUnlockedStr = lang === 'ar' ? '⚔️ قاهر التحديات' : '⚔️ Challenger';
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
    updatePlayer(prev => ({ ...prev, preferences: { ...prev.preferences, theme: prev.preferences?.theme === 'ocean' ? 'barbie' : 'ocean' } }));
  };

  const toggleLanguage = () => {
    updatePlayer(prev => ({ ...prev, preferences: { ...prev.preferences, language: prev.preferences?.language === 'ar' ? 'en' : 'ar' } }));
  };

  const renderPuzzleText = () => {
    if (!puzzle || !puzzle.params) return "";
    if (puzzle.puzzle_type === 'farm') {
      return t.farm_template(puzzle.params.missing || 0);
    } else if (puzzle.puzzle_type === 'distance') {
      return t.distance_template(puzzle.params.distance || 0);
    } else if (puzzle.puzzle_type === 'sequence') {
      return t.sequence_template((puzzle.params.seq || []).join(" , "));
    }
    return "";
  };

  if (wasmError) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${themeStyles.bg} p-6 text-center`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'تعذر تشغيل محرك الألغاز' : 'Failed to load puzzle engine'}</h1>
      <button onClick={() => window.location.reload()} className={`${themeStyles.primaryBtn} px-6 py-3 rounded-xl font-bold`}>{lang === 'ar' ? 'إعادة المحاولة 🔄' : 'Retry 🔄'}</button>
    </div>
  );

  if (!isWasmReady) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${themeStyles.bg}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-6xl mb-6 animate-bounce">⚙️</div>
      <div className={`text-2xl font-bold mb-2 ${themeStyles.accentText}`}>{lang === 'ar' ? 'جاري تشغيل محرك Rust...' : 'Loading Rust Engine...'}</div>
    </div>
  );

  if (screen === 'menu') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${themeStyles.bg} transition-colors duration-300 relative`} dir={isRTL ? 'rtl' : 'ltr'}>
        <AchievementToast achievement={toastAchievement} text={t.newAchievement} />
        
        <div className="absolute top-4 left-4 flex gap-2">
          <button onClick={toggleTheme} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-current opacity-80 hover:opacity-100 transition-opacity">
            🎨 {isBarbie ? 'Barbie 🌸' : 'Ocean 🌊'}
          </button>
          <button onClick={toggleLanguage} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-current opacity-80 hover:opacity-100 transition-opacity">
            🌐 {lang === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>

        <h1 className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isBarbie ? 'from-fuchsia-400 to-purple-400' : 'from-blue-400 to-purple-500'} mb-2 text-center`}>
          {t.appTitle}
        </h1>
        <p className="text-slate-300 mb-6 text-center text-sm">{t.highestScore} <span className="text-yellow-400 font-bold">{player.progress?.highestScore || 0}</span></p>
        
        {activeChallenge && (
          <div className={`${themeStyles.card} border-2 border-yellow-500 p-4 rounded-xl mb-6 text-center shadow-lg`}>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">{lang === 'ar' ? '⚔️ أنت في وضع التحدي!' : '⚔️ Challenge Mode!'}</h3>
            <p className="text-slate-200">{lang === 'ar' ? 'تحدي من:' : 'From:'} <span className="font-bold text-white">{activeChallenge.playerName}</span></p>
          </div>
        )}

        <input 
          type="text" 
          placeholder={t.enterName} 
          value={player.profile?.name || ''}
          onChange={(e) => {
            const newName = e.target.value;
            updatePlayer(prev => ({ ...prev, profile: { ...prev.profile, name: newName } }));
          }}
          className={`mb-6 ${themeStyles.card} border p-3 rounded-xl text-center w-full max-w-md focus:outline-none`}
        />

        <button onClick={startGame} className={`w-full max-w-md ${themeStyles.primaryBtn} p-6 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-lg text-xl font-bold mb-6`}>
          <span className="text-3xl">🧠</span> {activeChallenge ? t.acceptChallenge : t.startChallenge}
        </button>

        <div className={`w-full max-w-md ${themeStyles.card} p-4 rounded-2xl border`}>
          <h3 className="text-md font-bold mb-3 text-center text-yellow-400">🏅 {t.achievements}</h3>
          <div className="grid grid-cols-4 gap-2">
            {ALL_ACHIEVEMENTS.map(ach => {
              const unlocked = player.progress?.achievements?.includes(ach.id);
              return (
                <div key={ach.id} className={`flex flex-col items-center p-2 rounded-xl text-center border transition-all ${unlocked ? 'bg-yellow-500/10 border-yellow-500/50 text-white' : 'bg-black/20 border-slate-700 text-slate-500 opacity-50'}`}>
                  <span className="text-2xl mb-1">{ach.icon}</span>
                  <span className="text-[10px] font-bold leading-tight">
                    {lang === 'ar' ? ach.title : (ach.id === 'first_win' ? 'Beginner' : ach.id === 'score_50' ? 'Fast' : ach.id === 'score_100' ? 'Legend' : 'Challenger')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 🛡️ شاشة عرض الخطأ (الآن تعرض النص الحقيقي للخطأ)
  if (screen === 'puzzle' && !puzzle) {
    if (generationError) {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${themeStyles.bg} p-6 text-center`} dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-6xl mb-4">💥</div>
          <h1 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'فشل توليد اللغز' : 'Puzzle generation failed'}</h1>
          
          {/* 🆕 عرض نص الخطأ هنا */}
          <div className="bg-black/50 border border-red-500/50 p-4 rounded-xl mb-6 w-full max-w-md overflow-auto text-left" dir="ltr">
            <code className="text-red-400 font-mono text-sm break-words">
              {generationError}
            </code>
          </div>

          <div className="flex gap-4">
            <button onClick={generateNewPuzzle} className={`${themeStyles.primaryBtn} px-6 py-3 rounded-xl font-bold`}>
              {lang === 'ar' ? 'إعادة المحاولة 🔄' : 'Retry 🔄'}
            </button>
            <button onClick={() => setScreen('menu')} className={`bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold`}>
              {lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
            </button>
          </div>
        </div>
      );
    }
    return <div className={`min-h-screen flex items-center justify-center ${themeStyles.bg}`}>{lang === 'ar' ? 'جاري توليد اللغز... ⏳' : 'Generating puzzle... ⏳'}</div>;
  }

  if (screen === 'end') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${themeStyles.bg} text-center transition-colors duration-300 relative`} dir={isRTL ? 'rtl' : 'ltr'}>
        <AchievementToast achievement={toastAchievement} text={t.newAchievement} />
        <span className="text-6xl mb-4">🎉</span>
        <h1 className="text-4xl font-bold mb-2">{t.congrats} {player.profile?.name || ''}!</h1>
        <p className="text-xl text-slate-300 mb-8">{t.completedSession}</p>
        
        <div className={`${themeStyles.card} p-8 rounded-2xl border mb-6 w-full max-w-md shadow-xl`}>
          <p className="text-slate-300 mb-2">{t.sessionScore}</p>
          <p className="text-5xl font-black text-yellow-400">{currentRoundScore}</p>
        </div>

        <div className="w-full max-w-md">
           <ChallengeShare playerName={player.profile?.name || 'Player'} score={currentRoundScore} puzzleId="session_1" />
        </div>

        <button onClick={() => setScreen('menu')} className="mt-4 text-slate-300 underline">
          {t.backToMenu}
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${themeStyles.bg} transition-colors duration-300 relative`} dir={isRTL ? 'rtl' : 'ltr'}>
      <AchievementToast achievement={toastAchievement} text={t.newAchievement} />
      
      <header className={`flex justify-between items-center p-4 ${themeStyles.headerBg} shadow-md`}>
        <div className={`text-sm font-bold ${themeStyles.accentText} bg-black/20 px-3 py-1 rounded-full`}>
          {t.question} {questionsAnswered + 1}/5
        </div>
        <div className="text-lg font-bold text-yellow-400">🏆 {currentRoundScore}</div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 max-w-md mx-auto w-full mt-4">
        <div className={`w-full ${themeStyles.card} p-6 rounded-2xl border shadow-xl mb-6`}>
          <p className="text-slate-200 mb-4 whitespace-pre-line text-center text-lg leading-relaxed">{renderPuzzleText()}</p>
        </div>

        {puzzle?.interaction_type === 'multi_input_animals' && (
          <>
            {['chickens', 'ducks', 'rabbits'].map(field => (
              <div key={field} className={`w-full mb-3 flex flex-col items-center ${themeStyles.card} p-3 rounded-xl border`}>
                <label className="text-sm font-semibold mb-1">{t[field as keyof typeof t]}</label>
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

        {puzzle?.interaction_type === 'multiple_choice' && (
          <div className="w-full space-y-3">
            {puzzle.options?.map((opt: any) => (
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
                {opt.value === 0 ? t.zero : `${opt.value} ${t.km}`}
              </button>
            ))}
          </div>
        )}

        {puzzle?.interaction_type === 'single_input' && (
          <div className={`w-full flex flex-col items-center ${themeStyles.card} p-4 rounded-xl border`}>
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
              (puzzle?.interaction_type === 'multi_input_animals' && (!inputAnswers.chickens || !inputAnswers.ducks || !inputAnswers.rabbits)) ||
              (puzzle?.interaction_type === 'multiple_choice' && !selectedChoice) ||
              (puzzle?.interaction_type === 'single_input' && !singleInput)
            }
            className={`w-full ${themeStyles.primaryBtn} font-bold py-3 rounded-xl mt-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t.checkAnswer}
          </button>
        )}

        {isAnswered && (
          <div className={`w-full p-4 rounded-xl border mt-4 text-center ${isCorrect ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
            <span className={`font-bold block mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? t.correctAnswer : t.wrongAnswer}
            </span>
            <p className="text-slate-300 text-xs mt-2">{t.nextQuestion}</p>
          </div>
        )}
      </main>
    </div>
  );
}