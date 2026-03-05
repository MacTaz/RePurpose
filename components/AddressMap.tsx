'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import 'leaflet/dist/leaflet.css'

interface AddressMapProps {
    userId: string
}

export default function AddressMap({ userId }: AddressMapProps) {
    const mapRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const isSavedRef = useRef(false)
    const supabase = createClient()

    const [addressForm, setAddressForm] = useState({
        line1: '',
        line2: '',
        city: '',
        country: '',
        zip: '',
        latitude: 14.5995,
        longitude: 120.9842
    })
    const [isSaved, setIsSaved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Initialize Leaflet map
    useEffect(() => {
        if (typeof window === 'undefined') return
        if (mapRef.current) return

        const initMap = async () => {
            const L = (await import('leaflet')).default

            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            })

            if (!mapContainerRef.current) return

            const container = mapContainerRef.current as any
            if (container._leaflet_id) {
                container._leaflet_id = null
            }

            const map = L.map(mapContainerRef.current, {
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
            }).setView([14.5995, 120.9842], 13)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map)

            const marker = L.marker([14.5995, 120.9842], {
                draggable: true
            }).addTo(map)

            map.on('click', async (e: any) => {
                if (isSavedRef.current) return
                const { lat, lng } = e.latlng
                marker.setLatLng([lat, lng])
                await reverseGeocode(lat, lng)
            })

            marker.on('dragend', async () => {
                if (isSavedRef.current) return
                const { lat, lng } = marker.getLatLng()
                await reverseGeocode(lat, lng)
            })

            mapRef.current = map
            markerRef.current = marker

            // Load address AFTER map is ready
            loadAddressData(map, marker)
        }

        initMap()

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [])

    // Separate function to load address data
    const loadAddressData = async (map: any, marker: any) => {
        const { data } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()

        if (data) {
            setAddressForm({
                line1: data.address_line1 || '',
                line2: data.address_line2 || '',
                city: data.city || '',
                country: data.country || '',
                zip: data.zip || '',
                latitude: data.latitude || 14.5995,
                longitude: data.longitude || 120.9842
            })
            setIsSaved(true)
            isSavedRef.current = true
            map.off('click')
            marker.dragging.disable()
            map.setView([data.latitude, data.longitude], 13)
            marker.setLatLng([data.latitude, data.longitude])
        }
    }

    // Reverse geocode
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            )
            const data = await res.json()
            const address = data.address
            setAddressForm(prev => ({
                ...prev,
                line1: `${address.road || ''} ${address.house_number || ''}`.trim(),
                city: address.city || address.town || address.municipality || '',
                country: address.country || '',
                zip: address.postcode || '',
                latitude: lat,
                longitude: lng
            }))
        } catch (err) {
            console.error('Reverse geocode error:', err)
        }
    }

    // Forward geocode
    const forwardGeocode = async (query: string) => {
        if (!query || query.length < 3) return
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
            )
            const data = await res.json()
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat)
                const lng = parseFloat(data[0].lon)
                setAddressForm(prev => ({ ...prev, latitude: lat, longitude: lng }))
                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([lat, lng], 13)
                    markerRef.current.setLatLng([lat, lng])
                }
            }
        } catch (err) {
            console.error('Forward geocode error:', err)
        }
    }

    // Save to Supabase
    const handleConfirm = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('addresses')
                .upsert({
                    user_id: userId,
                    address_line1: addressForm.line1,
                    address_line2: addressForm.line2,
                    city: addressForm.city,
                    country: addressForm.country,
                    zip: addressForm.zip,
                    latitude: addressForm.latitude,
                    longitude: addressForm.longitude
                }, { onConflict: 'user_id' })

            if (error) throw error

            setIsSaved(true)
            isSavedRef.current = true
            if (mapRef.current) mapRef.current.off('click')
            if (markerRef.current) markerRef.current.dragging.disable()

        } catch (err) {
            console.error('Save error:', JSON.stringify(err))
        } finally {
            setIsLoading(false)
        }
    }

    // Handle edit
    const handleEdit = () => {
        setIsSaved(false)
        isSavedRef.current = false

        if (mapRef.current) {
            mapRef.current.on('click', async (e: any) => {
                if (isSavedRef.current) return
                const { lat, lng } = e.latlng
                markerRef.current?.setLatLng([lat, lng])
                await reverseGeocode(lat, lng)
            })
        }
        if (markerRef.current) {
            markerRef.current.dragging.enable()
            console.log('dragging after enable:', markerRef.current?.dragging)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row h-full w-full gap-12 relative z-10 animate-in fade-in duration-500">

            {/* Left - Map */}
            <div className="w-full lg:w-1/2 rounded-2xl shadow-xl border border-white/50" style={{ height: '500px' }}>
                <div ref={mapContainerRef} style={{ height: '500px', width: '100%' }} />
            </div>

            {/* Right - Address Fields */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between pt-2">
                {!isSaved ? (
                    <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                        <div>
                            <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">Address line 1</label>
                            <input
                                type="text"
                                value={addressForm.line1}
                                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                                onBlur={(e) => forwardGeocode(e.target.value)}
                                placeholder="e.g. 123 Main Street"
                                className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                            />
                        </div>
                        <div>
                            <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">Address line 2</label>
                            <input
                                type="text"
                                value={addressForm.line2}
                                onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                                placeholder="e.g. Unit 4B, Building Name, Subdivision"
                                className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">City</label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    placeholder="e.g. Quezon City"
                                    className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                                />
                            </div>
                            <div>
                                <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">Country</label>
                                <input
                                    type="text"
                                    value={addressForm.country}
                                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                    placeholder="e.g. Philippines"
                                    className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">Zip/Postal Code</label>
                            <input
                                type="text"
                                value={addressForm.zip}
                                onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                placeholder="e.g. 1101"
                                className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/50 text-[#30496E]">
                        <h3 className="text-2xl font-extrabold tracking-wide mb-6 border-b border-[#30496E]/10 pb-4">Your Saved Address</h3>
                        <div className="space-y-3 text-xl font-medium">
                            <p>{addressForm.line1}</p>
                            {addressForm.line2 && <p>{addressForm.line2}</p>}
                            <p>{addressForm.city}, {addressForm.country}</p>
                            <p className="text-slate-500 text-lg">{addressForm.zip}</p>
                        </div>
                    </div>
                )}

                {/* Confirm / Edit Button */}
                <div className="flex justify-center mt-12 pb-2">
                    {!isSaved ? (
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-64 bg-[#30496E] hover:bg-[#233855] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl rounded-full py-3.5 shadow-lg font-medium tracking-wide text-white text-xl disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Confirm'}
                        </button>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="w-64 bg-white hover:bg-[#f0f4f8] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl rounded-full py-3.5 shadow-lg font-bold tracking-wide text-[#30496E] text-xl border border-white/50"
                        >
                            Edit Address
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}