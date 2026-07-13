import { Outlet } from 'react-router-dom'
import { Hexagon } from 'lucide-react'

export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden bg-charcoal-900">
      <div
        className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-charcoal-900/80 via-charcoal-900/90 to-charcoal-900" />

      <header className="relative z-10 w-full px-6 py-8 flex justify-center lg:justify-start">
        <div className="flex items-center gap-2">
          <Hexagon className="w-8 h-8 text-gold-500 fill-gold-500/20" strokeWidth={1.5} />
          <span className="font-serif text-2xl tracking-widest text-white">MINC</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 md:py-16">
        <Outlet />
      </div>
    </main>
  )
}
