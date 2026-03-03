'use client'

import React, { useRef, useState } from 'react'

const DiscoverCharitiesClient = () => {
    const mapRef = useRef<HTMLDivElement>(null)
    const [status, setStatus] = useState<'idle' | 'locating' | 'loaded' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const loadMap = (lat: number, lng: number) => {
        if (!mapRef.current) return
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
            setErrorMsg('Google Maps API key is not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local')
            setStatus('error')
            return
        }

        const initMap = () => {
            const google = (window as any).google
            if (!google?.maps) { setErrorMsg('Google Maps failed to load.'); setStatus('error'); return }

            const map = new google.maps.Map(mapRef.current!, {
                center: { lat, lng },
                zoom: 13,
                styles: [
                    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DDE6ED' }] },
                    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
                    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F5F8FA' }] },
                ],
            })

            new google.maps.Marker({
                position: { lat, lng }, map, title: 'Your Location',
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#7BA4D5', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 2 },
            })

            const service = new google.maps.places.PlacesService(map)
            service.nearbySearch(
                { location: { lat, lng }, radius: 5000, keyword: 'charity organization NGO foundation relief' },
                (results: any[], s: string) => {
                    if (s === google.maps.places.PlacesServiceStatus.OK && results) {
                        results.slice(0, 10).forEach((place: any) => {
                            const marker = new google.maps.Marker({
                                position: place.geometry.location, map, title: place.name,
                                icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            })
                            const iw = new google.maps.InfoWindow({
                                content: `<div style="font-family:sans-serif;max-width:200px;padding:2px"><strong style="font-size:13px">${place.name}</strong><p style="font-size:11px;color:#666;margin:4px 0 0">${place.vicinity || ''}</p></div>`,
                            })
                            marker.addListener('click', () => iw.open(map, marker))
                        })
                    }
                }
            )
            setStatus('loaded')
        }

        if ((window as any).google?.maps) { initMap(); return }
        const existing = document.getElementById('gmaps-script')
        if (existing) { existing.addEventListener('load', initMap); return }
        const script = document.createElement('script')
        script.id = 'gmaps-script'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.onload = initMap
        script.onerror = () => { setErrorMsg('Failed to load Google Maps. Check your API key.'); setStatus('error') }
        document.head.appendChild(script)
    }

    const requestLocation = () => {
        setStatus('locating')
        if (!navigator.geolocation) { setErrorMsg('Geolocation is not supported by your browser.'); setStatus('error'); return }
        navigator.geolocation.getCurrentPosition(
            (pos) => loadMap(pos.coords.latitude, pos.coords.longitude),
            () => { setErrorMsg('Location access was denied. Please allow location access in your browser settings.'); setStatus('error') }
        )
    }

    return (
        <div className="flex-[0.6] border-[6px] border-[#7BA4D5] rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="bg-[#7BA4D5] px-6 py-3">
                <h2 className="text-white text-xl font-bold">Discover Charities</h2>
            </div>
            <div className="flex-1 bg-white relative overflow-hidden" style={{ minHeight: '200px' }}>
                <div ref={mapRef} className="w-full h-full absolute inset-0" />

                {status === 'idle' && (
                    <div className="absolute inset-0 bg-[#F5F8FA] flex flex-col items-center justify-center gap-3 p-4 z-10">
                        <div className="w-12 h-12 rounded-full bg-[#DDE6ED] flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#7BA4D5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 text-center">Find charitable organizations near you</p>
                        <button onClick={requestLocation} className="bg-[#7BA4D5] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#6090C0] transition-colors">
                            Use My Location
                        </button>
                    </div>
                )}
                {status === 'locating' && (
                    <div className="absolute inset-0 bg-[#F5F8FA]/80 flex flex-col items-center justify-center gap-3 z-10">
                        <div className="w-8 h-8 border-4 border-[#7BA4D5] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Finding your location…</p>
                    </div>
                )}
                {status === 'error' && (
                    <div className="absolute inset-0 bg-[#F5F8FA] flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
                        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <p className="text-sm text-gray-500">{errorMsg}</p>
                        <button onClick={requestLocation} className="bg-[#7BA4D5] text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-[#6090C0] transition-colors">
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DiscoverCharitiesClient