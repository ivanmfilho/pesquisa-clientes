import { supabase } from '@/lib/supabase/client'

export interface SurveyResponseRow {
  id: string
  session_id: string
  question_label: string
  answer_text: string
  audio_url: string | null
  created_at: string
  user_id: string | null
}

export interface SurveySession {
  session_id: string
  created_at: string
  response_count: number
}

export const QUESTION_LABELS: Record<string, string> = {
  name: 'Qual é o seu nome?',
  q1: 'Momento em que o projeto virou prioridade',
  q2: 'Maior receio ao contratar',
  q3: 'Inegociável na decisão',
  q4: 'Comparação com outras empresas',
  q5: 'O que mais pesou na decisão final',
  q6: 'O que mais marcou a experiência',
  q7: 'Perfil ideal de cliente',
  q8: 'Resolução de imprevistos',
  q9: 'O que a Minc pode melhorar',
  q10: 'Ranking dos 3 fatores mais importantes',
}

export async function uploadAudioRecording(
  sessionId: string,
  questionKey: string,
  blob: Blob,
): Promise<{ url: string | null; error: string | null }> {
  const ext = blob.type.includes('webm') ? 'webm' : 'ogg'
  const filePath = `${sessionId}/${questionKey}.${ext}`

  const { error } = await supabase.storage.from('survey-recordings').upload(filePath, blob, {
    contentType: blob.type,
    upsert: true,
  })

  if (error) {
    console.error('Audio upload error:', error.message)
    return { url: null, error: error.message }
  }

  const { data } = supabase.storage.from('survey-recordings').getPublicUrl(filePath)
  return { url: data.publicUrl, error: null }
}
export async function submitSurveyResponses(data: {
  name: string
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
  sessionId: string
  audioUrls?: Record<string, string>
}): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  const sessionId = data.sessionId
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rows = [
    {
      question_label: QUESTION_LABELS.name,
      answer_text: data.name,
      audio_url: null as string | null,
    },
    {
      question_label: QUESTION_LABELS.q1,
      answer_text: data.q1,
      audio_url: data.audioUrls?.q1 ?? null,
    },
    {
      question_label: QUESTION_LABELS.q2,
      answer_text: data.q2,
      audio_url: data.audioUrls?.q2 ?? null,
    },
    {
      question_label: QUESTION_LABELS.q3,
      answer_text: data.q3,
      audio_url: data.audioUrls?.q3 ?? null,
    },
    {
      question_label: QUESTION_LABELS.q4,
      answer_text: data.q4,
      audio_url: data.audioUrls?.q4 ?? null,
    },
    {
      question_label: QUESTION_LABELS.q5,
      answer_text: data.q5,
      audio_url: data.audioUrls?.q5 ?? null,
    },
    {
      question_label: QUESTION_LABELS.q6,
      answer_text: data.q6,
      audio_url: data.audioUrls?.q6 ?? null,
    },
    {
      question_label: QUESTION_LABELS.q7,
      answer_text: data.q7,
      audio_url: data.audioUrls?.q7 ?? null,
    },
    {
      question_label: QUESTION_LABELS.q8,
      answer_text: data.q8,
      audio_url: data.audioUrls?.q8 ?? null,
    },
    {
      question_label: QUESTION_LABELS.q9,
      answer_text: data.q9,
      audio_url: data.audioUrls?.q9 ?? null,
    },
    { question_label: QUESTION_LABELS.q10, answer_text: data.q10.join(' → '), audio_url: null },
  ].map((row) => ({
    ...row,
    session_id: sessionId,
    user_id: user?.id || null,
  }))

  const { error } = await supabase.from('survey_responses').insert(rows as any)
  if (error) return { success: false, error: error.message }
  return { success: true, sessionId }
}

export async function getAllResponses(filters?: {
  startDate?: string
  endDate?: string
}): Promise<{ data: SurveyResponseRow[] | null; error: string | null }> {
  let query = supabase
    .from('survey_responses')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  const { data, error } = await query
  if (error) return { data: null, error: error.message }
  return { data: data as SurveyResponseRow[], error: null }
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
