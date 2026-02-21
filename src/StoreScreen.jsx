import React from 'react';
import useStore from './store';
import { playCoin, playError } from './sfx';
import mysteryBoxImg from './assets/mystery_box.png';
import './index.css';

export const StoreScreen = () => {
    const { user, buyGacha, t } = useStore();

    const handleGacha = () => {
        if (user.gems >= 100) { playCoin(); } else { playError(); }
        buyGacha();
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col font-display relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 star-field"></div>

            <header className="px-5 pt-20 pb-6 flex items-center justify-between sticky top-0 bg-background-dark/50 backdrop-blur-lg z-20">
                <h1 className="text-2xl font-black uppercase tracking-widest">{t('store')}</h1>
                <div className="flex gap-4">
                    <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border-primary/20">
                        <span className="material-symbols-outlined text-primary text-sm">stars</span>
                        <span className="text-xs font-black">{user.starCoins.toLocaleString()}</span>
                    </div>
                    <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border-accent-cyan/20">
                        <span className="material-symbols-outlined text-accent-cyan text-sm">diamond</span>
                        <span className="text-xs font-black">{user.gems.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 pb-40">
                <div className="relative w-full aspect-square max-w-sm mx-auto flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-[80px] animate-pulse"></div>
                    <div className="relative z-10 gacha-glow rounded-3xl p-8 flex flex-col items-center">
                        <img
                            src={mysteryBoxImg}
                            alt="Mystery Box"
                            className="w-48 h-48 object-cover rounded-3xl drop-shadow-[0_0_20px_rgba(244,209,37,0.4)] animate-bounce border-2 border-primary/20"
                        />
                        <h2 className="text-xl font-black uppercase tracking-tight mt-6">{t('mysteryBox')}</h2>
                        <p className="text-slate-400 text-xs mt-2 text-center break-keep">Spend gems to discover powerful orbital weapons, time items, or coins!</p>

                        <div className="mt-4 bg-black/40 p-3 rounded-xl border border-white/5 w-full flex flex-col gap-1.5 backdrop-blur-md">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 text-center border-b border-white/5 pb-1">Drop Probabilities</p>
                            <div className="flex justify-between text-[10px] font-bold"><span className="text-yellow-500">Star Coins (500)</span> <span>50%</span></div>
                            <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400">Stasis Field</span> <span>25%</span></div>
                            <div className="flex justify-between text-[10px] font-bold"><span className="text-accent-cyan">Warp Drive</span> <span>15%</span></div>
                            <div className="flex justify-between text-[10px] font-bold"><span className="text-red-500">Orbital Strike</span> <span>10%</span></div>
                        </div>
                    </div>

                    <div className="mt-20 z-10 w-full flex flex-col items-center gap-3">
                        <button
                            onClick={handleGacha}
                            disabled={user.gems < 100}
                            className={`group relative px-10 h-16 ${user.gems >= 100 ? 'bg-primary cursor-pointer hover:scale-105' : 'bg-slate-600 cursor-not-allowed opacity-50'} rounded-full overflow-hidden flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_30px_rgba(244,209,37,0.3)]`}
                        >
                            <span className="text-black font-black uppercase tracking-widest text-sm">{t('openFor')} 100</span>
                            <span className="material-symbols-outlined text-black font-bold">diamond</span>
                        </button>
                        {user.gems < 100 && (
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">{t('insufficientGems')}</p>
                        )}
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-4">
                    <div className="glass-panel p-4 rounded-3xl border-white/5 flex flex-col gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">bolt</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500">{t('multiplierHeader')} Booster</p>
                            <p className="font-bold text-white text-sm">Coming Soon</p>
                        </div>
                    </div>
                    <div className="glass-panel p-4 rounded-3xl border-white/5 flex flex-col gap-3">
                        <div className="size-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                            <span className="material-symbols-outlined">shield</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500">Streak Shield</p>
                            <p className="font-bold text-white text-sm">Coming Soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
