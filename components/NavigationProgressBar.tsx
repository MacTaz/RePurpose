'use client'

import NextTopLoader from 'nextjs-toploader'

interface NavigationProgressBarProps {
    color?: string
}

export default function NavigationProgressBar({ color = '#60a5fa' }: NavigationProgressBarProps) {
    return (
        <NextTopLoader
            color={color}
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow={`0 0 10px ${color}, 0 0 5px ${color}`}
        />
    )
}
