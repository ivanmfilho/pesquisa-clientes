import { useState, useEffect, useMemo, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import {
  getAllResponses,
  QUESTION_LABELS,
  type SurveyResponseRow,
} from '@/services/survey-responses'
import {
  LogOut,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  MessageSquare,
  Download,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'

interface SessionGroup {
  session_id: string
  created_at: string
  responses: SurveyResponseRow[]
}

export default function Results() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [allResponses, setAllResponses] = useState<SurveyResponseRow[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [questionFilter, setQuestionFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [fetching, setFetching] = useState(true)

  const fetchResponses = useCallback(async () => {
    setFetching(true)
    const { data, error } = await getAllResponses({
      startDate: startDate || undefined,
      endDate: endDate ? endDate + 'T23:59:59' : undefined,
    })
    if (error) toast.error('Erro ao carregar respostas.')
    else setAllResponses(data || [])
    setFetching(false)
  }, [startDate, endDate])

  useEffect(() => {
    if (!user) return
    fetchResponses()
  }, [user, fetchResponses])

  const sessions = useMemo<SessionGroup[]>(() => {
    const map = new Map<string, SessionGroup>()
    for (const row of allResponses) {
      const existing = map.get(row.session_id)
      if (!existing) {
        map.set(row.session_id, {
          session_id: row.session_id,
          created_at: row.created_at,
          responses: [row],
        })
      } else {
        existing.responses.push(row)
      }
    }
    return Array.from(map.values())
  }, [allResponses])

  const getFilteredResponses = (responses: SurveyResponseRow[]) => {
    if (questionFilter === 'all') return responses
    return responses.filter((r) => r.question_label === questionFilter)
  }

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))

  const handleExportCSV = () => {
    const rows: string[] = ['Session ID,Date,Question,Answer Text']
    for (const session of sessions) {
      const filtered = getFilteredResponses(session.responses)
      for (const r of filtered) {
        const escapedAnswer = (r.answer_text || '').replace(/"/g, '""')
        const escapedQuestion = (r.question_label || '').replace(/"/g, '""')
        rows.push(
          `"${r.session_id}","${formatDate(r.created_at)}","${escapedQuestion}","${escapedAnswer}"`,
        )
      }
    }
    const csv = rows.join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pesquisa-respostas-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('CSV exportado com sucesso!')
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-tan animate-spin" />
      </div>
    )
  if (!user) return <Navigate to="/login" replace />

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

      <div className="glass-panel p-5 rounded-2xl mb-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-tan text-sm font-medium">
          <Filter className="w-4 h-4" />
          <span>Filtros Avançados</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Data inicial</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Data final</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Pergunta</label>
            <Select value={questionFilter} onValueChange={setQuestionFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                <SelectValue placeholder="Todas as perguntas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as perguntas</SelectItem>
                {Object.values(QUESTION_LABELS).map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={fetchResponses}
            className="bg-brand-tan hover:bg-brand-beige text-brand-blue text-sm rounded-full px-6"
          >
            Aplicar filtros
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-brand-tan/30 text-brand-beige hover:bg-brand-tan/10 text-sm rounded-full px-6"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 text-brand-tan animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center">
          <MessageSquare className="w-12 h-12 text-brand-tan/40 mx-auto mb-4" />
          <p className="text-white/60">Nenhuma resposta encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const filteredResponses = getFilteredResponses(session.responses)
            const hasFiltered = filteredResponses.length > 0
            return (
              <div key={session.session_id} className="glass-panel rounded-2xl overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === session.session_id ? null : session.session_id)
                  }
                  className="w-full p-5 flex items-center justify-between text-left active:bg-white/5 transition-colors min-h-[64px]"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-tan shrink-0" />
                    <div>
                      <p className="text-brand-beige font-medium text-base">
                        {formatDate(session.created_at)}
                      </p>
                      <p className="text-white/40 text-xs">
                        {filteredResponses.length} de {session.responses.length} respostas
                      </p>
                    </div>
                  </div>
                  {expandedId === session.session_id ? (
                    <ChevronUp className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  )}
                </button>
                {expandedId === session.session_id && hasFiltered && (
                  <div className="px-5 pb-5 space-y-4 animate-fade-in">
                    {filteredResponses.map((row) => (
                      <div key={row.id} className="border-t border-white/10 pt-4">
                        <p className="text-brand-tan text-sm font-medium mb-1">
                          {row.question_label}
                        </p>
                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                          {row.answer_text || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
