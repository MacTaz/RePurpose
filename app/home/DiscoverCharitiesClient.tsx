'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MapPin, Clock, Truck, CheckCircle2, AlertTriangle, Search, ChevronRight, Building2, ArrowUpDown } from 'lucide-react'

const DistanceMap = dynamic(() => import('@/components/DistanceMap'), { ssr: false })

interface OrgAddress {
    latitude: number | null
    longitude: number | null
    city?: string | null
    address_line1?: string | null
}

interface RegisteredOrg {
    id: string
    full_name: string | null
    profile_pic: string | null
    organization_profiles: {
        description: string | null
        tagline: string | null
        is_verified: boolean | null
        categories_accepted: string[] | null
        donation_method: string | null
        availability: string | null
        urgent_need: string | null
        website: string | null
        email: string | null
    } | null
    addresses: OrgAddress | null
}

interface OrgWithDistance extends RegisteredOrg {
    roadDistance: string | null
    roadDuration: string | null
    distanceLoading: boolean
}

interface Props {
    registeredOrgs: RegisteredOrg[]
}

const CATEGORY_COLORS: Record<string, string> = {
    'Clothing': '#7BA4D5',
    'Food': '#81C784',
    'Water': '#4FC3F7',
    'Medical Supplies': '#F48FB1',
}

export default function DiscoverCharitiesClient({ registeredOrgs }: Props) {
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
    const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle')
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(registeredOrgs[0]?.id ?? null)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'distance'>('name')
    const [orgsWithDistance, setOrgsWithDistance] = useState<OrgWithDistance[]>(
        registeredOrgs.map(org => ({
            ...org,
            roadDistance: null,
            roadDuration: null,
            distanceLoading: false,
        }))
    )

    const sortedOrgs = useMemo(() => {
        let list = [...orgsWithDistance];
        if (sortBy === 'distance') {
            list.sort((a, b) => {
                const distA = parseFloat(a.roadDistance?.replace(' km', '') || 'Infinity');
                const distB = parseFloat(b.roadDistance?.replace(' km', '') || 'Infinity');
                return distA - distB;
            });
        } else {
            list.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        }
        return list;
    }, [orgsWithDistance, sortBy]);

    const selectedOrg = sortedOrgs.find(o => o.id === selectedOrgId) ?? sortedOrgs[0] ?? null

    const filteredOrgs = sortedOrgs.filter(org => {
        const q = searchQuery.toLowerCase()
        return (
            !q ||
            org.full_name?.toLowerCase().includes(q) ||
            org.organization_profiles?.tagline?.toLowerCase().includes(q) ||
            org.addresses?.city?.toLowerCase().includes(q)
        )
    })

    const fetchRoadDistance = async (
        orgId: string,
        userLat: number, userLng: number,
        orgLat: number, orgLng: number
    ) => {
        setOrgsWithDistance(prev =>
            prev.map(o => o.id === orgId ? { ...o, distanceLoading: true } : o)
        )
        try {
            const res = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${orgLng},${orgLat}?overview=false`
            )
            const data = await res.json()
            if (data.routes?.[0]) {
                const km = (data.routes[0].distance / 1000).toFixed(1)
                const mins = Math.round(data.routes[0].duration / 60)
                const duration = mins >= 60
                    ? `${Math.floor(mins / 60)}h ${mins % 60}m`
                    : `${mins} min`
                setOrgsWithDistance(prev =>
                    prev.map(o => o.id === orgId ? {
                        ...o, roadDistance: `${km} km`, roadDuration: duration, distanceLoading: false
                    } : o)
                )
            } else {
                setOrgsWithDistance(prev =>
                    prev.map(o => o.id === orgId ? { ...o, roadDistance: 'N/A', roadDuration: null, distanceLoading: false } : o)
                )
            }
        } catch {
            setOrgsWithDistance(prev =>
                prev.map(o => o.id === orgId ? { ...o, roadDistance: 'N/A', roadDuration: null, distanceLoading: false } : o)
            )
        }
    }

    const requestLocation = () => {
        setLocationStatus('locating')
        if (!navigator.geolocation) { setLocationStatus('denied'); return }
        navigator.geolocation.getCurrentPosition(
            pos => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                setUserCoords(coords)
                setLocationStatus('granted')

                // 1. Fetch for selected org first
                if (selectedOrgId) {
                    const selOrg = registeredOrgs.find(o => o.id === selectedOrgId);
                    if (selOrg) {
                        const addr = selOrg.addresses;
                        if (addr?.latitude && addr?.longitude) {
                            fetchRoadDistance(selOrg.id, coords.lat, coords.lng, addr.latitude, addr.longitude);
                        }
                    }
                }

                // 2. Fetch for the rest
                registeredOrgs.forEach(org => {
                    if (org.id === selectedOrgId) return; // Skip already started
                    const addr = org.addresses
                    if (addr?.latitude && addr?.longitude) {
                        fetchRoadDistance(org.id, coords.lat, coords.lng, addr.latitude, addr.longitude)
                    }
                })
            },
            () => setLocationStatus('denied')
        )
    }

    const handleSelectOrg = (org: OrgWithDistance) => {
        setSelectedOrgId(org.id)
        const addr = org.addresses
        if (userCoords && addr?.latitude && addr?.longitude && !org.roadDistance && !org.distanceLoading) {
            fetchRoadDistance(org.id, userCoords.lat, userCoords.lng, addr.latitude, addr.longitude)
        }
    }

    return (
        <div className="flex flex-col border-[6px] border-[#7BA4D5] rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-[#7BA4D5] px-6 py-3 flex items-center justify-between">
                <h2 className="text-white text-xl font-bold">Discover Charities</h2>
                <Link
                    href="/home/donate"
                    className="bg-white text-[#7BA4D5] hover:text-[#6090C0] px-4 py-1.5 rounded-full text-sm font-black shadow-sm hover:shadow-md transition-all flex items-center gap-1 active:scale-95 group"
                >
                    Donate Now
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row bg-white lg:h-[600px] lg:overflow-hidden">

                {/* LEFT: Org list */}
                <div className="w-full lg:w-[280px] flex flex-col border-b lg:border-b-0 lg:border-r border-[#edf3fa]">
                    {/* Search & Sort */}
                    <div className="px-3 py-3 border-b border-[#edf3fa] flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search organizations..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full text-xs pl-7 pr-3 py-2 border border-[#d4e4f4] rounded-lg focus:outline-none focus:border-[#7BA4D5] bg-[#F8FBFE] text-gray-600 placeholder-gray-400"
                            />
                        </div>
                        <button
                            onClick={() => setSortBy(prev => prev === 'name' ? 'distance' : 'name')}
                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[10px] font-black uppercase tracking-tight transition-all shrink-0 ${sortBy === 'distance'
                                ? 'bg-[#7BA4D5] text-white border-[#7BA4D5]'
                                : 'bg-[#F8FBFE] text-gray-400 border-[#d4e4f4] hover:border-[#7BA4D5]/40 hover:text-[#7BA4D5]'
                                }`}
                            title={sortBy === 'distance' ? 'Sorting by Road Distance' : 'Sort by Distance'}
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            {sortBy === 'distance' ? 'Dist' : 'A-Z'}
                        </button>
                    </div>

                    {/* List */}
                    <div className="lg:overflow-y-auto lg:flex-1">
                        {filteredOrgs.length === 0 ? (
                            <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                                <Building2 className="w-8 h-8" />
                                <p className="text-xs">No organizations found</p>
                            </div>
                        ) : (
                            filteredOrgs.map(org => {
                                const isSelected = selectedOrgId === org.id
                                const prof = org.organization_profiles
                                return (
                                    <button
                                        key={org.id}
                                        onClick={() => handleSelectOrg(org)}
                                        className={`w-full text-left px-3 py-3 border-b border-[#edf3fa] transition-all flex items-center gap-3 relative
                                            ${isSelected
                                                ? 'bg-[#EEF4FB] border-l-[3px] border-l-[#7BA4D5]'
                                                : 'hover:bg-[#F8FBFE] border-l-[3px] border-l-transparent'
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-[#DDE6ED] border border-[#c8daea] flex items-center justify-center">
                                            {org.profile_pic ? (
                                                <img src={org.profile_pic} alt={org.full_name ?? ''} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-5 h-5 text-[#7BA4D5]" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#1a2f45]' : 'text-gray-700'}`}>
                                                    {org.full_name ?? 'Unnamed Organization'}
                                                </span>
                                                {prof?.is_verified && (
                                                    <CheckCircle2 className="w-3 h-3 text-[#7BA4D5] flex-shrink-0" />
                                                )}
                                            </div>
                                            {prof?.tagline && (
                                                <p className="text-[10px] text-[#7BA4D5] truncate italic">{prof.tagline}</p>
                                            )}
                                            {locationStatus === 'granted' && (
                                                <div className="mt-0.5">
                                                    {org.distanceLoading ? (
                                                        <span className="text-[9px] text-gray-400 flex items-center gap-1">
                                                            <span className="w-2 h-2 border border-[#7BA4D5] border-t-transparent rounded-full animate-spin inline-block" />
                                                            Calculating...
                                                        </span>
                                                    ) : org.roadDistance ? (
                                                        <span className="text-[9px] font-bold text-[#3a5f8a]">
                                                            🛣 {org.roadDistance}
                                                        </span>
                                                    ) : !org.addresses?.latitude ? (
                                                        <span className="text-[9px] text-gray-400">No location set</span>
                                                    ) : null}
                                                </div>
                                            )}
                                            {prof?.urgent_need && (
                                                <span className="text-[9px] bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded mt-0.5 inline-flex items-center gap-0.5">
                                                    <AlertTriangle className="w-2.5 h-2.5" /> {prof.urgent_need}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isSelected ? 'text-[#7BA4D5] translate-x-0.5' : 'text-gray-300'}`} />
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT: Map + Details */}
                <div className="flex-1 flex flex-col lg:overflow-hidden">
                    {selectedOrg ? (
                        <>
                            {/* key={selectedOrg.id} forces full remount when switching orgs so map reinitialises */}
                            <div className="relative overflow-hidden lg:flex-shrink-0 lg:h-[360px]" style={{ height: '220px' }}>
                                {selectedOrg.addresses?.latitude && selectedOrg.addresses?.longitude ? (
                                    <DistanceMap
                                        key={selectedOrg.id}
                                        orgLat={selectedOrg.addresses.latitude}
                                        orgLng={selectedOrg.addresses.longitude}
                                        userLat={userCoords?.lat}
                                        userLng={userCoords?.lng}
                                        zoom={14}
                                        role="donor"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#F5F8FA] flex flex-col items-center justify-center gap-2 text-gray-400">
                                        <MapPin className="w-8 h-8" />
                                        <p className="text-xs font-medium">No location set for this organization</p>
                                    </div>
                                )}

                                {/* Location CTA — floats over the map */}
                                {locationStatus !== 'granted' && selectedOrg.addresses?.latitude && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500]">
                                        {locationStatus === 'idle' && (
                                            <button
                                                onClick={requestLocation}
                                                className="bg-white text-[#3a5f8a] text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-[#d4e4f4] hover:bg-[#EEF4FB] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                            >
                                                <MapPin className="w-3.5 h-3.5 text-[#7BA4D5]" />
                                                Show route from my location
                                            </button>
                                        )}
                                        {locationStatus === 'locating' && (
                                            <div className="bg-white text-[#7BA4D5] text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-[#d4e4f4] flex items-center gap-2">
                                                <span className="w-3 h-3 border-2 border-[#7BA4D5] border-t-transparent rounded-full animate-spin" />
                                                Getting location...
                                            </div>
                                        )}
                                        {locationStatus === 'denied' && (
                                            <div className="bg-white text-red-500 text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-red-200 flex items-center gap-1.5">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Location access denied
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Org detail panel */}
                            <div className="p-4 border-t border-[#edf3fa] lg:overflow-y-auto lg:flex-1 lg:min-h-0">
                                {/* Name */}
                                <div className="mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-black text-[#1a2f45]">
                                            {selectedOrg.full_name ?? 'Unnamed Organization'}
                                        </h3>
                                        {selectedOrg.organization_profiles?.is_verified && (
                                            <CheckCircle2 className="w-4 h-4 text-[#7BA4D5]" />
                                        )}
                                    </div>
                                    {selectedOrg.organization_profiles?.tagline && (
                                        <p className="text-xs text-[#7BA4D5] italic mt-0.5">
                                            {selectedOrg.organization_profiles.tagline}
                                        </p>
                                    )}
                                </div>

                                {/* Distance row */}
                                {locationStatus === 'granted' && selectedOrg.roadDistance && (
                                    <div className="mb-3 bg-[#EEF4FB] rounded-lg px-3 py-2 flex items-center gap-2">
                                        <span className="text-sm">🛣</span>
                                        <span className="text-xs font-bold text-[#3a5f8a]">{selectedOrg.roadDistance} away</span>

                                    </div>
                                )}

                                {/* Urgent need */}
                                {selectedOrg.organization_profiles?.urgent_need && (
                                    <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                        <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Urgent:</span>
                                        <span className="text-xs text-red-600">{selectedOrg.organization_profiles.urgent_need}</span>
                                    </div>
                                )}

                                {/* Meta row */}
                                <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500">
                                    {selectedOrg.addresses?.city && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-[#7BA4D5]" />
                                            {selectedOrg.addresses.city}
                                        </span>
                                    )}
                                    {selectedOrg.organization_profiles?.availability && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-[#7BA4D5]" />
                                            {selectedOrg.organization_profiles.availability}
                                        </span>
                                    )}
                                    {selectedOrg.organization_profiles?.donation_method && (
                                        <span className="flex items-center gap-1 capitalize">
                                            <Truck className="w-3 h-3 text-[#7BA4D5]" />
                                            {selectedOrg.organization_profiles.donation_method}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {selectedOrg.organization_profiles?.description && (
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                                        {selectedOrg.organization_profiles.description}
                                    </p>
                                )}

                                {/* Category pills */}
                                {selectedOrg.organization_profiles?.categories_accepted &&
                                    selectedOrg.organization_profiles.categories_accepted.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedOrg.organization_profiles.categories_accepted.map(cat => (
                                                <span
                                                    key={cat}
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                                                    style={{ background: CATEGORY_COLORS[cat] ?? '#94a3b8' }}
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 p-8">
                            <Building2 className="w-10 h-10" />
                            <p className="text-sm">Select an organization to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
