interface QuizResultSummaryProps {
  answeredCount: number;
  isCompleted: boolean;
  passed: boolean;
  percentage: number;
  playerName: string;
  questionCount: number;
  score: number;
}

export function QuizResultSummary({
  answeredCount,
  isCompleted,
  passed,
  percentage,
  playerName,
  questionCount,
  score,
}: QuizResultSummaryProps) {
  return (
    <>
      <div
        data-testid="quiz-summary-stamp"
        className="relative z-10 space-y-1 rounded-2xl border-2 border-pink-400/70 bg-transparent backdrop-blur-sm animate-stamp-in"
      >
        <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
          {isCompleted ? (passed ? '🎉 PASSED!' : '😭 TRY AGAIN') : 'สรุปผลการทำข้อสอบ'}
        </h1>
        <p className="text-sm font-medium text-purple-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
          {isCompleted ? 'คุณได้คะแนน' : 'หยุดทำไว้ก่อนหน้านี้'}
        </p>
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-5xl font-black text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
          {percentage}%
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
          <span className="block text-xs text-purple-400">ทำไปแล้ว</span>
          <span className="font-bold">{answeredCount}/{questionCount} ข้อ</span>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-green-700">
          <span className="block text-xs text-green-400">ตอบถูก</span>
          <span className="font-bold">{score} ข้อ</span>
        </div>
      </div>

      <p className="relative z-10 text-sm text-gray-600">
        {!isCompleted
          ? `${playerName} สามารถกลับมาทำต่อจากจุดเดิมได้`
          : passed
            ? `${playerName} เก่งมาก! พร้อมไปสอบจริงแล้ว~ ✨`
            : `${playerName} อย่าท้อใจนะ ลองทบทวนแล้วมาใหม่! 💪`}
      </p>
    </>
  );
}
