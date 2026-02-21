import React, { useState, useEffect } from 'react';
import './index.css';
import useStore from './store';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { HomeScreen } from './App';
import { StoreScreen } from './StoreScreen';
import { BossQuestScreen } from './BossQuestScreen';
import { RankingsScreen } from './RankingsScreen';
import { MapScreen } from './MapScreen';
import { ToastNotification } from './ToastNotification';
import { AuthScreen } from './AuthScreen';

export default function AppLayout() {
    const [activeTab, setActiveTab] = useState('home');
    const [showSettings, setShowSettings] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const { isAuthenticated, setAuth, loadProfile, t, isWatchConnected, stepsToday, inventory, useItem } = useStore();

    // Supabase configuration check is now handled within AuthScreen and service calls
    // to allow for Demo Mode exploration.


    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setAuth(true);
                loadProfile(session.user.id);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setAuth(true);
                loadProfile(session.user.id);
            } else {
                setAuth(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [setAuth, loadProfile]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setAuth(false);
        setShowSettings(false);
    };

    if (!isAuthenticated) {
        return (
            <>
                <ToastNotification />
                <AuthScreen onLogin={() => setAuth(true)} />
            </>
        );
    }

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen font-display relative overflow-hidden">
            <ToastNotification />

            <div className="absolute top-4 left-5 z-[60] flex items-start gap-2">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => {
                            const newState = !showSettings;
                            setShowSettings(newState);
                            if (newState) {
                                setTimeout(() => setShowSettings(false), 5000);
                            }
                        }}
                        className="size-10 glass-panel rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </button>

                    {showSettings && (
                        <div className="glass-panel p-2 rounded-2xl border-white/10 shadow-2xl animate-slideIn flex flex-col gap-1 min-w-[160px]">
                            {/* Watch Info Section in Settings */}
                            <div className="px-4 py-3 border-b border-white/5 mb-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-xs text-slate-500">info</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('watchInfo')}</span>
                                </div>
                                {isWatchConnected === true ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 font-bold">Galaxy Watch 6</span>
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px] text-green-500">battery_5_bar</span>
                                                <span className="text-[10px] text-green-500 font-black">82%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 font-bold">{t('steps')}</span>
                                            <span className="text-[10px] text-white font-black">{stepsToday.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-500 italic">
                                        {isWatchConnected === 'connecting' ? t('connectingWatch') : t('watchDisconnected')}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 rounded-xl text-red-400 text-xs font-black uppercase tracking-widest transition-colors w-full"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                {t('logout')}
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setShowInventory(true)}
                    className="size-10 glass-panel rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-90 relative"
                >
                    <span className="material-symbols-outlined text-xl">backpack</span>
                    {inventory && inventory.some(i => i.qty > 0) && (
                        <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border border-background-dark"></span>
                    )}
                </button>
            </div>

            {/* Inventory Modal */}
            {showInventory && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="glass-panel w-full max-w-sm rounded-3xl overflow-hidden border-primary/20 shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">inventory_2</span>
                                <h2 className="text-lg font-black uppercase tracking-widest">Inventory</h2>
                            </div>
                            <button onClick={() => setShowInventory(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                            {inventory && inventory.length > 0 ? inventory.map(item => (
                                <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
                                    <div className={`size-12 rounded-xl bg-${item.color}/10 border border-${item.color}/20 flex items-center justify-center shrink-0`}>
                                        <span className={`material-symbols-outlined text-2xl text-${item.color}`}>{item.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-black text-sm">{item.name}</h3>
                                            <span className="text-xs font-black text-slate-400 bg-black/30 px-2 py-0.5 rounded-full">x{item.qty}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight mb-2">{item.description}</p>
                                        <button
                                            onClick={() => { useItem(item.id); if (item.qty <= 1) setShowInventory(false); }}
                                            disabled={item.qty <= 0}
                                            className="w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                                                     bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400"
                                        >
                                            {item.qty > 0 ? 'USE' : 'EMPTY'}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-slate-500 text-sm py-8 font-black uppercase tracking-widest">No items yet</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'store' && <StoreScreen />}
            {activeTab === 'quests' && <BossQuestScreen />}
            {activeTab === 'social' && <RankingsScreen />}

            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    visibility: activeTab === 'explore' ? 'visible' : 'hidden',
                    opacity: activeTab === 'explore' ? 1 : 0,
                    zIndex: activeTab === 'explore' ? 10 : -50,
                    pointerEvents: activeTab === 'explore' ? 'auto' : 'none',
                    transition: 'opacity 0.3s'
                }}
            >
                <MapScreen isActive={activeTab === 'explore'} />
            </div>

            {/* Bottom Glass Nav Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center pointer-events-none">
                <div className="bg-background-dark/80 backdrop-blur-xl w-full max-w-md h-16 rounded-full flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-auto mb-safe">

                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center gap-0.5 group transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}>
                        <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${activeTab === 'home' ? 'drop-shadow-[0_0_8px_rgba(244,209,37,0.4)]' : ''}`}>home</span>
                        <span className="text-[7px] font-black uppercase tracking-widest">{t('home')}</span>
                    </button>

                    <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center justify-center gap-0.5 group transition-colors ${activeTab === 'explore' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}>
                        <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${activeTab === 'explore' ? 'drop-shadow-[0_0_8px_rgba(244,209,37,0.4)]' : ''}`}>explore</span>
                        <span className="text-[7px] font-black uppercase tracking-widest">{t('exploration')}</span>
                    </button>

                    <button onClick={() => setActiveTab('quests')} className={`flex flex-col items-center justify-center gap-0.5 group transition-colors ${activeTab === 'quests' ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}>
                        <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${activeTab === 'quests' ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : ''}`}>swords</span>
                        <span className="text-[7px] font-black uppercase tracking-widest">{t('quests')}</span>
                    </button>

                    <button onClick={() => setActiveTab('social')} className={`flex flex-col items-center justify-center gap-0.5 group transition-colors ${activeTab === 'social' ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}>
                        <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${activeTab === 'social' ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : ''}`}>leaderboard</span>
                        <span className="text-[7px] font-black uppercase tracking-widest">{t('social')}</span>
                    </button>

                    <button onClick={() => setActiveTab('store')} className={`relative flex flex-col items-center justify-center gap-0.5 group transition-colors ${activeTab === 'store' ? 'text-accent-cyan' : 'text-slate-500 hover:text-white'}`}>
                        <div className="absolute top-0 right-1 w-2 h-2 bg-red-500 border border-background-dark rounded-full animate-pulse"></div>
                        <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${activeTab === 'store' ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : ''}`}>shopping_bag</span>
                        <span className="text-[7px] font-black uppercase tracking-widest">{t('store')}</span>
                    </button>

                </div>
            </nav>
        </div>
    );
}
