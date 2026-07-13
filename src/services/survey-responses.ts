import { supabase } from '@/lib/supabase/client'

export interface SurveyResponseRow {
  id: string
  session_id: string
  question_label: string
  answer_text: string
  created_at: string
  user_id: string | null
}

export interface SurveySession {
  session_id: string
  created_at: string
  response_count: number
}

const QUESTION_LABELS: Record<string, string> = {
  q1: 'Momento em que o projeto virou prioridade',
  q2: 'Maior receio ao contratar',
  q3: 'Inegociável na decisão',
  q4: 'Momento de confiança na empresa',
  q5: 'O que mais pesou na decisão final',
  q6: 'Comparação com outras empresas',
  q7: 'Perfil ideal de cliente',
  q8: 'Resolução de imprevistos',
  q9: 'O que a Minc pode melhorar',
  q10: 'Ranking dos 3 fatores mais importantes',
}

export async function submitSurveyResponses(data: {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  q8: string
  q9: string
  q10: string[]
  completedAt: string
}): Promise<{ success: boolean; error?: string }> {
  const sessionId = crypto.randomUUID()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rows = [
    { question_label: QUESTION_LABELS.q1, answer_text: data.q1 },
    { question_label: QUESTION_LABELS.q2, answer_text: data.q2 },
    { question_label: QUESTION_LABELS.q3, answer_text: data.q3 },
    { question_label: QUESTION_LABELS.q4, answer_text: data.q4 },
    { question_label: QUESTION_LABELS.q5, answer_text: data.q5 },
    { question_label: QUESTION_LABELS.q6, answer_text: data.q6 },
    { question_label: QUESTION_LABELS.q7, answer_text: data.q7 },
    { question_label: QUESTION_LABELS.q8, answer_text: data.q8 },
    { question_label: QUESTION_LABELS.q9, answer_text: data.q9 },
    { question_label: QUESTION_LABELS.q10, answer_text: data.q10.join(' → ') },
  ].map((row) => ({
    ...row,
    session_id: sessionId,
    user_id: user?.id || null,
  }))

  const { error } = await supabase.from('survey_responses').insert(rows)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getSurveySessions(): Promise<{
  data: SurveySession[] | null
  error: string | null
}> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('session_id, created_at')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }

  const sessionMap = new Map<string, SurveySession>()
  for (const row of data as { session_id: string; created_at: string }[]) {
    const existing = sessionMap.get(row.session_id)
    if (!existing) {
      sessionMap.set(row.session_id, {
        session_id: row.session_id,
        created_at: row.created_at,
        response_count: 1,
      })
    } else {
      existing.response_count++
    }
  }

  return { data: Array.from(sessionMap.values()), error: null }
}

export async function getResponsesBySession(
  sessionId: string,
): Promise<{ data: SurveyResponseRow[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data as SurveyResponseRow[], error: null }
}
