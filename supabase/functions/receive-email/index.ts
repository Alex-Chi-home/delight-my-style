import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Интерфейс для вебхука от Resend
interface ResendWebhookEvent {
  type: 'email.received'
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
  }
}

// Интерфейс для полного письма из API
interface ReceivedEmail {
  object: string
  id: string
  to: string[]
  from: string
  subject: string
  html: string | null
  text: string | null
  headers: Record<string, string>
  attachments: Array<{
    filename: string
    content_type: string
    size: number
    content?: string
  }>
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== 📧 ПОЛУЧЕНО ВХОДЯЩЕЕ ПИСЬМО ===')

    const event: ResendWebhookEvent = await req.json()


    // Получаем email_id из вебхука
    const emailId = event.data.email_id

    // Получаем RESEND_API_KEY из переменных окружения
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY не установлен')
    }

    const apiUrl = `https://api.resend.com/emails/receiving/${emailId}`

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${resendApiKey}`
      }
    })


    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error response:', errorText)
      throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const email: ReceivedEmail = await response.json()
    console.log('✅ Получено письмо от API')

    // Логируем основную информацию
    console.log('\n📨 ОСНОВНАЯ ИНФОРМАЦИЯ:')
    console.log('От кого:', email.from)
    console.log('Кому:', email.to.join(', '))
    console.log('Тема:', email.subject)


    console.log('\n📝 СОДЕРЖИМОЕ:')
    if (email.text) {
      console.log('Текстовая версия:')
      console.log('---')
      console.log(email.text)
      console.log('---')
    }

    if (email.html) {
      console.log('\nHTML версия (первые 500 символов):')
      console.log('---')
      console.log(email.html.substring(0, 500))
      console.log('---')
    }

    if (email.attachments && email.attachments.length > 0) {
      console.log('\n📎 ВЛОЖЕНИЯ:')
      email.attachments.forEach((attachment, index) => {
        console.log(`${index + 1}. ${attachment.filename}`)
        console.log(`   Тип: ${attachment.content_type}`)
        console.log(`   Размер: ${attachment.size} байт`)
      })
    } else {
      console.log('\n📎 ВЛОЖЕНИЯ: нет')
    }
    
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email received and logged',
        from: email.from,
        subject: email.subject
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('❌ ОШИБКА при обработке письма:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

