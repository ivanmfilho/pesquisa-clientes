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
  return new Promise((resolve) => {
    console.log('Saving to Supabase `client_responses` table...', data)
    setTimeout(() => {
      resolve({ success: true })
    }, 1200)
  })
}
