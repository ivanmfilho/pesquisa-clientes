DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_net extension not available: %', SQLERRM;
END
$$;

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
    WHERE session_id = NEW.session_id AND question_label = 'Nome'
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

DROP TRIGGER IF EXISTS survey_response_notify ON public.survey_responses;
CREATE TRIGGER survey_response_notify
  AFTER INSERT ON public.survey_responses
  FOR EACH ROW EXECUTE FUNCTION public.notify_survey_complete();
