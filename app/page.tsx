'use client';

import { useState, useEffect } from 'react';
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

export default function AwsQuizApp() {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mood, setMood] = useState<MoodState>('idle');
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const [cheerIdx, setCheerIdx] = useState(0);
  const [sympathyIdx, setSympathyIdx] = useState(0);
  const [correctImage, setCorrectImage] = useState(CORRECT_IMAGES[0]);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem('quiz_player_name');
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayerName(saved);
    }
  }, []);

  if (!playerName) {
    return <WelcomeScreen onStart={(name) => { sessionStorage.setItem('quiz_player_name', name); setPlayerName(name); }} />;
  }

  const currentQ = questions[currentQIndex];

  const handleAnswer = (selectedOptionIndex: number) => {
    if (revealed) return;
    const isCorrect = selectedOptionIndex === currentQ.correctIndex;
    setSelectedAnswer(selectedOptionIndex);
    setRevealed(true);

    let newScore = score;
    let newStreak = streak;

    if (isCorrect) {
      newScore = score + 1;
      newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if ([3, 5, 7, 10].includes(newStreak)) setConfettiKey(prev => prev + 1);
      const oldRank = getRank(score);
      const newRank = getRank(newScore);
      if (oldRank.title !== newRank.title) setConfettiKey(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setMood(isCorrect ? 'correct' : 'wrong');
    setCheerIdx(pickRandomIndex(CHEER_MESSAGES.length));
    setSympathyIdx(pickRandomIndex(SYMPATHY_MESSAGES.length));
    if (isCorrect) setCorrectImage(CORRECT_IMAGES[pickRandomIndex(CORRECT_IMAGES.length)]);

    if (currentQIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQIndex(prev => prev + 1);
        setMood('idle');
        setRevealed(false);
        setSelectedAnswer(null);
        setQuestionKey(prev => prev + 1);
      }, 1500);
    } else {
      setTimeout(() => {
        setMood(score >= questions.length / 2 ? 'passed' : 'failed');
        setGameOver(true);
      }, 1500);
    }
  };

  const restartGame = () => {
    setCurrentQIndex(0);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    setMood('idle');
    setRevealed(false);
    setSelectedAnswer(null);
    setQuestionKey(prev => prev + 1);
    setConfettiKey(0);
  };

  const changeName = () => {
    sessionStorage.removeItem('quiz_player_name');
    setPlayerName(null);
  };

  const mascotAnimation = mood === 'correct' ? 'animate-pop' : mood === 'wrong' ? 'animate-shake' : 'animate-floaty';
  const currentRank = getRank(score);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans">
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
            <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
          </div>

          <div key={`card-${questionKey}`} className="w-full bg-white rounded-3xl shadow-xl p-6 space-y-4 animate-bounce-in">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full uppercase tracking-wide font-bold">{currentQ.topic}</span>
              {currentQ.chapter && <span className="text-xs text-purple-400 font-medium">{currentQ.chapter}</span>}
            </div>
            <h2 className="text-base font-bold text-gray-800 leading-relaxed">{currentQ.english}</h2>
            <p className="text-sm text-purple-600 italic bg-purple-50 p-3 rounded-xl border border-purple-200">&ldquo;{currentQ.thai_drama}&rdquo;</p>
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isCorrectOption = idx === currentQ.correctIndex;
                const isWrongSelection = revealed && idx === selectedAnswer && !isCorrectOption;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={revealed}
                    className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex justify-between items-center ${
                      revealed && isCorrectOption
                        ? 'border-green-400 bg-green-50'
                        : isWrongSelection
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-100 hover:border-pink-300 hover:bg-pink-50'
                    } ${revealed ? 'cursor-default' : 'group'}`}
                  >
                    <div>
                      <span className="font-bold text-pink-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      <span className={`font-medium ${revealed && isCorrectOption ? 'text-green-700' : isWrongSelection ? 'text-red-700' : 'text-gray-700 group-hover:text-pink-600'}`}>{opt}</span>
                    </div>
                    {revealed && isCorrectOption && <span className="text-green-500 font-bold text-lg">✓</span>}
                    {isWrongSelection && <span className="text-red-500 font-bold text-lg">✗</span>}
                    {!revealed && <span className="text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>}
                  </button>
                );
              })}
            </div>

            {revealed && currentQ.funFact && (
              <div className="animate-bounce-in bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">💡 รู้หรือไม่? </span>
                {currentQ.funFact}
              </div>
            )}

            {revealed && !currentQ.funFact && (
              <div className="animate-bounce-in bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600">
                <span className="font-bold">🔑 Hint: </span>
                {currentQ.hint_keyword}
              </div>
            )}
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

function WelcomeScreen({ onStart }: { onStart: (name: string) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('nickname') as string;
    if (name && name.trim().length > 0 && name.length <= 20) {
      onStart(name);
    } else {
      alert("ต้องมีชื่อเล่นนะ!! (สูงสุด 20 ตัวอักษร)" + " 😤");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#c084fc 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-md border-2 border-pink-100 z-10 transform transition-all hover:scale-105 duration-300">
        <h1 className="text-3xl font-black text-gray-800 text-center mb-2 tracking-tight">AI EXAM ARENA</h1>
        <p className="text-purple-500 text-center font-bold mb-8 tracking-wider uppercase text-xs">Practice • Play • Pass</p>
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-pointer">
            <img src="/images/idle.png" alt="Waiting..." className="w-56 h-56 object-contain drop-shadow-xl transition-transform duration-500 group-hover:rotate-6 animate-floaty" />
            <div className="absolute -top-4 -right-8 bg-white px-3 py-1.5 rounded-xl shadow-md border-2 border-purple-200 text-xs font-bold text-gray-600 animate-pulse">สวัสดีค่ะ~! 👋</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input id="nickname" name="nickname" type="text" required maxLength={20} placeholder="พิมพ์ชื่อเล่นของคุณ..." className="w-full pl-4 pr-14 py-3 bg-purple-50 border-2 border-purple-200 rounded-xl focus:border-pink-400 focus:ring-0 outline-none transition-colors font-medium text-gray-700 placeholder-purple-300" />
            <span className="absolute right-4 top-3.5 text-gray-400 text-xs">/20</span>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg">
            <span>เริ่มฝึกฝน!</span>{' '}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-8">Powered by your own creativity & love 💖</p>
      </div>
    </div>
  );
}
