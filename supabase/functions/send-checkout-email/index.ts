import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
}

interface CartItem {
  product: {
    id: string
    name: string
    price: number
  }
  quantity: number
  size: string
  color: string
}

interface EmailRequest {
  items: CartItem[]
  totalPrice: number
  userId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Function invoked with verify_jwt=false')

    // Parse request body first (can only be read once!)
    const { items, totalPrice, userId }: EmailRequest = await req.json()
    console.log('Request body parsed:', { userId, itemCount: items.length, totalPrice })

    // Create Supabase client with SERVICE_ROLE_KEY to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Fetching user profile for:', userId)

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('name, email')
      .eq('user_id', userId)
      .single()

    console.log('Profile fetch result:', { profile, error: profileError?.message })

    if (profileError || !profile) {
      console.log('Profile not found for user:', userId)
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const userName = profile.name || 'Valued Customer'
    const userEmail = profile.email

    if (!userEmail) {
      console.log('No email found for user')
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('User email:', userEmail)

    // For testing: Resend only allows sending to verified email in test mode
    // In production, you would send to userEmail after verifying your domain
    const recipientEmail = 'chuchanouski44@gmail.com'
    console.log('Sending email to:', recipientEmail)

    // Generate order items HTML
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.product.name}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.size} / ${item.color}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            $${(item.product.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('')

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MAISON <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: 'Thank You for Your Order! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f9fafb; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 600; color: #111;">MAISON</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
                <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111;">Thank You, ${userName}! 🎉</h2>
                
                <p style="font-size: 16px; color: #6b7280; margin-bottom: 30px;">
                  We're thrilled to have you as our customer. Your order has been received and we're preparing it with care.
                </p>

                <h3 style="font-size: 18px; font-weight: 600; color: #111; margin-bottom: 20px;">Order Summary</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; font-size: 14px;">Item</th>
                      <th style="padding: 12px; text-align: center; font-weight: 600; color: #6b7280; font-size: 14px;">Options</th>
                      <th style="padding: 12px; text-align: center; font-weight: 600; color: #6b7280; font-size: 14px;">Qty</th>
                      <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; font-size: 14px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" style="padding: 16px 12px; text-align: right; font-weight: 600; font-size: 16px;">Total:</td>
                      <td style="padding: 16px 12px; text-align: right; font-weight: 600; font-size: 16px; color: #111;">$${totalPrice.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>

                <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                  We'll send you another email once your order ships.
                </p>
                
                <p style="font-size: 14px; color: #6b7280;">
                  If you have any questions, feel free to reply to this email.
                </p>
              </div>
              
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} MAISON. All rights reserved.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

