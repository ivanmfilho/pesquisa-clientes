import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  getSurveySessions,
  getResponsesBySession,
  type SurveySession,
  type SurveyResponseRow,
} from '@/services/survey-responses'
import { LogOut, ChevronDown, ChevronUp, Loader2, Calendar, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function Results() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SurveySession[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, SurveyResponseRow[]>>({})
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    getSurveySessions().then(({ data, error }) => {
      if (error) toast.error('Erro ao carregar respostas.')
      else setSessions(data || [])
      setFetching(false)
    })
  }, [user])

  const handleExpand = async (sessionId: string) => {
    if (expandedId === sessionId) {
      setExpandedId(null)
      return
    }
    setExpandedId(sessionId)
    if (!details[sessionId]) {
      setLoadingDetails(true)
      const { data, error } = await getResponsesBySession(sessionId)
      if (error) toast.error('Erro ao carregar detalhes.')
      else setDetails((prev) => ({ ...prev, [sessionId]: data || [] }))
      setLoadingDetails(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-tan animate-spin" />
      </div>
    )
  if (!user) return <Navigate to="/login" replace />
  if (fetching)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-tan animate-spin" />
      </div>
    )

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-brand-beige">Respostas</h1>
          <p className="text-white/50 text-sm">{sessions.length} sessão(ões)</p>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-white/60 hover:text-brand-beige"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center">
          <MessageSquare className="w-12 h-12 text-brand-tan/40 mx-auto mb-4" />
          <p className="text-white/60">Nenhuma resposta ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.session_id} className="glass-panel rounded-2xl overflow-hidden">
              <button
                onClick={() => handleExpand(session.session_id)}
                className="w-full p-5 flex items-center justify-between text-left active:bg-white/5 transition-colors min-h-[64px]"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-brand-tan shrink-0" />
                  <div>
                    <p className="text-brand-beige font-medium text-base">
                      {formatDate(session.created_at)}
                    </p>
                    <p className="text-white/40 text-xs">{session.response_count} respostas</p>
                  </div>
                </div>
                {expandedId === session.session_id ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>
              {expandedId === session.session_id && (
                <div className="px-5 pb-5 space-y-4 animate-fade-in">
                  {loadingDetails && !details[session.session_id] ? (
                    <Loader2 className="w-5 h-5 text-brand-tan animate-spin mx-auto" />
                  ) : (
                    (details[session.session_id] || []).map((row) => (
                      <div key={row.id} className="border-t border-white/10 pt-4">
                        <p className="text-brand-tan text-sm font-medium mb-1">
                          {row.question_label}
                        </p>
                        <p className="text-white/80 text-sm leading-relaxed">
                          {row.answer_text || '—'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
