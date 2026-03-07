import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // ── Redirection Logic ──────────────────────────────────────────────────
    const isNewUser = user && !user.user_metadata?.setup_complete
    const isHomePath = request.nextUrl.pathname.startsWith('/home')

    if (isHomePath && isNewUser) {
        const url = request.nextUrl.clone()
        url.pathname = '/register'

        // Smart resume logic: Only go to Step 2 if the user HAS confirmed their identity (Step 1)
        const isStep1Done = user.user_metadata?.identity_confirmed === true
        const isOAuth = user.app_metadata.provider !== 'email'

        if (isOAuth && !isStep1Done) {
            // First time social user or partially finished -> go to Step 1 for role/password
            url.searchParams.set('oauth', 'true')
            url.searchParams.set('email', user.email || '')
        } else {
            // Email user (always has password) OR social user who finished Step 1 -> go to Step 2
            url.searchParams.set('step', '2')
        }

        return NextResponse.redirect(url)
    }

    return response
}