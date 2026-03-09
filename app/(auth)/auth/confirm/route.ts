import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next')
    const isRecovery = type === 'recovery' || next === '/reset-password'
    const finalNext = next ?? (isRecovery ? '/reset-password' : '/home')
    const token_hash = searchParams.get('token_hash')

    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const supabase = await createClient()

    // ── Email OTP (token_hash) — checked FIRST before OAuth code ─────────
    if (token_hash && type) {

        // ── Recovery: redirect immediately, verify on the reset page ─────
        // Do NOT call verifyOtp here for recovery — doing so creates a normal
        // session which middleware treats as a logged-in user and sends to /home.
        // Instead, pass token_hash + type to /reset-password and verify there.
        if (isRecovery) {
            const resetUrl = new URL('/reset-password', origin)
            resetUrl.searchParams.set('token_hash', token_hash)
            resetUrl.searchParams.set('type', type)
            return NextResponse.redirect(resetUrl)
        }

        // ── All other OTP types (signup, email_change, etc.) ─────────────
        const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })

        if (!error && data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('setup_complete')
                .eq('id', data.user.id)
                .maybeSingle()

            if (type === 'signup') {
                if (profile?.setup_complete === true) {
                    // Already fully registered — go to app
                    return NextResponse.redirect(new URL('/home', origin))
                }
                // Email confirmed for new signup → Step 1 (Finalize Account)
                const registerUrl = new URL('/register', origin)
                registerUrl.searchParams.set('step', '1')
                return NextResponse.redirect(registerUrl)
            }

            // Fallback for any other verified OTP type
            if (profile?.setup_complete === true) {
                return NextResponse.redirect(new URL('/home', origin))
            }
            return NextResponse.redirect(new URL(finalNext, origin))
        }

        // verifyOtp failed — invalid or expired link
        const errorUrl = new URL('/error', origin)
        if (error) errorUrl.searchParams.set('message', error.message)
        return NextResponse.redirect(errorUrl)
    }

    // ── OAuth code exchange — only runs if NO token_hash present ─────────
    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            const errorUrl = new URL('/error', origin)
            errorUrl.searchParams.set('message', error.message)
            return NextResponse.redirect(errorUrl)
        }

        if (data.user) {
            if (isRecovery) {
                return NextResponse.redirect(new URL('/reset-password', origin))
            }
            const { data: profile } = await supabase
                .from('profiles')
                .select('setup_complete')
                .eq('id', data.user.id)
                .maybeSingle()

            if (profile?.setup_complete === true) {
                return NextResponse.redirect(new URL(finalNext, origin))
            } else {
                // OAuth user — send to register with email pre-filled
                const registerUrl = new URL('/register', origin)
                registerUrl.searchParams.set('oauth', 'true')
                registerUrl.searchParams.set('email', data.user.email ?? '')
                return NextResponse.redirect(registerUrl)
            }
        }
    }

    const errorUrl = new URL('/error', origin)
    return NextResponse.redirect(errorUrl)
}