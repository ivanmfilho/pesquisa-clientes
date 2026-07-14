import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'

interface StartStepProps {
  value: string
  onChange: (val: string) => void
  onStart: () => void
}

export function StartStep({ value, onChange, onStart }: StartStepProps) {
  const isEnabled = value.trim().length >= 2

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl flex flex-col w-full max-w-2xl mx-auto border-t-brand-tan/30">
      <h1 className="text-2xl md:text-4xl mb-4 leading-tight font-medium text-brand-beige text-glow text-center">
        A arte de construir o amanhã.
      </h1>

      <div className="space-y-3 text-white/70 md:text-base leading-relaxed font-light mb-6 text-center">
        <p>
          Estamos refinando nossa experiência comercial para entender o que realmente pesa na
          decisão de quem constrói uma casa de alto padrão conosco.
        </p>
        <p>
          São 10 perguntas rápidas. Não é pesquisa de satisfação — é uma conversa franca para
          melhorarmos nosso processo.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <label className="text-brand-tan font-medium text-base md:text-lg">
          Qual é o seu nome?
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite seu nome completo..."
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isEnabled) onStart()
          }}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-base md:text-lg h-12 md:h-14 px-5 rounded-xl focus-visible:ring-brand-tan/50 focus-visible:border-brand-tan/50 transition-all"
        />
      </div>

      <div className="flex justify-center mt-6">
        <Button
          onClick={onStart}
          disabled={!isEnabled}
          size="lg"
          className="bg-brand-tan hover:bg-brand-beige text-brand-blue rounded-full px-8 py-5 text-base font-semibold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(166,144,115,0.4)] disabled:opacity-40 disabled:hover:scale-100 group w-full md:w-auto"
        >
          Começar Experiência
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
