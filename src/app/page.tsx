'use client';

import { useState, useEffect } from 'react';
import { parseChallengeToken, ChallengeData } from '@/lib/challenge';
import { generatePuzzle, validateAnswer, Puzzle } from '@/lib/puzzleEngine';
import ChallengeShare from '@/components/ChallengeShare';
import { usePlayerStore } from '@/lib/usePlayerStore';
import { ALL_ACHIEVEMENTS } from '@/lib/store';
import { translations } from '@/lib/i18n';

const AchievementToast = ({ achievement, text }: { achievement: string | null, text: string }) => {
  if (!achievement) return null;
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.6)] font-black text-xl flex items-center gap-3 border-2 border-yellow-200">
        <span>{text}</span>
        <span>{achievement}</span>
      </div>
    </div>
  );
};

export default function MathGame() {
  const { player, updatePlayer } = usePlayerStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [screen, setScreen] = useState('menu');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  
  const [currentRoundScore, setCurrentRoundScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  const [inputAnswers, setInputAnswers] = useState<any>({});
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [singleInput, setSingleInput] = useState<string>('');
  
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  
  const [activeChallenge, setActiveChallenge] = useState<ChallengeData | null>(null);
  const [toastAchievement, setToastAchievement] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const urlParams = new URLSearchParams(window.location.search);
    const challengeToken = urlParams.get('challenge');
    if (challengeToken) {
      const challengeData = parseChallengeToken(challengeToken);
      if (challengeData) setActiveChallenge(challengeData);
    }
  }, []);

  if (!isMounted || !player) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black text-2xl">جاري التحميل... ⏳</div>;

  const lang = (player.preferences?.language || 'ar') as 'ar' | 'en';
  const t = translations[lang] || translations['ar'];
  const isBarbie = player.preferences?.theme === 'barbie';
  const isRTL = lang === 'ar';

  const themeStyles = {
    bg: isBarbie 
      ? 'bg-gradient-to-br from-[#831843] via-[#4c1d95] to-[#2e1065] text-white' 
      : 'bg-gradient-to-br from-[#030712] via-[#0b1329] to-[#0f172a] text-white',
    card: isBarbie 
      ? 'bg-black/20 backdrop-blur-xl border-2 border-pink-500/40' 
      : 'bg-black/30 backdrop-blur-xl border-2 border-cyan-500/30',
    inputBg: 'bg-black/20 border-2 border-white/30 focus:border-white text-white placeholder-white/60',
    primaryBtn: isBarbie 
      ? 'bg-pink-600 hover:bg-pink-500 text-white border-2 border-pink-400' 
      : 'bg-blue-600 hover:bg-blue-500 text-white border-2 border-cyan-400',
    accentText: isBarbie ? 'text-pink-200' : 'text-cyan-300',
    headerBg: 'bg-transparent backdrop-blur-md border-b border-white/10',
  };

  const generateNewPuzzle = () => {
    const newPuzzle = generatePuzzle(lang);
    setPuzzle(newPuzzle);
    setInputAnswers({});
    setSelectedChoice(null);
    setSingleInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowSolution(false);
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
    setShowSolution(true);

    let answerPayload = {};
    if (puzzle.interaction_type === 'multi_input_animals') {
      answerPayload = inputAnswers;
    } else if (puzzle.interaction_type === 'multiple_choice') {
      answerPayload = { choice: selectedChoice };
    } else if (puzzle.interaction_type === 'single_input') {
      answerPayload = { value: Number(singleInput) };
    }

    const correct = validateAnswer(puzzle, answerPayload);
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
    }, 5000);
  };

  const toggleTheme = () => {
    updatePlayer(prev => ({ ...prev, preferences: { ...prev.preferences, theme: prev.preferences?.theme === 'ocean' ? 'barbie' : 'ocean' } }));
  };

  const toggleLanguage = () => {
    updatePlayer(prev => ({ ...prev, preferences: { ...prev.preferences, language: prev.preferences?.language === 'ar' ? 'en' : 'ar' } }));
  };

  // =====================================================================
  // 🟢 الشاشة الرئيسية (Main Menu)
  // =====================================================================
  if (screen === 'menu') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${themeStyles.bg} transition-all duration-500 relative overflow-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
        <AchievementToast achievement={toastAchievement} text={t.newAchievement} />
        
        <div className="absolute top-6 left-6 flex gap-3 z-10">
          <button onClick={toggleTheme} className="px-5 py-2.5 rounded-2xl text-sm font-black bg-white/10 border-2 border-white/20 hover:bg-white/20 backdrop-blur-md transition-all">
            🎨 {isBarbie ? 'Barbie 🌸' : 'Terminator 🤖'}
          </button>
          <button onClick={toggleLanguage} className="px-5 py-2.5 rounded-2xl text-sm font-black bg-white/10 border-2 border-white/20 hover:bg-white/20 backdrop-blur-md transition-all">
            🌐 {lang === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>

        <h1 className={`text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isBarbie ? 'from-pink-200 to-purple-300' : 'from-cyan-300 to-blue-200'} mb-4 text-center my-6`}>
          {t.appTitle}
        </h1>

        <p className="text-white/90 mb-8 text-center text-lg font-bold">{t.highestScore} <span className="text-yellow-300 font-black text-2xl">{player.progress?.highestScore || 0}</span></p>
        
        {activeChallenge && (
          <div className={`${themeStyles.card} p-5 rounded-3xl mb-6 text-center border-yellow-400/80`}>
            <h3 className="text-2xl font-black text-yellow-300 mb-2">{lang === 'ar' ? '⚔️ أنت في وضع التحدي!' : '⚔️ Challenge Mode!'}</h3>
            <p className="text-white text-lg font-bold">{lang === 'ar' ? 'تحدي من:' : 'From:'} <span className="font-black text-cyan-300">{activeChallenge.playerName}</span></p>
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
          className={`mb-8 ${themeStyles.inputBg} p-5 rounded-3xl text-center w-full max-w-md focus:outline-none text-2xl font-black placeholder-white/50 backdrop-blur-md`}
        />

        <button onClick={startGame} className={`w-full max-w-md ${themeStyles.primaryBtn} p-6 rounded-3xl flex items-center justify-center gap-4 text-3xl font-black mb-10 transition-transform active:scale-95 shadow-xl`}>
          <span className="text-4xl">🧠</span> 
          <span className="text-white drop-shadow-md">{activeChallenge ? t.acceptChallenge : t.startChallenge}</span>
        </button>

        <div className={`w-full max-w-md ${themeStyles.card} p-6 rounded-3xl`}>
          <h3 className="text-lg font-black mb-4 text-center text-yellow-300 tracking-wider">🏅 {t.achievements}</h3>
          <div className="grid grid-cols-4 gap-3">
            {ALL_ACHIEVEMENTS.map(ach => {
              const unlocked = player.progress?.achievements?.includes(ach.id);
              return (
                <div key={ach.id} className={`flex flex-col items-center p-3 rounded-2xl text-center transition-all ${unlocked ? 'bg-gradient-to-b from-yellow-400/30 to-transparent border-2 border-yellow-300 text-white shadow-[0_0_20px_rgba(253,224,71,0.4)]' : 'bg-transparent border border-white/10 text-white/40 opacity-50'}`}>
                  <span className={`text-4xl mb-2 ${!unlocked && 'grayscale opacity-40'}`}>{ach.icon}</span>
                  <span className="text-xs font-black leading-tight">
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

  if (screen === 'end') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${themeStyles.bg} text-center transition-all duration-500 relative overflow-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
        <AchievementToast achievement={toastAchievement} text={t.newAchievement} />
        <span className="text-8xl mb-6 animate-bounce">🎉</span>
        <h1 className="text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">{t.congrats} {player.profile?.name || ''}!</h1>
        <p className="text-2xl text-white/90 mb-8 font-bold">{t.completedSession}</p>
        
        <div className={`${themeStyles.card} p-10 rounded-3xl mb-8 w-full max-w-md`}>
          <p className="text-white/80 mb-2 font-bold text-lg">{t.sessionScore}</p>
          <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 drop-shadow-2xl">{currentRoundScore}</p>
        </div>

        <div className="w-full max-w-md">
           <ChallengeShare playerName={player.profile?.name || 'Player'} score={currentRoundScore} puzzleId="session_1" />
        </div>

        <button onClick={() => setScreen('menu')} className="mt-8 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-black text-xl transition-all shadow-xl">
          {t.backToMenu}
        </button>
      </div>
    );
  }

  // شاشة اللغز (Puzzle Screen)
  return (
    <div className={`min-h-screen flex flex-col ${themeStyles.bg} transition-all duration-500 relative overflow-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
      <AchievementToast achievement={toastAchievement} text={t.newAchievement} />
      
      <header className={`flex justify-between items-center p-6 ${themeStyles.headerBg} shadow-lg z-10`}>
        <div className={`text-lg font-black ${themeStyles.accentText} bg-white/10 px-5 py-2 rounded-full border border-white/20`}>
          {t.question} {questionsAnswered + 1}/5
        </div>
        <div className="text-2xl font-black text-yellow-300 drop-shadow-lg">🏆 {currentRoundScore}</div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 max-w-md mx-auto w-full mt-4 z-10">
        
        <div className={`w-full ${themeStyles.card} p-8 rounded-3xl mb-8 flex items-center justify-center min-h-[170px]`}>
          <p className="text-white whitespace-pre-line text-center text-2xl leading-relaxed font-black drop-shadow-md">
            {puzzle?.puzzle_type === 'farm' ? t.farm_template(puzzle.params.missing) : 
             puzzle?.puzzle_type === 'distance' ? t.distance_template(puzzle.params.distance) : 
             puzzle?.puzzle_type === 'sequence' ? t.sequence_template(puzzle.params.seq.join(' , ')) : ''}
          </p>
        </div>

        {puzzle?.interaction_type === 'multi_input_animals' && (
          <>
            {['chickens', 'ducks', 'rabbits'].map(field => (
              <div key={field} className={`w-full mb-4 flex flex-col items-center ${themeStyles.card} p-4 rounded-3xl`}>
                <label className="text-lg font-black mb-2 text-white">{t[field as keyof typeof t]}</label>
                <input
                  type="number"
                  disabled={isAnswered}
                  placeholder="0"
                  value={inputAnswers[field] || ''}
                  onChange={(e) => setInputAnswers({ ...inputAnswers, [field]: Number(e.target.value) })}
                  className={`w-full text-center ${themeStyles.inputBg} rounded-2xl p-4 text-3xl font-black focus:outline-none transition-all`}
                />
              </div>
            ))}
          </>
        )}

        {puzzle?.interaction_type === 'multiple_choice' && (
          <div className="w-full space-y-4">
            {puzzle.options?.map((opt: any) => (
              <button
                key={opt.id}
                disabled={isAnswered}
                onClick={() => setSelectedChoice(opt.id)}
                className={`w-full p-6 rounded-3xl border-3 font-black text-2xl transition-all duration-200 ${
                  selectedChoice === opt.id 
                    ? (isAnswered ? (isCorrect ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-green-300 text-white shadow-[0_0_30px_rgba(16,185,129,0.7)]' : 'bg-gradient-to-r from-red-500 to-rose-600 border-red-300 text-white shadow-[0_0_30px_rgba(239,68,68,0.7)]') : 'bg-white/30 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.5)]')
                    : `${themeStyles.card} hover:bg-white/20`
                }`}
              >
                {opt.value === 0 ? t.zero : `${opt.value} ${t.km}`}
              </button>
            ))}
          </div>
        )}

        {puzzle?.interaction_type === 'single_input' && (
          <div className={`w-full flex flex-col items-center ${themeStyles.card} p-5 rounded-3xl`}>
             <input
              type="number"
              disabled={isAnswered}
              placeholder="0"
              value={singleInput}
              onChange={(e) => setSingleInput(e.target.value)}
              className={`w-full text-center ${themeStyles.inputBg} rounded-2xl p-5 text-4xl font-black focus:outline-none transition-all`}
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
            className={`w-full ${themeStyles.primaryBtn} font-black py-5 rounded-3xl mt-8 text-2xl transition-transform disabled:opacity-40`}
          >
            {t.checkAnswer}
          </button>
        )}

        {isAnswered && (
          <div className={`w-full p-6 rounded-3xl border-2 mt-6 text-center transition-all ${isCorrect ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]' : 'bg-red-500/20 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]'}`}>
            <span className={`font-black block mb-2 text-3xl ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
              {isCorrect ? t.correctAnswer : t.wrongAnswer}
            </span>
            
            {showSolution && puzzle && (
              <p className="text-white text-base font-bold leading-relaxed mt-4 pt-4 border-t border-white/20 text-right" dir={isRTL ? 'rtl' : 'ltr'}>
                {puzzle.puzzle_type === 'farm' ? t.solution_farm(puzzle.correct_answer.rabbits) : 
                 puzzle.puzzle_type === 'distance' ? t.solution_distance(puzzle.params.distance) : 
                 puzzle.puzzle_type === 'sequence' ? t.solution_sequence(puzzle.correct_answer.value) : ''}
              </p>
            )}
            
            <p className="text-white/70 text-sm font-bold mt-4">{t.nextQuestion}</p>
          </div>
        )}
      </main>
    </div>
  );
}