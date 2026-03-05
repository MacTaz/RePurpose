import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/home'
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null

    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

    const supabase = await createClient()

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('setup_complete')
                .eq('id', data.user.id)
                .maybeSingle()

            if (profile?.setup_complete === true) {
                return NextResponse.redirect(new URL(next, origin))
            } else {
                // Send OAuth users to register page with email pre-filled
                const registerUrl = new URL('/register', origin)
                registerUrl.searchParams.set('oauth', 'true')
                registerUrl.searchParams.set('email', data.user.email ?? '')
                return NextResponse.redirect(registerUrl)
            }
        }
    }

    if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })
        if (!error && data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('setup_complete')
                .eq('id', data.user.id)
                .maybeSingle()

            if (profile?.setup_complete === true) {
                return NextResponse.redirect(new URL(next, origin))
            } else {
                const registerUrl = new URL('/register', origin)
                registerUrl.searchParams.set('oauth', 'true')
                registerUrl.searchParams.set('email', data.user.email ?? '')
                return NextResponse.redirect(registerUrl)
            }
        }
    }

    return NextResponse.redirect(new URL('/error', origin))
}
