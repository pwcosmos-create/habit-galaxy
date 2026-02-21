import React from 'react';
import useStore from './store';

export const RankingsScreen = () => {
    const { t, language, setLanguage, user, incubator, stepsToday } = useStore();

    // Mock global data
    const leaderboard = [
        { rank: 1, name: "DragonSlayer_JP", level: 99, country: "🇯🇵", xp: 1254000, color: "text-primary" },
        { rank: 2, name: "HabitHero_KR", level: 85, country: "🇰🇷", xp: 950200, color: "text-accent-cyan" },
        { rank: 3, name: "GamerPro_ES", level: 82, country: "🇪🇸", xp: 880500, color: "text-red-400" },
        { rank: 4, name: "ZenMaster_US", level: 78, country: "🇺🇸", xp: 750000, color: "text-slate-300" },
        { rank: 5, name: "FitnessQueen_BR", level: 74, country: "🇧🇷", xp: 620000, color: "text-slate-300" },
        { rank: 6, name: "You (Hero)", level: 12, country: "🇰🇷", xp: 450, color: "text-primary italic" },
    ];

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col items-center font-display relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 star-field"></div>

            {/* Language Top Toggles */}
            <div className="absolute top-4 right-5 z-50 flex gap-1">
                {['ko', 'en', 'jp', 'es', 'zh'].map(lang => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase transition-all border ${language === lang ? 'bg-primary text-black border-primary' : 'bg-white/5 text-slate-400 border-white/10'}`}
                    >{lang}</button>
                ))}
            </div>

            <div className="relative w-full max-w-md flex flex-col gap-6 z-10 px-5 pt-12 pb-32">
                <header className="text-center mb-4">
                    <div className="inline-block glass-panel px-4 py-1 rounded-full border-primary/20 mb-3">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{t('leaderboard')}</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase leading-none tracking-tight">World <span className="text-primary">Rankings</span></h1>
                </header>

                {/* Incubator Section */}
                <div className="glass-panel p-5 rounded-3xl border-accent-cyan/20 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden mb-2">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`size-12 rounded-2xl ${incubator?.active ? 'bg-primary/20 border-primary/30' : 'bg-slate-800 border-white/10'} flex items-center justify-center shrink-0`}>
                            <span className={`material-symbols-outlined text-3xl ${incubator?.active ? 'text-primary animate-egg-wobble' : 'text-slate-500'}`}>
                                {incubator?.active ? 'egg' : 'inventory_2'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h2 className="font-black text-sm uppercase tracking-widest text-white">Pet Incubator</h2>
                            {incubator?.active ? (
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">Incubating Alien Egg...</p>
                            ) : (
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Empty</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Steps Walked</span>
                            <span className="text-white">{incubator?.active ? incubator.steps.toLocaleString() : 0} / {incubator?.active ? incubator.targetSteps.toLocaleString() : 10000}</span>
                        </div>
                        <div className="h-3 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden p-[1px]">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${incubator?.active ? 'bg-gradient-to-r from-primary/60 to-primary glow-gold' : 'bg-slate-700'}`}
                                style={{ width: incubator?.active ? `${Math.min((incubator.steps / incubator.targetSteps) * 100, 100)}%` : '0%' }}
                            ></div>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 italic text-center">Open Mystery Boxes to find eggs!</p>
                    </div>
                </div>

                {/* World Boss Event Card */}
                <div className="glass-panel p-5 rounded-3xl border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-500">public</span>
                        </div>
                        <div>
                            <h2 className="font-black text-sm uppercase tracking-widest text-white">{t('worldBoss')}</h2>
                            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest italic animate-pulse">Live Now</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>{t('totalDamage')}</span>
                            <span className="text-white">8,421,050 / 10M</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 w-[84%] animate-shimmer"></div>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1">{t('yourContribution')}: <span className="text-primary font-bold">12,500 DMG</span></p>
                    </div>
                </div>

                {/* Ranking List */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        <span>{t('rank')} / {t('players')}</span>
                        <span>Level / XP</span>
                    </div>

                    {leaderboard.map((player) => (
                        <div key={player.rank} className={`glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5 transition-all hover:bg-white/5 hover:border-white/10 ${player.name.includes('You') ? 'border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(13,242,89,0.05)]' : ''}`}>
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-black w-6 ${player.rank <= 3 ? 'text-primary' : 'text-slate-500'}`}>
                                    {player.rank}{t('rankSuffix')}
                                </span>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">{player.country}</span>
                                        <span className={`text-xs font-bold tracking-tight ${player.color}`}>{player.name}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Master Warrior</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-white">LV. {player.level}</p>
                                <p className="text-[9px] font-bold text-slate-400">{player.xp.toLocaleString()} XP</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
