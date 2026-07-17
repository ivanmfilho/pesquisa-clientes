import { submitSurveyResponses, uploadAudioRecording } from '@/services/survey-responses'
import { supabase } from '@/lib/supabase/client'

export interface SurveyResponse {
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
  audioBlobs?: Record<string, Blob>
}

export async function submitSurveyToDatabase(
  data: SurveyResponse,
): Promise<{ success: boolean; error?: string }> {
  const sessionId = crypto.randomUUID()
  const audioUrls: Record<string, string> = {}

  if (data.audioBlobs) {
    for (const [key, blob] of Object.entries(data.audioBlobs)) {
      const { url, error } = await uploadAudioRecording(sessionId, key, blob)
      if (error || !url) {
        return {
          success: false,
          error: 'Falha ao enviar o áudio. Por favor, tente novamente.',
        }
      }
      audioUrls[key] = url
    }
  }

  const result = await submitSurveyResponses({
    name: data.name,
    q1: data.q1,
    q2: data.q2,
    q3: data.q3,
    q4: data.q4,
    q5: data.q5,
    q6: data.q6,
    q7: data.q7,
    q8: data.q8,
    q9: data.q9,
    q10: data.q10,
    completedAt: data.completedAt,
    sessionId,
    audioUrls,
  })

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Falha ao salvar as respostas. Por favor, tente novamente.',
    }
  }

  if (result.sessionId) {
    try {
      await supabase.functions.invoke('notify-survey-response', {
        body: {
          name: data.name,
          sessionId: result.sessionId,
          completedAt: data.completedAt,
        },
      })
    } catch {
      // The database trigger also calls the edge function as a backup.
    }
  }

  return { success: true }
}
