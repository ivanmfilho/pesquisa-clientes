import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, Mic, MicOff, Square, AlertCircle } from 'lucide-react'
import { useEffect, useRef, useCallback } from 'react'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

  const handleTranscript = useCallback(
    (text: string) => {
      onChange(text)
    },
    [onChange],
  )

  const { isListening, isSupported, toggle, error, reset } = useSpeechRecognition(handleTranscript)

  useEffect(() => {
    if (textareaRef.current && !isListening) {
      textareaRef.current.focus()
    }
  }, [questionNumber, isListening])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    return () => reset()
  }, [reset, questionNumber])

  const isEnabled = value.trim().length > 3

  const handleMicClick = () => {
    if (!isSupported) {
      toast.error('Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome ou Edge.')
      return
    }
    toggle(value)
  }

  return (
    <div
      className={cn(
        'glass-panel p-6 md:p-10 rounded-2xl flex flex-col min-h-[400px] transition-all duration-300',
        isListening && 'ring-2 ring-brand-tan/50 shadow-[0_0_30px_rgba(166,144,115,0.25)]',
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-brand-tan font-medium text-lg">Pergunta 0{questionNumber}</span>

        <button
          type="button"
          onClick={handleMicClick}
          disabled={!isSupported}
          aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação por voz'}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
            isListening
              ? 'bg-red-500/20 text-red-300 border border-red-400/40'
              : 'bg-brand-tan/15 text-brand-beige border border-brand-tan/30 hover:bg-brand-tan/25',
            !isSupported && 'opacity-50 cursor-not-allowed',
          )}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
          )}
          {isListening ? (
            <Square className="w-4 h-4 relative z-10 fill-current" />
          ) : !isSupported ? (
            <MicOff className="w-4 h-4 relative z-10" />
          ) : (
            <Mic className="w-4 h-4 relative z-10" />
          )}
          <span className="relative z-10">{isListening ? 'Ouvindo...' : 'Falar'}</span>
        </button>
      </div>

      <h2 className="text-2xl md:text-3xl mb-6 leading-snug font-medium text-brand-beige">
        {questionText}
      </h2>

      {isListening && (
        <div className="flex items-center gap-2 mb-3 text-brand-tan/80 text-sm animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-tan opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-tan" />
          </span>
          <span>Escutando sua resposta... toque no botão para parar.</span>
        </div>
      )}

      {!isSupported && (
        <div className="flex items-center gap-2 mb-3 text-white/50 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Reconhecimento de voz não disponível neste navegador.</span>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Sua resposta com o máximo de detalhes possível... (você pode falar ou digitar)"
          className={cn(
            'flex-1 min-h-[160px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg md:text-xl p-6 rounded-xl focus-visible:ring-brand-tan/50 focus-visible:border-brand-tan/50 transition-all leading-relaxed',
            isListening && 'border-brand-tan/40 bg-white/[0.07]',
          )}
        />
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={onPrev}
          disabled={isListening}
          className="text-white/60 hover:text-brand-beige hover:bg-white/5 disabled:opacity-40"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar
        </Button>

        <Button
          onClick={onNext}
          disabled={!isEnabled || isListening}
          className="bg-brand-tan hover:bg-brand-beige text-brand-blue font-semibold rounded-full px-8 disabled:opacity-50 disabled:hover:scale-100 transition-all hover:scale-105 group"
        >
          Próxima
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
