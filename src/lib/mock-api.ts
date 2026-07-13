import { submitSurveyResponses } from '@/services/survey-responses'

export interface SurveyResponse {
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
  if (!result.success) {
    throw new Error(result.error || 'Erro ao salvar respostas')
  }
  return { success: true }
}
