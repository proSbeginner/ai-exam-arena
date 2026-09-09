# Project Structures

This document records the approved project structure for the AI Exam Arena quiz application.

## Approved welcome feature structure

```text
features/welcome/
├── components/
│   ├── entry-gate.tsx
│   ├── welcome.tsx
│   └── welcome-skeleton.tsx
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

mock/api/quiz/
├── attempts/
│   ├── mock-attempts.ts
│   └── mock-attempts.test.ts
└── questions/
    ├── mock-questions.ts
    └── mock-questions.test.ts
```

## Approved shared component structure

```text
features/shared/
├── components/
│   ├── brand-title.tsx
│   ├── confirmation-dialog.tsx
│   ├── leaderboard-link.tsx
│   ├── info-dialog.tsx
│   ├── player-mmr-badge.tsx
│   ├── player-rank-badge.tsx
│   ├── rank-emblem-badge.tsx
│   ├── rank-emblem-tooltip.tsx
│   ├── text-input.tsx
│   ├── app-toolbar.tsx
│   └── app-toolbar-skeleton.tsx
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

mock/api/leaderboard/
└── mock-leaderboard.ts
```

## Approved admin feature structure

```text
features/admin/
├── components/
│   ├── admin.tsx
│   ├── admin-access-gate.tsx
│   ├── admin-field.tsx
│   ├── admin-label-input.tsx
│   ├── admin-options-editor.tsx
│   ├── admin-question-card.tsx
│   ├── admin-question-form.tsx
│   ├── admin-question-list.tsx
│   └── admin-question-preview.tsx
├── admin.constants.ts
├── admin.hook.ts
├── services/
│   └── admin.api.ts
├── admin.logic.ts
└── admin.types.ts

mock/api/admin/questions/
├── mock-admin-questions.ts
└── mock-admin-questions.test.ts
```

## Approved database structure

```text
server/
├── database/
│   ├── types.ts
│   └── transformers/
│       ├── question.transform.ts
│       ├── attempt.transform.ts
│       ├── player.transform.ts
│       └── leaderboard.transform.ts
└── providers/
    ├── admin-question.provider.ts
    ├── mock-admin-question.provider.ts
    ├── mock-attempt.provider.ts
    ├── mock-leaderboard.provider.ts
    ├── mock-player.provider.ts
    ├── mock-quiz.provider.ts
    ├── supabase-admin-question.provider.ts
    ├── supabase-attempt.provider.ts
    ├── supabase-leaderboard.provider.ts
    ├── supabase-player.provider.ts
    ├── supabase-quiz.provider.ts
    ├── mock-rating.provider.ts
    ├── rating.provider.ts
    ├── supabase-rating.provider.ts
    ├── supabase-rating.provider.test.ts
    ├── mock-quiz.provider.test.ts
    ├── mock-leaderboard.provider.test.ts
    ├── mock-admin-question.provider.test.ts
    └── ...

supabase/
├── client.ts
└── migrations/
    ├── 0001_initial_schema.sql
    ├── 0002_grant_server_provider_access.sql
    ├── 0003_player_ratings.sql
    ├── 0004_player_rating_events.sql
    ├── 0005_grant_player_rating_access.sql
    └── 0006_atomic_apply_attempt_rating.sql
```

The database design is documented in [`docs/DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md). Supabase migrations are the source of truth for production database structure; mock providers remain available for local development and tests.

`server/database/types.ts` describes database-shaped rows. Transformers convert those rows into the application models used by features, so feature code does not depend on Supabase column names or nested relation shapes. Provider files are responsible for choosing a data source and making requests; they do not own cross-provider model conversion.

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
| `questions` | `mock/api/quiz/questions/mock-questions.ts` | Mock question fixture |
| `getMockQuizQuestions()` | `mock/api/quiz/questions/mock-questions.ts` | Mock question provider |

## Request flow

```text
quiz.hook
  → features/quiz/services/quiz.api.ts
  → /api/quiz/questions
  → server/providers/quiz.provider.ts
  → mock/api/quiz/questions/mock-questions.ts
```

The quiz setup page uses the same API flow to count published questions eligible for the selected mode based on option count. It stores the selected mode and optional question limit in session storage before routing to the quiz page. The selected mode belongs to the attempt, not to the question record.

When `DATA_SOURCE=supabase`, the provider resolver will use the Supabase implementation instead of the mock provider.

## Mock attempt storage

Quiz attempts are currently stored by `mock/api/quiz/attempts/mock-attempts.ts` in a server-memory `Map`:

```ts
const attempts = new Map<string, QuizAttemptRecord>();
```

ตัวอย่างโครงสร้างข้อมูลภายใน `Map`:

```text
Map (ตัวอย่าง)
├── PLAYER_001:university
│   ├── id
│   ├── playerId
│   ├── playerName
│   ├── questionIds
│   └── state
│       ├── currentQIndex
│       ├── answeredMap
│       ├── score
│       └── attemptStatus
└── PLAYER_002:secondary
    └── ...
```

The map is keyed by `playerId` and quiz mode, and contains the attempt state, selected question IDs, answers, score, and status. This lets the mock API behave like a database while the application is still under development. It is temporary: the data can be lost when the Next.js server restarts, reloads its module, or is redeployed. The production implementation will move this data to Supabase tables without changing the feature service contract.

## Structural rules

- `app/` owns routing and page composition.
- `features/` owns feature-specific UI, state, domain logic, types, and content.
- `services/` owns calls to external APIs.
- `server/providers/` selects the data source for API routes and exposes provider interfaces to routes.
- `server/database/` owns database row types and database-to-application transformers.
- `supabase/` owns the Supabase REST client and migrations.
- `mock/api/` owns mock providers and mock fixtures.
- Unit tests live beside the module they verify using the `.test.ts` suffix. The top-level `tests/` directory is reserved for shared test setup and future integration or end-to-end tests.
- The root `data/` directory should not be used for mixed feature data and will be removed after the approved migration.

## Current mock API organization

Mock scenarios and network delays are owned by their domain provider in `server/providers/mock-*.provider.ts`. They are not configured through a shared `mock/api/config.ts` file or environment variables. Mock fixtures live under `mock/api/<domain>`, and tests sit beside the fixture or provider they verify.

The quiz answer flow uses `server/providers/mock-attempt.provider.ts` for the `answer-failed` scenario. The client displays the existing answer error and allows the player to retry after the request fails or times out.

## Loading skeleton convention

Each page-level loading state should replace the page components it represents, including the app toolbar when that toolbar appears on the page. Skeleton layout should use the same content width and horizontal spacing as the loaded component. Route-level `loading.tsx` files are kept only where Next.js can show a navigation fallback before the page component mounts; page-owned `isLoading` state remains responsible for API loading.
