import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import useStore from './store';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Spaceship Icon
const spaceshipIcon = L.divIcon({
    html: `<span class="material-symbols-outlined text-primary text-4xl" style="text-shadow: 0 0 10px rgba(244, 209, 37, 0.8)">rocket_launch</span>`,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const turfIcon = L.divIcon({
    html: `<span class="material-symbols-outlined text-red-500 text-3xl drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">flag</span>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const lootIcon = L.divIcon({
    html: `<span class="material-symbols-outlined text-accent-cyan text-2xl drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-bounce" style="display: block; position: relative; top: -10px;">diamond</span>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});

const calculateDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};


// Component to handle map center updates
const RecenterMap = ({ position, isActive }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView(position, 17);
    }, [position, map]);

    useEffect(() => {
        if (isActive) {
            setTimeout(() => map.invalidateSize(), 150);
        }
    }, [isActive, map]);
    return null;
};

export const MapScreen = ({ isActive = true }) => {
    const { t, addGems, addNotification, language, setLanguage } = useStore();
    const [isExpeditionActive, setIsExpeditionActive] = useState(false);
    const [position, setPosition] = useState(null);
    const [path, setPath] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0); // in km
    const [pointsEarned, setPointsEarned] = useState(0);
    const watchId = useRef(null);
    const lastPos = useRef(null);
    const [lootItems, setLootItems] = useState([]);
    const [turfMarkers, setTurfMarkers] = useState([]);
    const [weather, setWeather] = useState('clear');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 18 || hour < 6) setWeather('meteor');
        else if (hour >= 12 && hour < 18) setWeather('nebula');
    }, []);

    useEffect(() => {
        if (!position || lootItems.length === 0) return;
        setLootItems(prev => {
            let pickedUpAny = false;
            let gemsFound = 0;
            const updated = prev.map(loot => {
                if (loot.active) {
                    const dist = calculateDist(position[0], position[1], loot.lat, loot.lng);
                    if (dist < 0.05) { // 50 meters
                        pickedUpAny = true;
                        gemsFound += loot.value;
                        return { ...loot, active: false };
                    }
                }
                return loot;
            });
            if (pickedUpAny) {
                setTimeout(() => {
                    addGems(gemsFound);
                    addNotification(`💎 우주 크리스탈 발견! +${gemsFound} 젬 획득!`);
                }, 0);
                return updated;
            }
            return prev;
        });
    }, [position, addGems, addNotification]);

    const startExpedition = () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }
        setIsExpeditionActive(true);
        setTotalDistance(0);
        setPointsEarned(0);
        setPath([]);

        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = [latitude, longitude];
                setPosition(newPos);

                if (lastPos.current) {
                    const dist = calculateDist(lastPos.current[0], lastPos.current[1], latitude, longitude);
                    if (dist > 0.005) { // Minimum 5 meters to count as movement
                        setTotalDistance(prev => {
                            const updated = prev + dist;
                            // For every 0.1km, give 10 gems (100 per km)
                            const newPoints = Math.floor(updated * 100);
                            setPointsEarned(newPoints);
                            return updated;
                        });
                        setPath(prev => [...prev, newPos]);
                        lastPos.current = newPos;
                    }
                } else {
                    lastPos.current = newPos;
                    setPath([newPos]);
                }
            },
            (err) => console.error(err),
            { enableHighAccuracy: true, distanceFilter: 5 }
        );
    };

    const stopExpedition = () => {
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        setIsExpeditionActive(false);
        lastPos.current = null;
        if (pointsEarned > 0) {
            addGems(pointsEarned);
            addNotification(`${t('exploration')} 완료! ${pointsEarned} 젬 획득!`);
        }
    };

    useEffect(() => {
        // Get initial position
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setPosition([lat, lng]);

            // Generate random structural data for Turfs and Loots
            setLootItems(Array(8).fill().map((_, i) => ({
                id: i,
                lat: lat + (Math.random() - 0.5) * 0.003,
                lng: lng + (Math.random() - 0.5) * 0.003,
                value: Math.floor(Math.random() * 50) + 20,
                active: true
            })));

            setTurfMarkers([{
                id: 'base-1',
                lat: lat + 0.003,
                lng: lng - 0.003,
                name: "Sector Alpha HQ"
            }]);
        });
        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        };
    }, []);

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col font-display relative overflow-hidden">
            <header className="px-5 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-background-dark/80 backdrop-blur-lg z-20 border-b border-white/5">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest">{t('exploration')}</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('earnGemsPerKm')}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1 bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/5 mb-1">
                        {['ko', 'en', 'jp', 'es', 'zh'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase transition-all ${language === lang ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                            >{lang}</button>
                        ))}
                    </div>
                    <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border-accent-cyan/20">
                        <span className="material-symbols-outlined text-accent-cyan text-sm">diamond</span>
                        <span className="text-xs font-black">+{pointsEarned}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 relative">
                {weather === 'meteor' && <div className="absolute inset-0 pointer-events-none z-[400] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60 mix-blend-color-dodge"></div>}
                {weather === 'nebula' && <div className="absolute inset-0 pointer-events-none z-[400] bg-accent-cyan/10 mix-blend-color-dodge"></div>}
                {position ? (
                    <MapContainer
                        center={position}
                        zoom={17}
                        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(0.7) contrast(1.2)' }}
                        zoomControl={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={position} icon={spaceshipIcon} />
                        <Polyline positions={path} color="#f4d125" weight={5} opacity={0.7} />

                        {lootItems.filter(l => l.active).map(loot => (
                            <Marker key={`loot-${loot.id}`} position={[loot.lat, loot.lng]} icon={lootIcon} />
                        ))}

                        {turfMarkers.map(turf => (
                            <Marker key={turf.id} position={[turf.lat, turf.lng]} icon={turfIcon} />
                        ))}

                        <RecenterMap position={position} isActive={isActive} />
                    </MapContainer>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                        <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">discover_tune</span>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Locating Spaceship...</p>
                    </div>
                )}

                {/* Tracking Overlay */}
                <div className="absolute bottom-32 left-0 right-0 px-5 z-20">
                    <div className="glass-panel p-6 rounded-3xl border-primary/20 shadow-2xl flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('distanceTravelled')}</span>
                                    <span className="text-3xl font-black text-white">{totalDistance.toFixed(2)} <span className="text-sm text-slate-400">{t('km')}</span></span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('steps') || 'STEPS'}</span>
                                    <span className="text-3xl font-black text-accent-cyan">{Math.floor(totalDistance * 1333).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${isExpeditionActive ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-primary/20 text-primary'}`}>
                                <span className="material-symbols-outlined">{isExpeditionActive ? 'radar' : 'location_on'}</span>
                            </div>
                        </div>

                        {!isExpeditionActive ? (
                            <button
                                onClick={startExpedition}
                                className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_20px_rgba(244,209,37,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {t('startExpedition')}
                            </button>
                        ) : (
                            <button
                                onClick={stopExpedition}
                                className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {t('endExpedition')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
