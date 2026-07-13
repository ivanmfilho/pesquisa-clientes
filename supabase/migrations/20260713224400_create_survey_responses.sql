CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question_label TEXT NOT NULL,
  answer_text TEXT NOT NULL DEFAULT '',
  session_id UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON public.survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON public.survey_responses(created_at DESC);

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
