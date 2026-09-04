'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MOOD_IMAGES, questions, MoodState, CHEER_MESSAGES, SYMPATHY_MESSAGES, CORRECT_IMAGES, RANKS } from '@/data/questions';

function pickRandomIndex(length: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % length;
}

function getRank(score: number) {
  return RANKS.filter(r => score >= r.min).at(-1) ?? RANKS[0];
}

function getParticles(count: number) {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#fbbf24', '#34d399', '#fb923c'];
  const sizes = ['w-2 h-3', 'w-1.5 h-2.5', 'w-2.5 h-2', 'w-1 h-4'];
  return Array.from({ length: count }, (_, i) => {
    const r = new Uint32Array(4);
    crypto.getRandomValues(r);
    return {
      id: i,
      color: colors[i % colors.length],
      size: sizes[i % sizes.length],
      left: `${r[0] % 100}%`,
      delay: `${(r[1] % 500) / 1000}s`,
      dx: `${(Number(r[2] % 401)) - 200}px`,
      rot: `${r[3] % 720}deg`,
      dur: `${1.5 + (r[0] % 1500) / 1000}s`,
    };
  });
}

function ConfettiBurst({ burstKey }: { burstKey: number }) {
  if (burstKey === 0) return null;
  const particles = getParticles(30);
  return (
    <div key={burstKey} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className={`confetti-piece ${p.size}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.dur,
            '--dx': p.dx,
            '--rot': p.rot,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// Hook สำหรับตรวจจับ swipe บน touch device
function useSwipe(onUp: () => void, onDown: () => void) {
  const startYRef = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - startYRef.current;
    startYRef.current = null;
    if (Math.abs(deltaY) < 60) return; // threshold ต่ำสุด ~60px
    if (deltaY < 0) onUp();
    else onDown();
  }, [onUp, onDown]);

  return { onTouchStart, onTouchEnd };
}

export default function QuizPage() {
  // --- State declarations (ทั้งหมด ต้องอยู่ก่อน return/hook ใดๆ) ---
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mood, setMood] = useState<MoodState>('idle');
  const [gameOver, setGameOver] = useState(false);
  // answers: Map<questionIndex, selectedOptionIndex>
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [cheerIdx, setCheerIdx] = useState(0);
  const [sympathyIdx, setSympathyIdx] = useState(0);
  const [correctImage, setCorrectImage] = useState(CORRECT_IMAGES[0]);
  const [confettiKey, setConfettiKey] = useState(0);
  const [pageKey, setPageKey] = useState(0);

  // --- Derived values ---
  const answeredMap = answers;
  const hasAnswered = answeredMap.has(currentQIndex);
  const showResult = hasAnswered;
  const answeredCount = answeredMap.size;
  const currentQ = questions[currentQIndex];
  const selectedAnswer = showResult ? answeredMap.get(currentQIndex) : undefined;

  // --- Effects & hooks (ต้องเรียกในลำดับเดิมทุกครั้ง) ---
  useEffect(() => {
    const saved = sessionStorage.getItem('quiz_player_name');
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayerName(saved);
    }
  }, []);

  // Navigation functions — ใช้ useCallback เพื่อ prevent extra renders
  const goToNext = useCallback(() => {
    if (answeredCount >= questions.length) {
      setMood(score >= questions.length / 2 ? 'passed' : 'failed');
      setGameOver(true);
    } else if (currentQIndex < questions.length - 1) {
      setPageKey(prev => prev + 1);
      setCurrentQIndex(prev => prev + 1);
      setMood('idle');
    }
  }, [currentQIndex, score, answeredCount]);

  const goToPrev = useCallback(() => {
    if (currentQIndex > 0) {
      setPageKey(prev => prev + 1);
      setCurrentQIndex(prev => prev - 1);
      setMood('idle');
    }
  }, [currentQIndex]);

  // Keyboard shortcuts (← →)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentQIndex < questions.length - 1) goToNext();
      if (e.key === 'ArrowLeft' && currentQIndex > 0) goToPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentQIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Swipe detection สำหรับ mobile
  const swipe = useSwipe(goToNext, goToPrev);

  // --- Early return (หลังจาก hooks ทั้งหมดแล้ว) ---
  if (!playerName) {
    // ถ้ายังไม่มีชื่อ redirect ไป welcome
    window.location.href = '/welcome';
    return null;
  }

  // --- Handlers ---
  const handleAnswer = (selectedOptionIndex: number) => {
    if (hasAnswered) return;
    const isCorrect = selectedOptionIndex === currentQ.correctIndex;

    // Store answer immutably
    const newMap = new Map(answeredMap);
    newMap.set(currentQIndex, selectedOptionIndex);
    setAnswers(newMap);

    if (isCorrect) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if ([3, 5, 7, 10].includes(newStreak)) setConfettiKey(prev => prev + 1);
      const oldRank = getRank(score);
      const newRank = getRank(newScore);
      if (oldRank.title !== newRank.title) setConfettiKey(prev => prev + 1);
      setCorrectImage(CORRECT_IMAGES[pickRandomIndex(CORRECT_IMAGES.length)]);
    } else {
      setStreak(0);
    }

    setMood(isCorrect ? 'correct' : 'wrong');
    setCheerIdx(pickRandomIndex(CHEER_MESSAGES.length));
    setSympathyIdx(pickRandomIndex(SYMPATHY_MESSAGES.length));
  };

  const restartGame = () => {
    setCurrentQIndex(0);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    setMood('idle');
    setAnswers(new Map());
    setPageKey(prev => prev + 1);
    setConfettiKey(0);
  };

  const changeName = () => {
    sessionStorage.removeItem('quiz_player_name');
    setPlayerName(null);
    window.location.href = '/welcome';
  };

  const mascotAnimation = mood === 'correct' ? 'animate-pop' : mood === 'wrong' ? 'animate-shake' : 'animate-floaty';
  const currentRank = getRank(score);

  return (
    <div {...swipe} className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans touch-pan-y">
      <ConfettiBurst burstKey={confettiKey} />
      <header className="w-full max-w-lg flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">AI EXAM ARENA</h1>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{currentRank.emoji} {currentRank.title}</span>
        </div>
        <button onClick={changeName} className="text-xs text-gray-400 hover:text-pink-500 transition-colors">เปลี่ยนชื่อ 👋</button>
      </header>

      {!gameOver ? (
        <div className="w-full max-w-lg flex flex-col gap-6 pb-8">
          <div key={`mascot-${mood}-${currentQIndex}`} className="flex flex-col items-center relative">
            {streak > 1 && (
              <div className="absolute -top-3 -left-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce-in z-10">
                🔥 x{streak}
              </div>
            )}
            <img src={mood === 'correct' ? correctImage : MOOD_IMAGES[mood]} alt={mood} className={`w-48 h-48 object-contain drop-shadow-xl transition-all duration-300 ${mascotAnimation}`} />
            <div className="absolute top-2 right-[-10px] sm:right-[-30px] w-36 bg-white px-3 py-2 rounded-xl shadow-md border-2 border-purple-200 text-xs font-bold text-gray-700 animate-bounce">
              {mood === 'idle' && `พร้อมแล้วนะ ${playerName}~! 💖`}
              {mood === 'correct' && CHEER_MESSAGES[cheerIdx]}
              {mood === 'wrong' && SYMPATHY_MESSAGES[sympathyIdx]}
            </div>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${((answeredCount + 1) / questions.length) * 100}%` }}></div>
          </div>

          <div key={`card-${pageKey}`} className="w-full bg-white rounded-3xl shadow-xl p-6 space-y-4 animate-bounce-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full uppercase tracking-wide font-bold">ข้อ {currentQIndex + 1}/{questions.length}</span>
                {currentQ.chapter && <span className="text-xs text-purple-400 font-medium">{currentQ.chapter}</span>}
              </div>
              <span className="text-xs text-gray-400">
                {showResult ? '✓ ตอบแล้ว' : '⚡ ตอบเลย!'}
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-800 leading-relaxed">{currentQ.english}</h2>
            <p className="text-sm text-purple-600 italic bg-purple-50 p-3 rounded-xl border border-purple-200">&ldquo;{currentQ.thai_drama}&rdquo;</p>
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isCorrectOption = idx === currentQ.correctIndex;
                const isWrongSelection = showResult && selectedAnswer === idx && !isCorrectOption;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex justify-between items-center ${
                      showResult && isCorrectOption
                        ? 'border-green-400 bg-green-50'
                        : isWrongSelection
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-100 hover:border-pink-300 hover:bg-pink-50'
                    } ${showResult ? 'cursor-default' : 'group'}`}
                  >
                    <div>
                      <span className="font-bold text-pink-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      <span className={`font-medium ${showResult && isCorrectOption ? 'text-green-700' : isWrongSelection ? 'text-red-700' : 'text-gray-700 group-hover:text-pink-600'}`}>{opt}</span>
                    </div>
                    {showResult && isCorrectOption && <span className="text-green-500 font-bold text-lg">✓</span>}
                    {isWrongSelection && <span className="text-red-500 font-bold text-lg">✗</span>}
                    {!showResult && <span className="text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>}
                  </button>
                );
              })}
            </div>

            {showResult && currentQ.funFact && (
              <div className="animate-bounce-in bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">💡 รู้หรือไม่? </span>
                {currentQ.funFact}
              </div>
            )}

            {showResult && !currentQ.funFact && (
              <div className="animate-bounce-in bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600">
                <span className="font-bold">🔑 Hint: </span>
                {currentQ.hint_keyword}
              </div>
            )}
          </div>

          {/* Navigation buttons — Desktop เท่านั้น */}
          <div className="hidden md:flex w-full max-w-lg items-center justify-between gap-4">
            <button
              onClick={goToPrev}
              disabled={currentQIndex === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all active:scale-95 ${
                currentQIndex === 0
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 shadow-sm'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              ข้อก่อนหน้า
            </button>
            <button
              onClick={goToNext}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all active:scale-95 ${
                answeredCount >= questions.length
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-pink-500/30'
              }`}
            >
              ข้อถัดไป
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg text-center bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-4 animate-bounce-in">
          <img src={MOOD_IMAGES[mood]} alt="Result" className={`w-40 h-40 object-contain mx-auto drop-shadow-xl ${mood === 'passed' ? 'animate-wiggle' : ''}`} />
          <h1 className="text-3xl font-extrabold text-gray-800">{score >= questions.length / 2 ? '🎉 PASSED!' : '😭 TRY AGAIN'}</h1>
          <p className="text-gray-500 text-sm">คุณได้คะแนน</p>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">{score}/{questions.length}</div>
          <p className="text-gray-600 text-sm">
            {score >= questions.length / 2 ? `${playerName} เก่งมาก! พร้อมไปสอบจริงแล้ว~ ✨` : `${playerName} อย่าท้อใจนะ ลองทบทวนแล้วมาใหม่! 💪`}
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={restartGame} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-pink-500/30 active:scale-95 transition-all">เล่นอีกครั้ง 🚀</button>
          </div>
          <button onClick={changeName} className="block w-full text-xs text-gray-400 hover:text-pink-500 underline mt-2">เปลี่ยนชื่อเล่น</button>
        </div>
      )}
    </div>
  );
}
