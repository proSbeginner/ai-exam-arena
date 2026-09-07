grant usage on schema public to service_role;

grant select, insert, update, delete
on table public.players, public.questions, public.question_options, public.quiz_attempts, public.quiz_answers
to service_role;
