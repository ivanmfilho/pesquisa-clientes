ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS audio_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('survey-recordings', 'survey-recordings', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_upload_survey_recordings" ON storage.objects;
CREATE POLICY "anon_upload_survey_recordings" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'survey-recordings');

DROP POLICY IF EXISTS "authenticated_upload_survey_recordings" ON storage.objects;
CREATE POLICY "authenticated_upload_survey_recordings" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'survey-recordings');

DROP POLICY IF EXISTS "public_read_survey_recordings" ON storage.objects;
CREATE POLICY "public_read_survey_recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'survey-recordings');

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
