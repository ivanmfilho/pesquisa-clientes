import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface TextQuestionStepProps {
  questionNumber: number
  questionText: string
  value: string
  onChange: (val: string) => void
  onNext: () => void
  onPrev: () => void
}

export function TextQuestionStep({
  questionNumber,
  questionText,
  value,
  onChange,
  onNext,
  onPrev,
}: TextQuestionStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [questionNumber])

  const isEnabled = value.trim().length > 3

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl flex flex-col min-h-[400px]">
      <span className="text-gold-500 font-serif text-xl italic mb-4 block">
        Pergunta 0{questionNumber}
      </span>

      <h2 className="text-2xl md:text-3xl mb-8 leading-snug font-medium text-white/90">
        {questionText}
      </h2>

      <div className="flex-1 flex flex-col">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Sua resposta com o máximo de detalhes possível..."
          className="flex-1 min-h-[160px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg md:text-xl p-6 rounded-xl focus-visible:ring-gold-500/50 focus-visible:border-gold-500/50 transition-all leading-relaxed"
        />
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="text-white/60 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar
        </Button>

        <Button
          onClick={onNext}
          disabled={!isEnabled}
          className="bg-gold-600 hover:bg-gold-500 text-white rounded-full px-8 disabled:opacity-50 disabled:hover:scale-100 transition-all hover:scale-105 group"
        >
          Próxima
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
