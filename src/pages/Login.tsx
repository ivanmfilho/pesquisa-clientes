import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  if (authLoading) return null
  if (user) return <Navigate to="/results" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error('Credenciais inválidas. Verifique seu email e senha.')
    } else {
      toast.success('Login realizado com sucesso!')
      navigate('/results')
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <Link
        to="/"
        className="inline-flex items-center text-white/50 text-sm mb-8 hover:text-brand-beige transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a pesquisa
      </Link>
      <div className="glass-panel p-8 md:p-10 rounded-2xl">
        <h1 className="text-2xl md:text-3xl font-medium text-brand-beige mb-2">Acesso restrito</h1>
        <p className="text-white/50 text-sm mb-8">
          Faça login para visualizar as respostas da pesquisa.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-tan hover:bg-brand-beige text-brand-blue font-semibold rounded-full py-6 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
