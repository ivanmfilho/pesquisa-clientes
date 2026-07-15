-- Ensure pg_net extension is available
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_net extension not available: %', SQLERRM;
END
$$;

-- Update the notification function (idempotent via CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.notify_survey_complete()
RETURNS trigger AS $$
DECLARE
  session_count int;
  participant_name text;
  project_url text := 'https://ljgnmgxbthwhnwdjojxy.supabase.co';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZ25tZ3hidGh3aG53ZGpvanh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NzI0NjMsImV4cCI6MjA5OTU0ODQ2M30.3rHXllwG_cR6AbkGF3CgPhYmvpTTMLbrhPCET8Dyc1s';
BEGIN
  SELECT COUNT(*) INTO session_count
  FROM public.survey_responses
  WHERE session_id = NEW.session_id;

  IF session_count >= 11 THEN
    SELECT answer_text INTO participant_name
    FROM public.survey_responses
    WHERE session_id = NEW.session_id AND question_label = 'Qual é o seu nome?'
    LIMIT 1;

    BEGIN
      PERFORM net.http_post(
        url := project_url || '/functions/v1/notify-survey-response',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body := jsonb_build_object(
          'name', COALESCE(participant_name, ''),
          'sessionId', NEW.session_id::text,
          'completedAt', NEW.created_at::text
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Notification HTTP call failed: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS survey_response_notify ON public.survey_responses;
CREATE TRIGGER survey_response_notify
  AFTER INSERT ON public.survey_responses
  FOR EACH ROW EXECUTE FUNCTION public.notify_survey_complete();

-- Ensure RLS policies exist (idempotent)
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_survey_responses" ON public.survey_responses;
CREATE POLICY "anon_insert_survey_responses" ON public.survey_responses
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_insert_survey_responses" ON public.survey_responses;
CREATE POLICY "authenticated_insert_survey_responses" ON public.survey_responses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "authenticated_select_survey_responses" ON public.survey_responses;
CREATE POLICY "authenticated_select_survey_responses" ON public.survey_responses
  FOR SELECT TO authenticated USING (true);

-- Auth seed: ensure admin user exists (idempotent)
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ivan@mincrs.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ivan@mincrs.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Ivan"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END
$$;
