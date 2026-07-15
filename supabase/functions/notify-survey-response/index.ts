import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, name, completedAt } = await req.json()

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const RECIPIENT_EMAIL = Deno.env.get('NOTIFICATION_EMAIL') || 'ivan@mincrs.com.br'
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@mincrs.com.br'

    let responses: { question_label: string; answer_text: string }[] = []

    if (SUPABASE_URL && SERVICE_ROLE_KEY && sessionId) {
      const dbRes = await fetch(
        `${SUPABASE_URL}/rest/v1/survey_responses?session_id=eq.${sessionId}&order=created_at.asc`,
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        },
      )
      if (dbRes.ok) {
        responses = await dbRes.json()
      }
    }

    const answersHtml =
      responses.length > 0
        ? responses
            .map(
              (r) => `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;width:45%;vertical-align:top;">${r.question_label}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;white-space:pre-wrap;">${r.answer_text || '—'}</td>
            </tr>`,
            )
            .join('')
        : '<tr><td colspan="2" style="padding:12px;color:#999;">Nenhuma resposta encontrada para esta sessão.</td></tr>'

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
        subject: `Nova resposta de pesquisa — Minc${name ? ` — ${name}` : ''}`,
        html: `
          <div style="font-family:sans-serif;max-width:640px;margin:0 auto;">
            <h2 style="color:#1a1a2e;">Nova resposta de pesquisa recebida</h2>
            <p><strong>Cliente:</strong> ${name || 'Não informado'}</p>
            <p><strong>Sessão:</strong> ${sessionId || 'N/A'}</p>
            <p><strong>Concluído em:</strong> ${completedAt ? new Date(completedAt).toLocaleString('pt-BR') : 'N/A'}</p>
            <h3 style="color:#1a1a2e;margin-top:24px;">Respostas do cliente</h3>
            <table style="border-collapse:collapse;width:100%;font-size:14px;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;">Pergunta</th>
                  <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;">Resposta</th>
                </tr>
              </thead>
              <tbody>
                ${answersHtml}
              </tbody>
            </table>
            <p style="margin-top:24px;">
              <a href="https://diagnosticodecisao.mincrs.com.br/results" style="display:inline-block;background:#a6907f;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;">Ver painel de resultados</a>
            </p>
          </div>
        `,
      }),
    })

    const data = await emailRes.json()

    return new Response(JSON.stringify({ success: true, data, responsesCount: responses.length }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
