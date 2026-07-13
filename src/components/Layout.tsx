import { Outlet } from 'react-router-dom'
import logoSrc from '@/assets/logo-novo-branco-vertical-a7115.png'

export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden bg-brand-blue">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-blue/50 via-brand-blue/80 to-brand-blue pointer-events-none" />

      <header className="relative z-10 w-full px-6 py-8 flex justify-center lg:justify-start">
        <div className="flex items-center">
          <img src={logoSrc} alt="Minc Logo" className="h-16 w-auto object-contain" />
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 md:py-16">
        <Outlet />
      </div>
    </main>
  )
}
