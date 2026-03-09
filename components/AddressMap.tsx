'use client';
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, CheckCircle2, Edit3, Loader2 } from 'lucide-react'

interface AddressMapProps {
    userId: string
    role?: 'donor' | 'organization'
    externalIsEditing?: boolean
}

const AddressMap = forwardRef<any, AddressMapProps>(({ userId, role = 'donor', externalIsEditing }, ref) => {
    const isDonor = role === 'donor'
    const textColor = isDonor ? 'text-[#30496E]' : 'text-[#FF9248]'
    const bgColor = isDonor ? 'bg-[#30496E]' : 'bg-[#FF9248]'
    const focusBorder = isDonor ? 'focus:border-[#30496E]/20' : 'focus:border-[#FF9248]/20'
    const borderColor = isDonor ? 'border-[#30496E]' : 'border-[#FF9248]'

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
    const [isSaving, setIsSaving] = useState(false)

    // Derived editing state
    const effectiveIsEditing = externalIsEditing !== undefined ? externalIsEditing : !isSaved

    useImperativeHandle(ref, () => ({
        saveAddress: handleConfirm,
        resetAddress: () => {
            if (mapRef.current && markerRef.current) {
                loadAddressData(mapRef.current, markerRef.current)
            }
        }
    }))

    // Synchronize isSavedRef and marker dragging when externalIsEditing changes
    useEffect(() => {
        if (externalIsEditing !== undefined) {
            isSavedRef.current = !externalIsEditing
            if (markerRef.current) {
                if (externalIsEditing) {
                    markerRef.current.dragging.enable()
                } else {
                    markerRef.current.dragging.disable()
                }
            }
        }
    }, [externalIsEditing])

    // Initialize Leaflet map
    useEffect(() => {
        if (typeof window === 'undefined') return
        let mapInstance: any = null
        let isMounted = true

        const initMap = async () => {
            if (!mapContainerRef.current || mapRef.current) return
            const container = mapContainerRef.current as any
            if (container._leaflet_id) return

            const L = (await import('leaflet')).default

            if (!isMounted || !mapContainerRef.current) return
            if ((mapContainerRef.current as any)._leaflet_id) return

            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            })

            mapInstance = L.map(mapContainerRef.current, {
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
            }).setView([14.5995, 120.9842], 13)

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
            }).addTo(mapInstance)

            const marker = L.marker([14.5995, 120.9842], {
                draggable: true
            }).addTo(mapInstance)

            mapInstance.on('click', async (e: any) => {
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

            mapRef.current = mapInstance
            markerRef.current = marker

            setTimeout(() => {
                mapInstance.invalidateSize()
            }, 100)

            loadAddressData(mapInstance, marker)
        }

        initMap()

        return () => {
            isMounted = false
            if (mapInstance) {
                mapInstance.remove()
                mapRef.current = null
            }
        }
    }, [])

    // Handle map container resizing (especially when toggling visibility)
    useEffect(() => {
        if (!mapRef.current || !mapContainerRef.current) return
        const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize()
            }
        })
        resizeObserver.observe(mapContainerRef.current)
        return () => resizeObserver.disconnect()
    }, [])

    const loadAddressData = async (map: any, marker: any) => {
        setIsLoading(true)
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

            const saved = externalIsEditing !== undefined ? !externalIsEditing : true
            setIsSaved(true)
            isSavedRef.current = saved

            if (saved) {
                marker.dragging.disable()
            } else {
                marker.dragging.enable()
            }

            map.setView([data.latitude, data.longitude], 15)
            marker.setLatLng([data.latitude, data.longitude])
        }
        setIsLoading(false)
    }

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
            const data = await res.json()
            const addr = data.address
            setAddressForm(prev => ({
                ...prev,
                line1: `${addr.road || ''} ${addr.house_number || ''}`.trim(),
                city: addr.city || addr.town || addr.municipality || '',
                country: addr.country || '',
                zip: addr.postcode || '',
                latitude: lat,
                longitude: lng
            }))
        } catch (err) {
            console.error('Reverse geocode error:', err)
        }
    }

    const forwardGeocode = async (query: string) => {
        if (!query || query.length < 5) return
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
            const data = await res.json()
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat)
                const lng = parseFloat(data[0].lon)
                setAddressForm(prev => ({ ...prev, latitude: lat, longitude: lng }))
                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([lat, lng], 15)
                    markerRef.current.setLatLng([lat, lng])
                }
            }
        } catch (err) {
            console.error('Forward geocode error:', err)
        }
    }

    const handleConfirm = async () => {
        setIsSaving(true)
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
            if (externalIsEditing === undefined) {
                setIsSaved(true)
                isSavedRef.current = true
                markerRef.current?.dragging.disable()
            }
            return { success: true }
        } catch (err: any) {
            console.error('Save error:', err)
            return { success: false, error: err.message }
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = () => {
        setIsSaved(false)
        isSavedRef.current = false
        markerRef.current?.dragging.enable()
    }

    return (
        <div className="flex flex-col lg:flex-row h-full w-full gap-8">
            {/* Map Section */}
            <div className={`w-full lg:w-3/5 min-h-[400px] lg:min-h-full rounded-[32px] overflow-hidden shadow-inner border-2 ${borderColor} relative group`}>
                <div ref={mapContainerRef} className="h-full w-full min-h-[400px]" />
                <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100">
                    <p className={`text-[10px] font-black ${textColor} uppercase tracking-widest flex items-center gap-2`}>
                        <Navigation className="size-3" /> Map Locator
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-2/5 flex flex-col space-y-6 lg:p-4">
                <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2">
                    <h2 className={`text-2xl font-black ${textColor} flex items-center gap-3`}>
                        <MapPin className={`size-6 ${textColor}`} />
                        Dispatch Address
                    </h2>

                    <div className="grid gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Address Line 1</label>
                            <input
                                disabled={!effectiveIsEditing}
                                type="text"
                                value={addressForm.line1}
                                onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })}
                                onBlur={e => forwardGeocode(`${e.target.value}, ${addressForm.city}, ${addressForm.country}`)}
                                className={`w-full h-12 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all disabled:opacity-70`}
                                placeholder="Street name and house number"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Address Line 2 (Optional)</label>
                            <input
                                disabled={!effectiveIsEditing}
                                type="text"
                                value={addressForm.line2}
                                onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })}
                                className={`w-full h-12 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all disabled:opacity-70`}
                                placeholder="Apartment, suite, unit, etc."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase text-gray-400 ml-1">City</label>
                                <input
                                    disabled={!effectiveIsEditing}
                                    type="text"
                                    value={addressForm.city}
                                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                    className={`w-full h-12 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all disabled:opacity-70`}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase text-gray-400 ml-1">Country</label>
                                <input
                                    disabled={!effectiveIsEditing}
                                    type="text"
                                    value={addressForm.country}
                                    onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                                    className={`w-full h-12 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all disabled:opacity-70`}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Zip / Postal Code</label>
                            <input
                                disabled={!effectiveIsEditing}
                                type="text"
                                value={addressForm.zip}
                                onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })}
                                className={`w-full h-12 bg-gray-50 border-2 border-transparent rounded-2xl px-4 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all disabled:opacity-70`}
                            />
                        </div>
                    </div>
                </div>

                {externalIsEditing === undefined && (
                    <div className="pt-6 border-t border-gray-100">
                        {!isSaved ? (
                            <button
                                onClick={handleConfirm}
                                disabled={isSaving}
                                className={`w-full py-4 ${bgColor} text-white rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50`}
                            >
                                {isSaving ? <Loader2 className="animate-spin size-5" /> : <CheckCircle2 className="size-5" />}
                                Confirm Location
                            </button>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className={`w-full py-4 bg-white ${textColor} border-2 ${borderColor} rounded-2xl font-black shadow-md hover:bg-gray-50 transition-all flex items-center justify-center gap-3`}
                            >
                                <Edit3 className="size-5" />
                                Update Address
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
})

AddressMap.displayName = 'AddressMap'
export default AddressMap
