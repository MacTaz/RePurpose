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
    role?: 'donor' | 'organization';
}

const MARKER_URLS = {
    blue: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    orange: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadow: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
};

const MARKER_COLORS = {
    blue: '#30496E',
    orange: '#FF9248'
};

// Decode OSRM polyline6 geometry (precision 6)
function decodePolyline(encoded: string, precision = 6): [number, number][] {
    const factor = Math.pow(10, precision);
    const result: [number, number][] = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
        let shift = 0, result_ = 0, byte_: number;
        do {
            byte_ = encoded.charCodeAt(index++) - 63;
            result_ |= (byte_ & 0x1f) << shift;
            shift += 5;
        } while (byte_ >= 0x20);
        lat += result_ & 1 ? ~(result_ >> 1) : result_ >> 1;

        shift = 0; result_ = 0;
        do {
            byte_ = encoded.charCodeAt(index++) - 63;
            result_ |= (byte_ & 0x1f) << shift;
            shift += 5;
        } while (byte_ >= 0x20);
        lng += result_ & 1 ? ~(result_ >> 1) : result_ >> 1;

        result.push([lat / factor, lng / factor]);
    }
    return result;
}

export default function DistanceMap({ orgLat, orgLng, userLat, userLng, zoom = 14, role = 'donor' }: DistanceMapProps) {
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const routeLayerRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const [distanceKm, setDistanceKm] = useState<string | null>(null);
    const [routeStatus, setRouteStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

    const isDonorUser = role === 'donor';
    const youColor = isDonorUser ? MARKER_COLORS.blue : MARKER_COLORS.orange;
    const youImg = isDonorUser ? MARKER_URLS.blue : MARKER_URLS.orange;
    const otherColor = isDonorUser ? MARKER_COLORS.orange : MARKER_COLORS.blue;
    const otherImg = isDonorUser ? MARKER_URLS.orange : MARKER_URLS.blue;
    const otherLabel = isDonorUser ? 'Organization' : 'Donor';

    // Draw the road route on an already-initialised map
    const drawRoute = async (L: any, map: any, uLat: number, uLng: number) => {
        setRouteStatus('loading');
        try {
            const res = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${orgLng},${orgLat}?overview=full&geometries=polyline6`
            );
            const data = await res.json();

            if (data.routes?.[0]) {
                const route = data.routes[0];
                const coords = decodePolyline(route.geometry);
                const latLngs = coords.map(([la, ln]: [number, number]) => L.latLng(la, ln));

                // Remove previous route layer
                if (routeLayerRef.current) {
                    map.removeLayer(routeLayerRef.current);
                }

                // Draw road-following polyline
                const polyline = L.polyline(latLngs, {
                    color: youColor,
                    weight: 5,
                    opacity: 0.85,
                    lineJoin: 'round',
                    lineCap: 'round',
                }).addTo(map);

                routeLayerRef.current = polyline;
                map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

                const km = (route.distance / 1000).toFixed(2);
                setDistanceKm(km);
                setRouteStatus('loaded');
            } else {
                fallbackStraightLine(L, map, uLat, uLng);
            }
        } catch {
            fallbackStraightLine(L, map, uLat, uLng);
        }
    };

    const fallbackStraightLine = (L: any, map: any, uLat: number, uLng: number) => {
        const userLoc = L.latLng(uLat, uLng);
        const orgLoc = L.latLng(orgLat, orgLng);

        if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);

        const line = L.polyline([userLoc, orgLoc], {
            color: youColor,
            dashArray: '6, 10',
            weight: 4,
            opacity: 0.7,
        }).addTo(map);

        routeLayerRef.current = line;
        map.fitBounds(L.latLngBounds(userLoc, orgLoc), { padding: [50, 50] });
        setDistanceKm((userLoc.distanceTo(orgLoc) / 1000).toFixed(2));
        setRouteStatus('error');
    };

    // Initial map setup
    useEffect(() => {
        if (typeof window === 'undefined') return;
        let mapInstance: any = null;
        let isMounted = true;

        const initMap = async () => {
            if (!mapContainerRef.current || mapRef.current) return;
            if ((mapContainerRef.current as any)._leaflet_id) return;

            const L = (await import('leaflet')).default;
            if (!isMounted || !mapContainerRef.current) return;
            if ((mapContainerRef.current as any)._leaflet_id) return;

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            mapInstance = L.map(mapContainerRef.current, {
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true,
                zoomControl: true,
            });

            // Carto light tiles — same clean style as before
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                maxZoom: 19,
            }).addTo(mapInstance);

            const orgLoc = L.latLng(orgLat, orgLng);

            // Org/Other marker
            const otherIcon = L.icon({
                iconUrl: otherImg,
                shadowUrl: MARKER_URLS.shadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });
            L.marker(orgLoc, { icon: otherIcon }).bindPopup(`<b>${otherLabel}</b>`).addTo(mapInstance);

            if (userLat && userLng) {
                // User marker

                const youIcon = L.divIcon({
                    className: '',
                    html: `
                        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
                            <div style="
                                background:${youColor};
                                color:white;
                                font-family:sans-serif;
                                font-size:10px;
                                font-weight:900;
                                padding:2px 7px;
                                border-radius:99px;
                                box-shadow:0 2px 8px ${youColor}73;
                                white-space:nowrap;
                                letter-spacing:0.04em;
                            ">YOU</div>
                            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${youColor};margin-top:-1px"></div>
                            <img src="${youImg}"
                                style="width:20px;height:33px;margin-top:-4px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
                        </div>
                    `,
                    iconSize: [40, 60],
                    iconAnchor: [20, 60],
                });
                if (userMarkerRef.current) mapInstance.removeLayer(userMarkerRef.current);
                userMarkerRef.current = L.marker(L.latLng(userLat, userLng), { icon: youIcon })
                    .bindPopup('<b>Your Location</b>')
                    .addTo(mapInstance);

                await drawRoute(L, mapInstance, userLat, userLng);
            } else {
                mapInstance.setView(orgLoc, zoom);
            }

            mapRef.current = mapInstance;

            // Setup ResizeObserver to handle container resizing
            const observer = new ResizeObserver(() => {
                if (mapInstance) mapInstance.invalidateSize();
            });
            observer.observe(mapContainerRef.current);
            resizeObserverRef.current = observer;

            setTimeout(() => mapInstance.invalidateSize(), 100);
            setTimeout(() => mapInstance.invalidateSize(), 500);
        };

        if (orgLat && orgLng) initMap();

        return () => {
            isMounted = false;
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
            if (mapInstance) {
                mapInstance.remove();
                mapRef.current = null;
                routeLayerRef.current = null;
                userMarkerRef.current = null;
            }
        };
    }, [orgLat, orgLng, role]); // only re-init when org or role changes

    // Re-draw route when user location changes after map is already mounted
    useEffect(() => {
        if (!mapRef.current || !orgLat || !orgLng) return;

        const redraw = async () => {
            const L = (await import('leaflet')).default;
            const map = mapRef.current;
            if (!map) return;

            if (userLat && userLng) {
                // Add or update marker
                const youIcon = L.divIcon({
                    className: '',
                    html: `
                        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
                            <div style="background:${youColor};color:white;font-family:sans-serif;font-size:10px;font-weight:900;padding:2px 7px;border-radius:99px;box-shadow:0 2px 8px ${youColor}73;white-space:nowrap;letter-spacing:0.04em;">YOU</div>
                            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${youColor};margin-top:-1px"></div>
                            <img src="${youImg}" style="width:20px;height:33px;margin-top:-4px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
                        </div>
                    `,
                    iconSize: [40, 60],
                    iconAnchor: [20, 60],
                });

                if (userMarkerRef.current) {
                    userMarkerRef.current.setLatLng([userLat, userLng]);
                    userMarkerRef.current.setIcon(youIcon);
                } else {
                    userMarkerRef.current = L.marker([userLat, userLng], { icon: youIcon })
                        .bindPopup('<b>Your Location</b>')
                        .addTo(map);
                }

                await drawRoute(L, map, userLat, userLng);
            } else {
                // Remove route and marker if user location is cleared
                if (routeLayerRef.current) {
                    map.removeLayer(routeLayerRef.current);
                    routeLayerRef.current = null;
                }
                if (userMarkerRef.current) {
                    map.removeLayer(userMarkerRef.current);
                    userMarkerRef.current = null;
                }
                map.setView(L.latLng(orgLat, orgLng), zoom);
                setDistanceKm(null);
                setRouteStatus('idle');
            }
        };

        redraw();
    }, [userLat, userLng]);

    if (!orgLat || !orgLng) {
        return (
            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                <MapPin className="size-8 mb-2 opacity-30" />
                <p className="font-bold text-sm">Organization location not set</p>
                <p className="text-xs uppercase tracking-widest mt-1">Cannot calculate distance</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden relative group z-0">
            <div ref={mapContainerRef} className="h-full w-full absolute inset-0 z-0" />

            {/* Distance badge */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center gap-3 z-[400] transition-all hover:scale-105 cursor-default">
                <div className="size-8 rounded-lg bg-[#30496E]/10 flex items-center justify-center">
                    <Navigation className="size-4 text-[#30496E]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black tracking-widest uppercase text-gray-400">
                        {routeStatus === 'loaded' ? 'Road Distance' : routeStatus === 'error' ? 'Straight Line' : 'Donation Distance'}
                    </span>
                    {routeStatus === 'loading' ? (
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 border-2 border-[#30496E] border-t-transparent rounded-full animate-spin inline-block" />
                            Calculating route...
                        </span>
                    ) : distanceKm ? (
                        <span className="text-sm font-black text-[#30496E]">
                            {distanceKm} km{' '}
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-tight">away</span>
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-gray-500">Enable location</span>
                    )}
                </div>
            </div>

            {/* Route type indicator */}
            {routeStatus === 'error' && distanceKm && (
                <div className="absolute bottom-4 left-4 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-3 py-1.5 rounded-lg z-[400] flex items-center gap-1.5">
                    <span>⚠</span> Showing straight-line distance (road route unavailable)
                </div>
            )}
        </div>
    );
}
