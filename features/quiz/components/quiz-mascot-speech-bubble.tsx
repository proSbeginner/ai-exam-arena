import { CHEER_MESSAGES, FAILED_MESSAGE, PASSED_MESSAGE, SYMPATHY_MESSAGES } from '../quiz.content';
import { QUIZ_MOOD } from '../quiz.constants';
import type { MoodState } from '../quiz.types';

interface QuizMascotSpeechBubbleProps {
  cheerIdx: number;
  mood: MoodState;
  playerName: string;
  sympathyIdx: number;
}

export function QuizMascotSpeechBubble({
  cheerIdx,
  mood,
  playerName,
  sympathyIdx,
}: QuizMascotSpeechBubbleProps) {
  return (
    <div className="absolute left-0 top-2 z-10 w-36 rounded-xl border-2 border-purple-200/70 bg-white/75 px-3 py-2 text-xs font-bold text-gray-700 shadow-md backdrop-blur-sm animate-bounce">
      {mood === QUIZ_MOOD.IDLE && `พร้อมแล้วนะ ${playerName}~! 💖`}
      {mood === QUIZ_MOOD.CORRECT && CHEER_MESSAGES[cheerIdx]}
      {mood === QUIZ_MOOD.WRONG && SYMPATHY_MESSAGES[sympathyIdx]}
      {mood === QUIZ_MOOD.PASSED && PASSED_MESSAGE}
      {mood === QUIZ_MOOD.FAILED && FAILED_MESSAGE}
    </div>
  );
}
