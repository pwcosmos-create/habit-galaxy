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
    const { isAuthenticated, setAuth, loadProfile, t, isWatchConnected, stepsToday } = useStore();

    if (!isSupabaseConfigured()) {
        return (
            <div className="bg-background-dark min-h-screen flex flex-col items-center justify-center p-8 text-center font-display">
                <div className="absolute inset-0 opacity-20 star-field pointer-events-none"></div>
                <div className="z-10 animate-fadeIn">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">warning</span>
                    <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Configuration Required</h1>
                    <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                        Supabase URL and Anon Key are missing. Please add them to your <code className="text-primary">.env</code> or Vercel Environment Variables.
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left font-mono text-[10px] text-slate-500 space-y-2">
                        <div className="flex justify-between"><span>VITE_SUPABASE_URL</span> <span className="text-red-400">MISSING</span></div>
                        <div className="flex justify-between"><span>VITE_SUPABASE_ANON_KEY</span> <span className="text-red-400">MISSING</span></div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                    >
                        Check Again
                    </button>
                </div>
            </div>
        );
    }

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

            {/* Top Settings Icon */}
            <div className="absolute top-4 left-5 z-[60] flex flex-col items-start gap-2">
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

                        {/* Logout Button */}
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
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'store' && <StoreScreen />}
            {activeTab === 'quests' && <BossQuestScreen />}
            {activeTab === 'social' && <RankingsScreen />}

            <div
                style={{
                    position: activeTab === 'explore' ? 'relative' : 'fixed',
                    top: activeTab === 'explore' ? 'auto' : '-9999px',
                    left: activeTab === 'explore' ? 'auto' : '-9999px',
                    width: '100%',
                    height: '100%',
                    visibility: activeTab === 'explore' ? 'visible' : 'hidden',
                    opacity: activeTab === 'explore' ? 1 : 0,
                    zIndex: activeTab === 'explore' ? 'auto' : -50
                }}
            >
                <MapScreen />
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
