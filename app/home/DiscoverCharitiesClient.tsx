'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
const DiscoverCharitiesClient = () => {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const [status, setStatus] = useState<'idle' | 'locating' | 'loaded' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const loadMap = (lat: number, lng: number) => {
        // Load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link')
            link.id = 'leaflet-css'
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
        }

        // Load Leaflet JS
        const initMap = () => {
            const L = (window as any).L
            if (!L) { setErrorMsg('Failed to load map library.'); setStatus('error'); return }

            // Destroy existing map instance if any
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }

            const map = L.map(mapRef.current!).setView([lat, lng], 14)
            mapInstanceRef.current = map

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map)

            // User location marker (blue dot)
            const userIcon = L.divIcon({
                className: '',
                html: `<div style="width:14px;height:14px;background:#7BA4D5;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(123,164,213,0.3)"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
            })
            L.marker([lat, lng], { icon: userIcon })
                .addTo(map)
                .bindPopup('<strong>Your Location</strong>')
                .openPopup()

            const radius = 10000
            const overpassQuery = `
                [out:json][timeout:25];
                (
                  node["amenity"="social_facility"](around:${radius},${lat},${lng});
                  node["office"="ngo"](around:${radius},${lat},${lng});
                  node["office"="charity"](around:${radius},${lat},${lng});
                  node["office"="foundation"](around:${radius},${lat},${lng});
                  node["amenity"="community_centre"](around:${radius},${lat},${lng});
                  node["social_facility"](around:${radius},${lat},${lng});
                );
                out body;
            `

            fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: overpassQuery,
            })
                .then(r => r.json())
                .then(data => {
                    const results = data.elements || []

                    // Red marker icon
                    const redIcon = L.divIcon({
                        className: '',
                        html: `<div style="width:12px;height:12px;background:#e05252;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                    })

                    if (results.length === 0) {
                        L.popup()
                            .setLatLng([lat, lng])
                            .setContent('<p style="font-size:12px;color:#666">No tagged charities found nearby on OpenStreetMap. Try zooming out.</p>')
                            .openOn(map)
                    } else {
                        results.slice(0, 20).forEach((place: any) => {
                            const name = place.tags?.name || 'Unnamed Organization'
                            const type = place.tags?.amenity || place.tags?.office || place.tags?.social_facility || 'Organization'
                            L.marker([place.lat, place.lon], { icon: redIcon })
                                .addTo(map)
                                .bindPopup(`
                                    <div style="font-family:sans-serif;min-width:140px">
                                        <strong style="font-size:13px">${name}</strong>
                                        <p style="font-size:11px;color:#888;margin:3px 0 0;text-transform:capitalize">${type.replace('_', ' ')}</p>
                                    </div>
                                `)
                        })
                    }
                })
                .catch(() => {
                    // Overpass failed — map still works, just no markers
                })

            setStatus('loaded')
        }

        if ((window as any).L) { initMap(); return }

        const existing = document.getElementById('leaflet-js')
        if (existing) { existing.addEventListener('load', initMap); return }

        const script = document.createElement('script')
        script.id = 'leaflet-js'
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.onload = initMap
        script.onerror = () => { setErrorMsg('Failed to load map.'); setStatus('error') }
        document.head.appendChild(script)
    }

    const requestLocation = () => {
        setStatus('locating')
        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser.')
            setStatus('error')
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => loadMap(pos.coords.latitude, pos.coords.longitude),
            () => {
                setErrorMsg('Location access was denied. Please allow location access in your browser settings.')
                setStatus('error')
            }
        )
    }

    // Cleanup map on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    return (
        <div className="flex-[0.6] border-[6px] border-[#7BA4D5] rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="bg-[#7BA4D5] px-6 py-3 flex items-center justify-between">
                <h2 className="text-white text-xl font-bold">Discover Charities</h2>
                <Link href="/home/donate" className="bg-white text-[#7BA4D5] hover:text-[#6090C0] px-4 py-1.5 rounded-full text-sm font-black shadow-sm hover:shadow-md transition-all flex items-center gap-1 active:scale-95 group">
                    Donate Now
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
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