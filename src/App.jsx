import React from 'react';
import useStore from './store';
import { playHit, playLevelUp } from './sfx';
import './index.css';

const StreakFire = ({ streak }) => {
  if (streak < 3) return null;
  const count = Math.min(streak * 2, 30);
  const colorClass = streak >= 14 ? 'streak-level-3' : streak >= 7 ? 'streak-level-2' : 'streak-level-1';

  return (
    <div className={`fixed inset-x-0 bottom-0 h-40 pointer-events-none z-50 overflow-hidden ${colorClass}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="streak-fire-particle"
          style={{
            left: `${Math.random() * 100}%`,
            '--duration': `${1 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
};

export const HomeScreen = () => {
  const { user, habits, completeHabit, t, language, setLanguage, isWatchConnected, connectWatch, syncHealthData, stepsToday } = useStore();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const xpPercentage = Math.min((user.xp / user.maxXp) * 100, 100);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleHabitComplete = (id) => {
    const prevLevel = user.level;
    completeHabit(id);
    playHit();
    setTimeout(() => {
      const newLevel = useStore.getState().user.level;
      if (newLevel > prevLevel) playLevelUp();
    }, 50);
  };

  return (
    <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col items-center overflow-x-hidden font-display relative">
      <StreakFire streak={user.streak} />
      <div className="absolute inset-0 pointer-events-none opacity-20 star-field"></div>

      {/* ── Language Top Toggles ── */}
      <div className="absolute top-4 right-5 z-50 flex gap-1 bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/5">
        {['ko', 'en', 'jp', 'es', 'zh'].map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase transition-all ${language === lang ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
          >{lang}</button>
        ))}
      </div>

      <div className="relative w-full max-w-md flex flex-col gap-8 z-10 px-5 pt-40 pb-40">

        {/* ── Today's Date & Time HUD ── */}
        <div className="flex flex-col items-center gap-1 opacity-80 animate-fadeIn">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(244,209,37,0.3)]">
            {new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', { weekday: 'long' }).format(currentTime)}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-white tracking-widest uppercase">
              {new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
                month: 'short',
                day: 'numeric'
              }).format(currentTime)}
            </p>
            <p className="text-xl font-medium text-primary/80 tabular-nums">
              {currentTime.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </p>
          </div>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-1"></div>
        </div>

        {/* ── Smart Watch Sync Bar ── */}
        <section className="w-full">
          {!isWatchConnected ? (
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5 bg-white/5 group hover:bg-white/10 transition-all cursor-pointer overflow-hidden relative" onClick={() => connectWatch()}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="flex items-center gap-4 z-10">
                <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-2xl animate-pulse">watch_off</span>
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">{t('connectYourWatch')}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{t('pairNow')}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors z-10">chevron_right</span>
            </div>
          ) : isWatchConnected === 'connecting' ? (
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border-primary/20 bg-primary/5 animate-pulse">
              <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('connectingWatch')}</p>
            </div>
          ) : (
            <div className="glass-panel p-3 rounded-2xl flex items-center justify-between border-primary/20 bg-primary/5 shadow-[0_0_20px_rgba(244,209,37,0.1)]">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl drop-shadow-[0_0_8px_rgba(244,209,37,0.4)]">watch</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-background-dark shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary">{t('watchConnected')}</p>
                  <p className="text-sm font-black text-white">{stepsToday.toLocaleString()} <span className="text-[10px] text-slate-500 uppercase">{t('steps')}</span></p>
                </div>
              </div>
              <button
                onClick={() => syncHealthData()}
                className="bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1.5 rounded-xl border border-white/10 transition-all flex items-center gap-2 group"
              >
                <span className="material-symbols-outlined text-xs group-hover:rotate-180 transition-transform duration-500">sync</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{t('syncData')}</span>
              </button>
            </div>
          )}
        </section>

        {/* ── Top Quest Card ── */}
        <header className="w-full">
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-3 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_8px_rgba(244,209,37,0.6)]">local_fire_department</span>
                <h2 className="uppercase tracking-widest text-xs font-bold text-primary">{t('epicWeeklyQuest')}</h2>
              </div>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-300">{t('endsIn')} 2D</span>
            </div>
            <div className="flex items-center justify-between gap-4 z-10 relative">
              <div className="flex flex-col">
                <h3 className="text-lg font-bold leading-tight">{t('defeatBoss')}</h3>
                <p className="text-xs text-slate-400 font-medium pb-2">{t('dealDamageDaily')}</p>
              </div>
              <div className="relative flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle className="text-white/5" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="3"></circle>
                  <circle className="text-primary" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset="44" strokeWidth="3"></circle>
                </svg>
                <span className="absolute text-[10px] font-bold">42%</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden z-10 relative mt-1">
              <div className="h-full bg-primary rounded-full glow-gold" style={{ width: '42%' }}></div>
            </div>
          </div>
        </header>

        {/* ── Mascot & Pet ── */}
        <section className="flex-1 flex flex-col items-center justify-center relative min-h-[280px]">
          <div className="absolute top-0 right-0 glass-panel border-primary/30 py-1.5 px-3 rounded-lg flex items-center gap-2 glow-gold animate-bounce z-20">
            <span className="material-symbols-outlined text-primary text-sm">local_fire_department</span>
            <span className="text-[10px] font-black text-primary">{user.streak} {t('streakHeader')} x{user.multiplier} {t('multiplierHeader')}</span>
          </div>

          {user.pet && (
            <div className="absolute top-0 left-0 glass-panel border-white/20 py-2 px-3 rounded-xl flex items-center gap-3 shadow-lg z-20">
              <span className="text-2xl animate-egg-wobble">{user.pet.avatar}</span>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{user.pet.name}</span>
                <span className="text-[8px] font-bold text-primary">{user.pet.bonus}</span>
              </div>
            </div>
          )}

          <div className="absolute w-48 h-48 bg-accent-cyan/10 rounded-full blur-[60px] animate-pulse"></div>
          <div className="relative w-64 h-64 flex items-center justify-center z-10">
            <img
              alt="3D Space Explorer Pet Mascot"
              className={`w-full h-full object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] ${xpPercentage > 50 ? 'animate-[bounce_2s_infinite]' : ''}`}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmvRpgLKqTIv-g2UGj7iKb2DYsF8SHhiF4pyQmnQCYvVhj5hxV4zfDWdQMfJtGsKfGFzDI2EWt_XXkKw0UK-LdlkiYfLAckAVsm8fiBlvaMw0p8WDVSPHSbB4p2sVvyy0Smut5HW2PbUb_JU1R6ZEErqu9gNQyXw6wGfEjMmkp6fo2AfRGRrkEx7ywx0a_qixkRGOVeFRlPJevdfZRfs5n1svTMqum_vUh_GI48eTSSVOIY8A7mTRkHE_E3LR48QICevirOdiqw7Y"
            />
          </div>
          <div className="glass-panel px-4 py-1.5 rounded-full border-accent-cyan/20 mt-[-20px] shadow-lg z-20 bg-background-dark/50">
            <span className="text-[10px] tracking-widest font-bold text-accent-cyan uppercase drop-shadow">Zyxel Level {user.level}</span>
          </div>
        </section>

        {/* ── XP Bar ── */}
        <section className="w-full">
          <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t('currentLevel')}</span>
                <span className="text-3xl font-black text-white leading-none">{user.level}</span>
              </div>
              <span className="text-xs font-bold text-primary">{user.xp} / {user.maxXp} XP</span>
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-lg border border-white/10 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-md glow-gold transition-all duration-1000 ease-out"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* ── Habits ── */}
        <section className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t('activeHabits')}</h4>
            <span className="text-accent-cyan/80 text-[10px] font-bold uppercase tracking-widest">
              {habits.filter(h => h.completed).length}/{habits.length} {t('done')}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`glass-panel p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${habit.completed
                  ? 'opacity-50 grayscale scale-[0.98]'
                  : 'hover:bg-white/5 cursor-pointer hover:border-accent-cyan/30 hover:scale-[1.01]'
                  }`}
                onClick={() => !habit.completed && handleHabitComplete(habit.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-${habit.color}`}>
                    <span className="material-symbols-outlined">{habit.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{habit.name}</p>
                    <p className="text-[10px] text-primary font-bold mt-0.5">
                      +{Math.floor(habit.xpReward * user.multiplier)} XP &nbsp;·&nbsp; {habit.dmg.toLocaleString()} DMG
                    </p>
                  </div>
                </div>
                <div className="ml-auto shrink-0 flex flex-col items-end gap-1">
                  {habit.completed ? (
                    <>
                      <span className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_8px_rgba(244,209,37,0.5)]">task_alt</span>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter text-right">
                        {habit.completedAt && (
                          <>
                            {new Date(habit.completedAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', { month: '2-digit', day: '2-digit' }).replace(/\.$/, '')}
                            <br />
                            {new Date(habit.completedAt).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </>
                        )}
                      </span>
                    </>
                  ) : (
                    <button
                      className="bg-primary/20 hover:bg-primary/40 text-primary font-black px-4 py-2 rounded-xl text-xs tracking-widest uppercase transition-all border border-primary/30 hover:shadow-[0_0_12px_rgba(244,209,37,0.3)]"
                      onClick={(e) => { e.stopPropagation(); handleHabitComplete(habit.id); }}
                    >
                      {t('log')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
