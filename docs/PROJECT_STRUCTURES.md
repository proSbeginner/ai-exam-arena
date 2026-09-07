# Project Structures

This document records the approved project structure for the AWS AI Cert quiz application.

## Approved welcome feature structure

```text
features/welcome/
├── components/
│   ├── entry-gate.tsx
│   ├── welcome.tsx
│   └── welcome-loading-skeleton.tsx
├── services/
│   └── welcome.api.ts
├── welcome.constants.ts
├── welcome.logic.ts
├── welcome.types.ts
└── welcome.hook.ts
```

## Approved quiz feature structure

```text
features/quiz/
├── components/
│   ├── quiz-active.tsx
│   ├── quiz-header.tsx
│   ├── hold-to-answer-button.tsx
│   ├── quiz-result.tsx
│   ├── quiz-result-summary.tsx
│   ├── quiz.tsx
│   ├── quiz-loading-skeleton.tsx
│   ├── quiz-notice.tsx
│   ├── quiz-setup.tsx
│   └── quiz-progress.tsx
├── services/
│   ├── quiz.api.ts
│   └── quiz-attempt.api.ts
├── quiz-attempt.types.ts
├── quiz.types.ts
├── quiz.content.ts
├── quiz.assets.ts
├── quiz.constants.ts
├── quiz.logic.ts
├── quiz.hook.ts
├── quiz-setup.hook.ts
└── quiz-progress.storage.ts

mock-api/quiz/
├── mock-attempts.ts
├── mock-questions.ts
└── questions.mock.ts
```

## Approved shared component structure

```text
features/shared/
├── components/
│   ├── quiz-restart-dialog.tsx
│   └── text-input.tsx
└── routes.ts
```

Shared components are UI primitives used by more than one feature. Feature-specific state and actions remain in the owning feature and are passed into shared components as props.

## Approved leaderboard feature structure

```text
features/leaderboard/
├── components/
│   └── leaderboard.tsx
├── services/
│   └── leaderboard.api.ts
├── leaderboard.constants.ts
├── leaderboard.hook.ts
├── leaderboard.logic.ts
└── leaderboard.types.ts

mock-api/leaderboard/
└── mock-leaderboard.ts
```

## Data ownership

| Current export | Target location | Responsibility |
| --- | --- | --- |
| `MoodState` | `features/quiz/quiz.types.ts` | Mascot mood type |
| `ExamQuestion` | `features/quiz/quiz.types.ts` | Quiz question type |
| `QuizSetup` | `features/quiz/quiz.types.ts` | Selected mode and question limit |
| `QuizState` | `features/quiz/quiz.types.ts` | Quiz game state |
| `CHEER_MESSAGES` | `features/quiz/quiz.content.ts` | Correct-answer messages |
| `SYMPATHY_MESSAGES` | `features/quiz/quiz.content.ts` | Wrong-answer messages |
| `MOOD_IMAGES` | `features/quiz/quiz.assets.ts` | Mood-to-image mapping |
| `CORRECT_IMAGES` | `features/quiz/quiz.assets.ts` | Correct-answer images |
| `RANKS` | `features/quiz/quiz.constants.ts` | Rank configuration |
| `questions` | `mock-api/quiz/questions.mock.ts` | Mock question fixture |
| `getMockQuizQuestions()` | `mock-api/quiz/mock-questions.ts` | Mock question provider |

## Request flow

```text
quiz.hook
  → features/quiz/services/quiz.api.ts
  → /api/quiz/questions
  → server/providers/quiz.provider.ts
  → mock-api/quiz/mock-questions.ts
  → mock-api/quiz/questions.mock.ts
```

The quiz setup page uses the same API flow to count published questions for the selected mode. It stores the selected mode and optional question limit in session storage before routing to the quiz page.

When `DATA_SOURCE=supabase`, the provider resolver will use the Supabase implementation instead of the mock provider.

## Structural rules

- `app/` owns routing and page composition.
- `features/` owns feature-specific UI, state, domain logic, types, and content.
- `services/` owns calls to external APIs.
- `server/providers/` selects the data source for API routes.
- `mock-api/` owns mock providers and mock fixtures.
- The root `data/` directory should not be used for mixed feature data and will be removed after the approved migration.
