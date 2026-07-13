import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RankingStepProps {
  selected: string[]
  onChange: (val: string[]) => void
  onNext: () => void
  onPrev: () => void
  isSubmitting: boolean
}

const OPTIONS = [
  'Confiança no time',
  'Clareza e transparência no processo',
  'Qualidade percebida da entrega',
  'Segurança para evitar dor de cabeça na obra',
  'Capacidade técnica',
  'Atendimento e comunicação',
  'Prazo',
  'Custo-benefício',
  'Indicação / reputação',
  'Identificação com o estilo da empresa',
]

export function RankingStep({
  selected,
  onChange,
  onNext,
  onPrev,
  isSubmitting,
}: RankingStepProps) {
  const toggleOption = (option: string) => {
    const isSelected = selected.includes(option)

    if (isSelected) {
      onChange(selected.filter((item) => item !== option))
    } else {
      if (selected.length < 3) {
        onChange([...selected, option])
      }
    }
  }

  const isComplete = selected.length === 3

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl flex flex-col">
      <span className="text-gold-500 font-serif text-xl italic mb-4 block">Pergunta 10</span>

      <h2 className="text-2xl md:text-3xl mb-4 leading-snug font-medium text-white/90">
        Desses fatores abaixo, escolha os 3 que mais pesaram na sua decisão e coloque em ordem de
        importância.
      </h2>

      <p className="text-white/60 mb-8 font-light">
        Selecione clicando nas opções. A primeira que você escolher será a mais importante (1), a
        segunda será a número (2), e assim por diante.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {OPTIONS.map((option) => {
          const index = selected.indexOf(option)
          const isSelected = index !== -1
          const isDisabled = !isSelected && selected.length >= 3

          return (
            <button
              key={option}
              onClick={() => toggleOption(option)}
              disabled={isDisabled}
              className={cn(
                'relative p-4 rounded-xl text-left transition-all duration-300 border flex items-center justify-between group',
                isSelected
                  ? 'bg-gold-500/20 border-gold-500 text-white shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20',
                isDisabled &&
                  'opacity-40 cursor-not-allowed hover:bg-white/5 hover:border-white/10',
              )}
            >
              <span className="text-sm md:text-base font-medium pr-8 leading-tight">{option}</span>

              {isSelected && (
                <div className="absolute right-4 w-6 h-6 rounded-full bg-gold-500 text-charcoal-900 flex items-center justify-center text-sm font-bold animate-fade-in">
                  {index + 1}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="text-white/60 hover:text-white hover:bg-white/5"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar
        </Button>

        <Button
          onClick={onNext}
          disabled={!isComplete || isSubmitting}
          className="bg-gold-600 hover:bg-gold-500 text-white rounded-full px-8 disabled:opacity-50 disabled:hover:scale-100 transition-all hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              Concluir
              <CheckCircle2 className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
