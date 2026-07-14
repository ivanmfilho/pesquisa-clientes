import { Outlet, Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import logoSrc from '@/assets/logo-novo-branco-vertical-a7115.png'

export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden bg-brand-blue">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-blue/50 via-brand-blue/80 to-brand-blue pointer-events-none" />

      <header className="relative z-10 w-full px-6 py-4 md:py-6 flex justify-between items-center">
        <div className="flex items-center">
          <img src={logoSrc} alt="Minc Logo" className="h-14 md:h-20 w-auto object-contain" />
        </div>
        <Link
          to="/results"
          className="text-white/30 hover:text-brand-tan transition-colors text-xs flex items-center gap-1"
        >
          <Lock className="w-3 h-3" /> Admin
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-4 md:py-12">
        <Outlet />
      </div>
    </main>
  )
}
