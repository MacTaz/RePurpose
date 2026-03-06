import React from 'react';
import dynamic from 'next/dynamic';
// Import component properly with SSR skipped to prevent hydration issues
const CharityMatchingRaw = dynamic(() => import('@/components/CharityMatching'), { return: true, ssr: false });

export default function CharityMatchingPreview() {
    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">CharityMatching Component Preview</h1>
                <p className="text-gray-600">This is a development preview page.</p>
            </div>

            {/* The component itself */}
            <CharityMatchingRaw />
        </div>
    );
}
