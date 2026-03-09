import { NextResponse } from 'next/server'

export async function GET() {
    // Try GNews first
    try {
        const res = await fetch(
            `https://gnews.io/api/v4/search?q=disaster+Philippines&lang=en&country=ph&max=8&apikey=${process.env.NEXT_PUBLIC_GNEWS_API_KEY}`,
            { next: { revalidate: 300 } } // cache for 5 minutes
        )
        if (res.ok) {
            const data = await res.json()
            const articles = (data.articles || []).map((a: any) => ({
                ...a,
                urlToImage: a.image || a.urlToImage || null,
            }))
            if (articles.length > 0) {
                return NextResponse.json({ articles })
            }
        }
    } catch {}

    // Fallback to NewsAPI (must be server-side — blocked by browser on free plan)
    try {
        const res = await fetch(
            `https://newsapi.org/v2/everything?q=disaster+Philippines&language=en&pageSize=8&sortBy=publishedAt&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`,
            { next: { revalidate: 300 } }
        )
        if (res.ok) {
            const data = await res.json()
            if (data.articles?.length) {
                return NextResponse.json({ articles: data.articles })
            }
        }
    } catch {}

    return NextResponse.json({ articles: [] }, { status: 500 })
}