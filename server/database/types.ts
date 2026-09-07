import type { SerializedQuizState } from '@/features/quiz/quiz-attempt.types';
import type { LeaderboardAttemptStatus } from '@/features/leaderboard/leaderboard.types';
import type { QuizMode, QuizState, QuestionStatus } from '@/features/quiz/quiz.types';

export interface DatabaseQuestionOptionRow {
  id: string;
  option_key: string;
  english: string;
  thai_drama: string;
  is_correct: boolean;
  display_order: number;
}

export interface DatabaseQuestionRow {
  id: string;
  labels: string[];
  english: string;
  thai_drama: string;
  fun_fact: string | null;
  source_name: string | null;
  status: QuestionStatus;
  question_options: DatabaseQuestionOptionRow[];
}

export interface DatabasePlayerRow {
  id: string;
  player_name: string;
  pin_hash: string;
  failed_pin_attempts: number;
  locked_at: string | null;
}

export interface DatabaseAttemptRow {
  id: string;
  player_id: string;
  mode: QuizMode;
  question_limit: number | null;
  attempt_status: QuizState['attemptStatus'];
  current_question_index: number;
  score: number;
  question_ids: string[];
  state: SerializedQuizState;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface DatabaseLeaderboardAttemptRow extends Omit<DatabaseAttemptRow, 'attempt_status'> {
  attempt_status: LeaderboardAttemptStatus;
  players: { player_name: string } | null;
}
