import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface WelcomeStepProps {
  onStart: () => void
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="glass-panel p-8 md:p-12 rounded-2xl flex flex-col items-center text-center max-w-2xl mx-auto border-t-brand-tan/30">
      <h1 className="text-3xl md:text-5xl mb-8 leading-tight font-medium text-brand-beige text-glow">
        A arte de construir o amanhã.
      </h1>

      <div className="space-y-6 text-white/80 md:text-lg leading-relaxed font-light mb-12">
        <p>
          Estamos refinando nossa experiência comercial e de atendimento para entender, com mais
          profundidade, o que realmente pesa na decisão de quem constrói uma casa de alto padrão com
          a gente.
        </p>
        <p>
          Queria te fazer 10 perguntas rápidas. Não é pesquisa de satisfação, nem tem resposta
          certa.
        </p>
        <p>
          A ideia é entender sua visão com sinceridade para melhorarmos nosso processo e atendermos
          cada vez melhor os clientes com perfil parecido com o seu.
        </p>
      </div>

      <Button
        onClick={onStart}
        size="lg"
        className="bg-brand-tan hover:bg-brand-beige text-brand-blue rounded-full px-8 py-6 text-base font-semibold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(166,144,115,0.4)] group"
      >
        Começar Experiência
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  )
}
