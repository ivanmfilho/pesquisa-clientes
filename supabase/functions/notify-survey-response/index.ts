import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, sessionId, completedAt } = await req.json()

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const RECIPIENT_EMAIL = Deno.env.get('NOTIFICATION_EMAIL') || 'ivan@mincrs.com.br'
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@mincrs.com.br'

    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email notification')
      return new Response(
        JSON.stringify({ success: false, message: 'Email provider not configured' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: RECIPIENT_EMAIL,
        subject: 'Nova resposta de pesquisa — Minc',
        html: `
          <h2>Nova resposta de pesquisa recebida</h2>
          <p><strong>Cliente:</strong> ${name || 'Não informado'}</p>
          <p><strong>Sessão:</strong> ${sessionId || 'N/A'}</p>
          <p><strong>Concluído em:</strong> ${completedAt ? new Date(completedAt).toLocaleString('pt-BR') : 'N/A'}</p>
          <p>Acesse o <a href="https://diagnosticodecisao.mincrs.com.br/results">painel de resultados</a> para visualizar os detalhes.</p>
        `,
      }),
    })

    const data = await emailRes.json()

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
