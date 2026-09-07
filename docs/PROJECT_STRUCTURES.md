# Project Structures

This document records the approved project structure for the AWS AI Cert quiz application.

## Approved quiz feature structure

```text
features/quiz/
├── components/
│   ├── quiz.tsx
│   ├── quiz-loading-skeleton.tsx
│   └── quiz-setup.tsx
├── services/
│   └── quiz.api.ts
├── quiz.types.ts
├── quiz.content.ts
├── quiz.assets.ts
├── quiz.constants.ts
├── quiz.logic.ts
├── quiz.hook.ts
└── quiz-setup.hook.ts

mock-api/quiz/
├── mock-questions.ts
└── questions.mock.ts
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
