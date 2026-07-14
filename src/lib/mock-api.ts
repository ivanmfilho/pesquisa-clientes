import { submitSurveyResponses } from '@/services/survey-responses'
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
}

export async function submitSurveyToDatabase(data: SurveyResponse): Promise<{ success: boolean }> {
  const result = await submitSurveyResponses(data)

  if (result.success && result.sessionId) {
    try {
      await supabase.functions.invoke('notify-survey-response', {
        body: {
          name: data.name,
          sessionId: result.sessionId,
          completedAt: data.completedAt,
        },
      })
    } catch {
      // Notification failure should not block the user experience
    }
  }

  return { success: result.success }
}
