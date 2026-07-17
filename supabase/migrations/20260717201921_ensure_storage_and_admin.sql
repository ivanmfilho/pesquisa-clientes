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

DROP POLICY IF EXISTS "anon_insert_survey_responses" ON public.survey_responses;
CREATE POLICY "anon_insert_survey_responses" ON public.survey_responses
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_insert_survey_responses" ON public.survey_responses;
CREATE POLICY "authenticated_insert_survey_responses" ON public.survey_responses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "authenticated_select_survey_responses" ON public.survey_responses;
CREATE POLICY "authenticated_select_survey_responses" ON public.survey_responses
  FOR SELECT TO authenticated USING (true);

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
END $$;
