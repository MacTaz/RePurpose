'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

interface DistanceMapProps {
    orgLat: number;
    orgLng: number;
    userLat?: number;
    userLng?: number;
    zoom?: number;
}

export default function DistanceMap({ orgLat, orgLng, userLat, userLng, zoom = 14 }: DistanceMapProps) {
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [distanceKm, setDistanceKm] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        let mapInstance: any = null;
        let isMounted = true;

        const initMap = async () => {
            if (!mapContainerRef.current || mapRef.current) return;
            const container = mapContainerRef.current as any;
            if (container._leaflet_id) return;

            const L = (await import('leaflet')).default;

            if (!isMounted || !mapContainerRef.current) return;
            if ((mapContainerRef.current as any)._leaflet_id) return;

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            // Initialize interactive map (moveable)
            mapInstance = L.map(mapContainerRef.current, {
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
            }).addTo(mapInstance);

            const orgLocation = L.latLng(orgLat, orgLng);
            const orgIcon = L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });

            L.marker(orgLocation, { icon: orgIcon })
                .bindPopup('<b>Organization</b>')
                .addTo(mapInstance);

            if (userLat && userLng) {
                const userLocation = L.latLng(userLat, userLng);
                const userIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                });

                L.marker(userLocation, { icon: userIcon })
                    .bindPopup('<b>Your Dispatch Location</b>')
                    .addTo(mapInstance);

                // Draw dashed line
                const latlngs = [userLocation, orgLocation];
                L.polyline(latlngs, { color: '#30496E', dashArray: '5, 10', weight: 4 }).addTo(mapInstance);

                // Zoom map to fit both markers
                const bounds = L.latLngBounds(userLocation, orgLocation);
                mapInstance.fitBounds(bounds, { padding: [50, 50] });

                // Haversine distance from leaflet
                const distanceInMeters = userLocation.distanceTo(orgLocation);
                setDistanceKm((distanceInMeters / 1000).toFixed(2));
            } else {
                mapInstance.setView(orgLocation, zoom);
            }

            mapRef.current = mapInstance;

            setTimeout(() => {
                mapInstance.invalidateSize();
            }, 100);
        };

        if (orgLat && orgLng) {
            initMap();
        }

        return () => {
            isMounted = false;
            if (mapInstance) {
                mapInstance.remove();
                mapRef.current = null;
            }
        };
    }, [orgLat, orgLng, userLat, userLng, zoom]);

    useEffect(() => {
        if (mapRef.current && orgLat && orgLng) {
            const L = window.L as any;
            if (!L) return;
            const orgLoc = L.latLng(orgLat, orgLng);

            if (userLat && userLng) {
                const userLoc = L.latLng(userLat, userLng);
                const bounds = L.latLngBounds(userLoc, orgLoc);
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                setDistanceKm((userLoc.distanceTo(orgLoc) / 1000).toFixed(2));
            } else {
                mapRef.current.setView(orgLoc, zoom);
            }
        }
    }, [orgLat, orgLng, userLat, userLng, zoom]);


    // Organization has no location
    if (!orgLat || !orgLng) {
        return (
            <div className="w-full h-[300px] lg:h-[350px] bg-gray-50 rounded-[24px] lg:rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                <MapPin className="size-8 mb-2 opacity-30" />
                <p className="font-bold text-sm">Organization location not set</p>
                <p className="text-xs uppercase tracking-widest mt-1">Cannot calculate distance</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[300px] lg:h-[350px] rounded-[24px] lg:rounded-[32px] overflow-hidden border-2 border-white shadow-xl relative group z-0">
            <div ref={mapContainerRef} className="h-full w-full absolute inset-0 z-0" style={{ zIndex: 0 }} />

            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center gap-3 z-[400] transition-all hover:scale-105 cursor-default">
                <div className="size-8 rounded-lg bg-[#30496E]/10 flex items-center justify-center">
                    <Navigation className="size-4 text-[#30496E]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black tracking-widest uppercase text-gray-400">Donation Distance</span>
                    {distanceKm ? (
                        <span className="text-sm font-black text-[#30496E]">{distanceKm} km <span className="text-xs text-gray-400 font-bold uppercase tracking-tight">away</span></span>
                    ) : (
                        <span className="text-xs font-bold text-gray-500">Unknown distance</span>
                    )}
                </div>
            </div>
        </div>
    );
}
