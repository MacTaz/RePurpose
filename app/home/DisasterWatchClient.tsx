'use client'

import React, { useEffect, useState, useRef } from 'react'

interface NewsArticle {
    title: string
    description: string
    url: string
    urlToImage: string | null
    image?: string
    publishedAt: string
    source: { name: string }
}

const DisasterWatchClient = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([])
    const [current, setCurrent] = useState(0)
    const [visible, setVisible] = useState(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const currentRef = useRef(0) // tracks current index without stale closure

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/news')
                if (!res.ok) throw new Error('News fetch failed')
                const data = await res.json()
                if (data.articles?.length) {
                    setArticles(data.articles)
                } else {
                    setError(true)
                }
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchNews()
    }, [])

    // Fade out → swap article → fade in
    const transitionTo = (idx: number) => {
        setVisible(false)
        setTimeout(() => {
            setCurrent(idx)
            currentRef.current = idx
            setVisible(true)
        }, 300)
    }

    const startInterval = (articleCount: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            const next = (currentRef.current + 1) % articleCount
            transitionTo(next)
        }, 5000)
    }

    useEffect(() => {
        if (articles.length === 0) return
        startInterval(articles.length)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [articles])

    const goTo = (idx: number) => {
        transitionTo(idx)
        startInterval(articles.length)
    }

    const article = articles[current]

    return (
        <div className="flex-[1.2] flex flex-col border-[6px] border-[#7BA4D5] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#7BA4D5] px-6 py-3 flex items-center justify-between">
                <h2 className="text-white text-xl font-bold">Disaster Watch</h2>
                <span className="text-white/80 text-xs font-medium tracking-wide uppercase">Philippines</span>
            </div>

            <div className="flex-1 bg-white flex overflow-hidden">
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-[#7BA4D5] border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-400">Fetching latest news…</p>
                        </div>
                    </div>
                )}
                {error && !loading && (
                    <div className="flex-1 flex items-center justify-center p-6 text-center">
                        <p className="text-gray-400 text-sm">Unable to load news at this time. Please check your API key or try again later.</p>
                    </div>
                )}
                {!loading && !error && article && (
                    <div className="flex flex-col md:flex-row flex-1 gap-4 p-4 overflow-y-auto md:overflow-hidden">
                        {/* Main article — fades in/out on transition */}
                        <div
                            className="flex-[3] flex flex-col rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? 'translateY(0)' : 'translateY(6px)',
                                transition: 'opacity 300ms ease, transform 300ms ease',
                            }}
                        >
                            <div className="h-48 bg-[#DDE6ED] relative overflow-hidden flex-shrink-0">
                                {article.urlToImage ? (
                                    <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-[#7BA4D5]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                )}
                                <span className="absolute top-2 left-2 bg-[#7BA4D5] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded">
                                    {article.source.name}
                                </span>
                            </div>
                            <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden">
                                <p className="text-[10px] text-gray-400 font-medium">
                                    {new Date(article.publishedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                                <h3 className="text-sm font-bold text-gray-800 line-clamp-3 leading-snug">{article.title}</h3>
                                {article.description && (
                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{article.description}</p>
                                )}
                                <a href={article.url} target="_blank" rel="noopener noreferrer"
                                    className="mt-auto inline-flex items-center gap-1 text-[#7BA4D5] text-xs font-semibold hover:underline">
                                    Read full article
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Sidebar thumbnails */}
                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 min-h-[200px] md:min-h-0" style={{ scrollbarWidth: 'thin' }}>
                            {articles.map((a, idx) => (
                                <button key={idx} onClick={() => goTo(idx)}
                                    className={`text-left rounded-lg border-2 p-2.5 transition-all duration-200 flex-shrink-0 ${idx === current ? 'border-[#7BA4D5] bg-[#EEF3F9]' : 'border-transparent bg-[#DDE6ED] hover:border-[#7BA4D5]/50'}`}>
                                    <p className="text-[10px] text-gray-400 mb-1">
                                        {new Date(a.publishedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-snug">{a.title}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {articles.length > 0 && (
                <div className="flex justify-center gap-1.5 py-2 bg-white border-t border-gray-100">
                    {articles.map((_, i) => (
                        <button key={i} onClick={() => goTo(i)}
                            className={`rounded-full transition-all duration-300 ${i === current ? 'w-4 h-2 bg-[#7BA4D5]' : 'w-2 h-2 bg-gray-300 hover:bg-[#7BA4D5]/50'}`} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default DisasterWatchClient