import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export function ThankYouStep() {
  return (
    <div className="glass-panel p-10 md:p-16 rounded-2xl flex flex-col items-center text-center max-w-xl mx-auto border-t-gold-500/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />

      <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center mb-8 ring-1 ring-gold-500/50 shadow-[0_0_30px_rgba(197,160,89,0.3)]">
        <Check className="w-10 h-10 text-gold-500" strokeWidth={2} />
      </div>

      <h1 className="text-3xl md:text-4xl mb-4 font-serif text-white">
        Obrigado pela sua contribuição.
      </h1>

      <p className="text-white/70 text-lg font-light leading-relaxed mb-10">
        Suas respostas são inestimáveis e nos ajudarão a continuar elevando o padrão de excelência
        da Minc para você e nossos futuros clientes.
      </p>

      <Button
        asChild
        className="bg-transparent border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-charcoal-900 rounded-full px-8 transition-colors"
      >
        <a href="https://mincrs.com.br" target="_blank" rel="noreferrer">
          Retornar ao site da Minc
        </a>
      </Button>
    </div>
  )
}
