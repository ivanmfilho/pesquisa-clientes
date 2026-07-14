import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ArrowRight, User } from 'lucide-react'

interface NameStepProps {
  value: string
  onChange: (val: string) => void
  onNext: () => void
  onPrev: () => void
}

export function NameStep({ value, onChange, onNext, onPrev }: NameStepProps) {
  const isEnabled = value.trim().length >= 2

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl flex flex-col min-h-[360px]">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-brand-tan" />
        <span className="text-brand-tan font-medium text-lg">Identificação</span>
      </div>

      <h2 className="text-xl md:text-3xl mb-3 leading-snug font-medium text-brand-beige">
        Qual é o seu nome?
      </h2>

      <p className="text-white/60 mb-6 font-light text-sm md:text-base">
        Precisamos saber quem está compartilhando essa experiência valiosa conosco.
      </p>

      <div className="flex-1 flex flex-col">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite seu nome completo..."
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isEnabled) onNext()
          }}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-base md:text-xl h-12 md:h-14 px-5 rounded-xl focus-visible:ring-brand-tan/50 focus-visible:border-brand-tan/50 transition-all"
        />
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="text-white/60 hover:text-brand-beige hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar
        </Button>

        <Button
          onClick={onNext}
          disabled={!isEnabled}
          className="bg-brand-tan hover:bg-brand-beige text-brand-blue font-semibold rounded-full px-6 md:px-8 disabled:opacity-50 disabled:hover:scale-100 transition-all hover:scale-105 group"
        >
          Próxima
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
