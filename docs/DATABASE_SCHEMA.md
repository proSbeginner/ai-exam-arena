# Database Schema

This document is the initial Supabase Postgres design for the application. It is a design reference first; the SQL migration will be created after the tables and constraints are agreed upon.

## Design goals

- Keep player identity separate from quiz attempts.
- Store PINs as hashes, never as plain text.
- Allow one active attempt per player and mode.
- Preserve every selected answer for resume, review, and leaderboard calculations.
- Keep question options flexible so university questions can have four or more choices.
- Keep source attribution optional and currently store only a source name.

## Tables

### `players`

Stores the anonymous player profile and PIN protection state.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `player_name` | `text` | Required, uppercase, unique |
| `pin_hash` | `text` | Required; never store the 6-digit PIN itself |
| `failed_pin_attempts` | `integer` | Required, default `0` |
| `locked_at` | `timestamptz` | Nullable; set after the configured limit |
| `created_at` | `timestamptz` | Required |
| `updated_at` | `timestamptz` | Required |

### `questions`

Stores the question content and publishing state.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `labels` | `text[]` | Optional labels, normalized to uppercase |
| `english` | `text` | Required |
| `thai_drama` | `text` | Optional |
| `fun_fact` | `text` | Optional; shown after answering |
| `source_name` | `text` | Optional attribution |
| `status` | `text` | `draft` or `published` |
| `created_at` | `timestamptz` | Required |
| `updated_at` | `timestamptz` | Required |

### `question_options`

Stores a variable number of options for each question.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `question_id` | `uuid` | Foreign key to `questions.id` |
| `option_key` | `text` | Stable key used by the quiz model, such as `option-a` |
| `english` | `text` | Required |
| `thai_drama` | `text` | Optional |
| `is_correct` | `boolean` | Required, default `false` |
| `display_order` | `integer` | Required; controls option order |

The database does not limit the number of options. Admin validation still requires at least two options.

The quiz mode is derived from the number of published options rather than stored on the question:

| Quiz mode | Required options | Runtime behavior |
| --- | ---: | --- |
| `primary` | at least 2 | Randomly show 2 options, including the correct answer |
| `secondary` | at least 3 | Randomly show 3 options, including the correct answer |
| `university` | at least 4 | Show all available options |

### `quiz_attempts`

Stores one quiz run for a player and mode.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `player_id` | `uuid` | Foreign key to `players.id` |
| `mode` | `text` | Selected quiz mode for this attempt |
| `question_limit` | `integer` | Nullable when using all available questions |
| `attempt_status` | `text` | `active`, `abandoned`, or `completed` |
| `current_question_index` | `integer` | Resume position |
| `score` | `integer` | Correct answer count |
| `question_ids` | `uuid[]` | Frozen question order for this attempt |
| `state` | `jsonb` | Serialized quiz state used for resume/review |
| `started_at` | `timestamptz` | Required |
| `updated_at` | `timestamptz` | Required |
| `completed_at` | `timestamptz` | Nullable |

An application-level transaction or partial unique index should enforce one non-completed attempt per player and mode.

### `quiz_answers`

Stores each answer selected during an attempt.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `attempt_id` | `uuid` | Foreign key to `quiz_attempts.id` |
| `question_id` | `uuid` | Foreign key to `questions.id` |
| `selected_option_id` | `uuid` | Foreign key to `question_options.id` |
| `is_correct` | `boolean` | Snapshot at answer time |
| `answered_at` | `timestamptz` | Required |

There should be one answer per question within an attempt:

```text
unique(attempt_id, question_id)
```

## Relationships

```text
players
  └──< quiz_attempts
          ├──< quiz_answers >── questions ──< question_options
          └── question_ids (frozen order for this attempt)
```

## Atomic rating application

`player_rating_events.attempt_id` is the idempotency key for rating. The
`apply_attempt_rating` RPC inserts the event and updates `player_ratings` in
one database transaction. A repeated request for the same attempt returns the
current aggregate rating without incrementing it again. This prevents both
duplicate MMR awards and the partial state where an event exists but its
aggregate update failed.

## Leaderboard calculation

The leaderboard can be calculated from `quiz_attempts` and `quiz_answers`:

1. Completed attempts appear before abandoned attempts.
2. Higher `answered_count` ranks first.
3. Higher accuracy ranks next.
4. Higher correct count breaks any remaining tie.

Accuracy is calculated from answers in the attempt, not from the total question bank. This preserves the current behavior for an attempt that was stopped early.

## Mapping to the current application model

| Application model | Database source |
| --- | --- |
| `ExamQuestion` | `questions` joined with `question_options` |
| `QuizAttemptRecord` | `quiz_attempts` plus its `quiz_answers` |
| `answeredMap` | `quiz_answers` keyed by question position/order |
| `LeaderboardEntry` | Aggregate query over `quiz_attempts` and `quiz_answers` |

The current mock implementation uses an in-memory `Map`. Supabase providers should keep the same service contracts so the UI and feature hooks do not need to know which provider is active.
