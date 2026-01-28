import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Прозрачный 1x1 PNG пиксель (base64)
const PIXEL = Uint8Array.from(atob(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
), c => c.charCodeAt(0))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const emailId = url.searchParams.get('id')

    if (!emailId) {
      console.log('No email ID provided')
      return new Response(PIXEL, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders
        }
      })
    }

    console.log('Tracking email open:', emailId)

    // Create Supabase client with SERVICE_ROLE_KEY
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get user agent and IP
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const ipAddress = req.headers.get('x-forwarded-for') ||
                      req.headers.get('x-real-ip') ||
                      'Unknown'

    // Update email log
    const { data: emailLog, error: fetchError } = await supabaseClient
      .from('email_logs')
      .select('*')
      .eq('email_id', emailId)
      .single()

    if (fetchError) {
      console.error('Error fetching email log:', fetchError)
    } else if (emailLog) {
      const now = new Date().toISOString()
      const isFirstOpen = !emailLog.opened_at

      const { error: updateError } = await supabaseClient
        .from('email_logs')
        .update({
          opened_at: emailLog.opened_at || now,
          opened_count: emailLog.opened_count + 1,
          last_opened_at: now,
          user_agent: userAgent,
          ip_address: ipAddress,
        })
        .eq('email_id', emailId)

      if (updateError) {
        console.error('Error updating email log:', updateError)
      } else {
        console.log(`Email ${emailId} opened. Count: ${emailLog.opened_count + 1}, First open: ${isFirstOpen}`)
      }
    }

    // Return transparent pixel
    return new Response(PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...corsHeaders
      }
    })
  } catch (error) {
    console.error('Error in track-email-open:', error)

    // Always return pixel even on error
    return new Response(PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders
      }
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/track-email-open' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODQ5NjQ3Mzd9.TvsZusTlCnVCI5MHioDj7ddsYuNPNgjp26wURG2YTYNw-bqLR-o7F043F3Mf5ynDsZJo9jiV6fvB1aLXONOK2A' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
