import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export function ThankYouStep() {
  return (
    <div className="glass-panel p-10 md:p-16 rounded-2xl flex flex-col items-center text-center max-w-xl mx-auto border-t-brand-tan/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-tan to-transparent opacity-50" />

      <div className="w-20 h-20 bg-brand-tan/20 rounded-full flex items-center justify-center mb-8 ring-1 ring-brand-tan/50 shadow-[0_0_30px_rgba(166,144,115,0.3)]">
        <Check className="w-10 h-10 text-brand-beige" strokeWidth={2} />
      </div>

      <h1 className="text-3xl md:text-4xl mb-4 font-medium text-brand-beige">
        Obrigado pela sua contribuição.
      </h1>

      <p className="text-white/70 text-lg font-light leading-relaxed mb-10">
        Suas respostas são inestimáveis e nos ajudarão a continuar elevando o padrão de excelência
        da Minc para você e nossos futuros clientes.
      </p>

      <Button
        asChild
        className="bg-transparent border border-brand-tan text-brand-beige hover:bg-brand-tan hover:text-brand-blue rounded-full px-8 transition-colors font-semibold"
      >
        <a href="https://mincrs.com.br" target="_blank" rel="noreferrer">
          Retornar ao site da Minc
        </a>
      </Button>
    </div>
  )
}
