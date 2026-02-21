import React, { useState } from 'react';
import useStore from './store';
import { playBossHit } from './sfx';

export const BossQuestScreen = () => {
    const { bosses, currentBossIndex, habits, completeHabit, t } = useStore();
    const boss = bosses[currentBossIndex];
    const hpPercentage = (boss.hp / boss.maxHp) * 100;

    const [isShaking, setIsShaking] = useState(false);

    const handleAttack = (habitId) => {
        const habit = habits.find(h => h.id === habitId);
        if (habit && !habit.completed) {
            setIsShaking(true);
            completeHabit(habitId);
            playBossHit();
            setTimeout(() => setIsShaking(false), 500);
        }
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col items-center font-display relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 star-field"></div>

            <div className="relative w-full max-w-md flex flex-col gap-8 z-10 px-5 pt-20 pb-40">
                <header className="flex items-center justify-between">
                    <div className="text-left">
                        <h2 className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mb-1">{t('quests')}</h2>
                        <h1 className="text-2xl font-black text-white uppercase">{t('defeatBoss')}</h1>
                    </div>
                    <div className="flex gap-2">
                        {bosses.map((b, idx) => (
                            <button
                                key={b.id}
                                onClick={() => useStore.setState({ currentBossIndex: idx })}
                                className={`size-8 rounded-lg border flex items-center justify-center transition-all ${currentBossIndex === idx ? 'border-primary bg-primary/20 scale-110 shadow-[0_0_10px_rgba(244,209,37,0.3)]' : 'border-white/10 bg-white/5 opacity-50 hover:opacity-100'}`}
                            >
                                <span className={`text-[10px] font-black ${currentBossIndex === idx ? 'text-primary' : 'text-slate-500'}`}>{idx + 1}</span>
                            </button>
                        ))}
                    </div>
                </header>

                {/* Boss Visual Area */}
                <div className="relative flex flex-col items-center py-10">
                    <div className={`absolute inset-0 rounded-full blur-[100px] animate-pulse transition-colors duration-1000 ${hpPercentage > 70 ? 'bg-primary/5' :
                        hpPercentage > 30 ? 'bg-red-500/10' : 'bg-purple-900/20'
                        }`}></div>

                    <div className={`relative transition-all duration-500 ${isShaking ? 'animate-shake' : ''}`}>
                        {/* Phase Indicator */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border shadow-lg ${hpPercentage > 70 ? 'bg-primary/20 border-primary text-primary' :
                                hpPercentage > 30 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' :
                                    'bg-purple-600/30 border-purple-500 text-purple-300 animate-bounce'
                                }`}>
                                {hpPercentage > 70 ? 'Phase 1: Majestic' :
                                    hpPercentage > 30 ? 'Phase 2: Enraged' : 'Phase 3: Critical'}
                            </span>
                        </div>

                        <img
                            src={boss.image}
                            alt={boss.name}
                            className={`w-64 h-64 object-cover rounded-3xl transition-all duration-1000 ${hpPercentage > 70 ? 'drop-shadow-[0_0_30px_rgba(244,209,37,0.3)]' :
                                    hpPercentage > 30 ? 'drop-shadow-[0_0_40px_rgba(239,68,68,0.5)] brightness-110 saturate-150 hue-rotate-[-10deg]' :
                                        'drop-shadow-[0_0_50px_rgba(168,85,247,0.6)] brightness-75 contrast-125 grayscale-[0.3]'
                                }`}
                        />

                        {boss.hp <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-red-600 text-white font-black px-6 py-2 rounded-lg rotate-[-10deg] shadow-xl text-xl border-4 border-white animate-bounce">
                                    {t('victoryBossDefeated')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Boss HP Bar */}
                    <div className="w-full mt-10 glass-panel p-5 rounded-3xl relative overflow-hidden border-red-900/20">
                        <div className="flex justify-between items-end mb-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{t('bossHp')}</span>
                                <span className="text-2xl font-black text-white">{boss.hp.toLocaleString()} HP</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">/ {boss.maxHp.toLocaleString()}</span>
                        </div>
                        <div className="h-6 w-full bg-black/40 rounded-xl p-1 border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-500"
                                style={{ width: `${hpPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Attack Actions Area */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('attackBoss')}</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {habits.map(habit => (
                            <button
                                key={habit.id}
                                disabled={habit.completed || boss.hp <= 0}
                                onClick={() => handleAttack(habit.id)}
                                className={`group relative glass-panel p-4 rounded-2xl flex items-center gap-4 transition-all ${habit.completed || boss.hp <= 0 ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-red-500/10 hover:border-red-500/20 active:scale-95'}`}
                            >
                                <div className={`size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 transition-transform ${!habit.completed && 'group-hover:scale-110'}`}>
                                    <span className="material-symbols-outlined">{habit.icon}</span>
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-bold text-white uppercase text-xs tracking-widest">{t('attackWith')} {habit.name}</p>
                                    <p className="text-sm font-black text-red-500 mt-1">-{habit.dmg.toLocaleString()} DMG</p>
                                </div>
                                {!habit.completed && boss.hp > 0 && (
                                    <span className="material-symbols-outlined text-red-500 text-lg opacity-0 group-hover:opacity-100 transition-opacity">sword</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
