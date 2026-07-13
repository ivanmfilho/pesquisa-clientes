import { useState } from 'react'
import { WelcomeStep } from '@/components/survey/WelcomeStep'
import { TextQuestionStep } from '@/components/survey/TextQuestionStep'
import { RankingStep } from '@/components/survey/RankingStep'
import { ThankYouStep } from '@/components/survey/ThankYouStep'
import { submitSurveyToDatabase, type SurveyResponse } from '@/lib/mock-api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const QUESTIONS = [
  'Voltando ao começo: o que estava acontecendo na sua vida, na sua família ou no seu momento patrimonial que fez esse projeto sair do desejo e virar prioridade?',
  'Antes de falar com a gente, qual era o seu maior receio ao contratar uma empresa para construir uma casa desse padrão?',
  'Quando você começou a avaliar opções, o que era inegociável para você nessa decisão?',
  'Em que momento você sentiu que a nossa empresa poderia ser a escolha certa? Teve algum episódio, detalhe, conversa ou percepção que virou essa chave?',
  'Entre tudo o que você avaliou, o que mais pesou na decisão final de fechar com a gente?',
  'Você comparou com outras empresas, profissionais ou modelos de contratação? O que você viu de diferente entre a Minc e essas alternativas? Se você tivesse que explicar para um amigo próximo por que escolheu a gente, em uma conversa franca, o que você diria?',
  'E uma opinião sua: qual perfil de pessoa você acredita que poderia apreciar melhor a nossa forma de conduzir a obra?',
  'Sobre os imprevistos de obra, como foram resolvidos? E como poderíamos ter resolvido melhor?',
  'Você conhece o nosso Propósito: O Futuro precisa ser Melhor do que o Presente. O que você acha que a Minc pode ser melhor?',
]

export default function Index() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [answers, setAnswers] = useState<Partial<SurveyResponse>>({
    q10: [],
  })

  const totalSteps = QUESTIONS.length + 1
  const isIntro = step === 0
  const isOutro = step === totalSteps + 1

  const handleNext = () => {
    setDirection('forward')
    setStep((s) => s + 1)
  }

  const handlePrev = () => {
    setDirection('backward')
    setStep((s) => s - 1)
  }

  const handleTextAnswer = (qIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [`q${qIndex}`]: value }))
  }

  const handleRankingAnswer = (values: string[]) => {
    setAnswers((prev) => ({ ...prev, q10: values }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const finalData: SurveyResponse = {
        q1: answers.q1 || '',
        q2: answers.q2 || '',
        q3: answers.q3 || '',
        q4: answers.q4 || '',
        q5: answers.q5 || '',
        q6: answers.q6 || '',
        q7: answers.q7 || '',
        q8: answers.q8 || '',
        q9: answers.q9 || '',
        q10: answers.q10 || [],
        completedAt: new Date().toISOString(),
      }
      await submitSurveyToDatabase(finalData)
      setDirection('forward')
      setStep(totalSteps + 1)
    } catch (error) {
      toast.error('Ocorreu um erro ao salvar suas respostas. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    const animationClass =
      direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'

    if (step === 0) {
      return (
        <div key="step-0" className={cn('w-full', animationClass)}>
          <WelcomeStep onStart={handleNext} />
        </div>
      )
    }

    if (step >= 1 && step <= QUESTIONS.length) {
      const qIndex = step
      return (
        <div key={`step-${step}`} className={cn('w-full', animationClass)}>
          <TextQuestionStep
            questionNumber={qIndex}
            questionText={QUESTIONS[qIndex - 1]}
            value={(answers as any)[`q${qIndex}`] || ''}
            onChange={(val) => handleTextAnswer(qIndex, val)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>
      )
    }

    if (step === totalSteps) {
      return (
        <div key="step-ranking" className={cn('w-full', animationClass)}>
          <RankingStep
            selected={answers.q10 || []}
            onChange={handleRankingAnswer}
            onNext={handleSubmit}
            onPrev={handlePrev}
            isSubmitting={isSubmitting}
          />
        </div>
      )
    }

    if (step > totalSteps) {
      return (
        <div key="step-outro" className={cn('w-full animate-fade-in-up')}>
          <ThankYouStep />
        </div>
      )
    }

    return null
  }

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      {!isIntro && !isOutro && (
        <div className="w-full mb-8">
          <div className="flex justify-between text-xs text-gold-500/70 mb-2 font-medium tracking-widest uppercase">
            <span>Progresso</span>
            <span>
              {step} de {totalSteps}
            </span>
          </div>
          <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {renderStep()}
    </div>
  )
}
