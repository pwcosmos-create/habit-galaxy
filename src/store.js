import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from './translations';

// Initial global gamification state
const useStore = create(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            language: 'ko', // Default to Korean as per user context
            user: {
                level: 12,
                xp: 450,
                maxXp: 1000,
                starCoins: 1250,
                gems: 45,
                streak: 14,
                multiplier: 2.5
            },
            bosses: [
                {
                    id: 1,
                    name: "King Sloth",
                    hp: 420500,
                    maxHp: 1000000,
                    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=512",
                    theme: "primary"
                },
                {
                    id: 2,
                    name: "Void Dragon",
                    hp: 1500000,
                    maxHp: 1500000,
                    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=512",
                    theme: "red-500"
                },
                {
                    id: 3,
                    name: "Neon Golem",
                    hp: 3000000,
                    maxHp: 3000000,
                    image: "https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=512",
                    theme: "accent-cyan"
                }
            ],
            currentBossIndex: 0,
            habits: [
                { id: 1, name: "30m Walk", xpReward: 50, dmg: 1500, icon: "directions_walk", color: "accent-cyan", completed: false },
                { id: 2, name: "Gym Session", xpReward: 150, dmg: 5000, icon: "fitness_center", color: "primary", completed: false },
                { id: 3, name: "Morning Yoga", xpReward: 30, dmg: 900, icon: "self_improvement", color: "slate-400", completed: false },
            ],
            notifications: [],

            isWatchConnected: false,
            stepsToday: 0,

            // Actions
            setAuth: (status) => set({ isAuthenticated: status }),
            setLanguage: (lang) => set({ language: lang }),
            connectWatch: () => {
                set({ isWatchConnected: 'connecting' });
                setTimeout(() => {
                    set({ isWatchConnected: true, stepsToday: 5420 });
                    get().addNotification(get().t('watchConnected'));
                }, 2000);
            },

            // ── Supabase Integration Actions ──
            setUser: (userData) => set((state) => ({
                user: { ...state.user, ...userData },
                isAuthenticated: true
            })),

            // Fetch profile from Supabase
            loadProfile: async (userId) => {
                const { fetchProfile, saveProgress } = await import('./supabaseClient');
                const { data, error } = await fetchProfile(userId);

                if (data && !error) {
                    set((state) => ({
                        user: {
                            ...state.user,
                            level: data.level || 1,
                            xp: data.xp || 0,
                            streak: data.streak || 0,
                            starCoins: data.star_coins || 0,
                            gems: data.gems || 0
                        }
                    }));
                } else if (error && (error.code === 'PGRST116' || error.message?.includes('single'))) {
                    // New User! Give 100 Gems as Signup Reward
                    const newUser = {
                        level: 1,
                        xp: 0,
                        maxXp: 100,
                        starCoins: 0,
                        gems: 100,
                        streak: 0,
                        multiplier: 1.0
                    };
                    set({ user: newUser });
                    await saveProgress(userId, newUser);
                    get().addNotification(get().t('signupRewardNotice'));
                }
            },

            // Save current profile to Supabase
            syncProfile: async () => {
                const state = get();
                const { supabase, saveProgress } = await import('./supabaseClient');
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    await saveProgress(user.id, state.user);
                }
            },

            syncHealthData: async () => {
                const extraSteps = 1500;
                const oldSteps = get().stepsToday;
                const newSteps = oldSteps + extraSteps;
                const gemsEarned = Math.floor(extraSteps / 100);

                set((state) => ({
                    stepsToday: newSteps,
                    user: { ...state.user, gems: state.user.gems + gemsEarned },
                    notifications: [...state.notifications, {
                        id: Date.now(),
                        text: `${translations[state.language].syncing} +${extraSteps} ${translations[state.language].steps} (+${gemsEarned} 💎)`
                    }]
                }));

                // Proactively sync to Supabase
                const state = get();
                const { supabase, saveProgress } = await import('./supabaseClient');
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await saveProgress(user.id, state.user);
            },

            t: (key, params = {}) => {
                const state = get();
                let text = translations[state.language][key] || key;
                Object.keys(params).forEach(p => {
                    text = text.replace(`{${p}}`, params[p]);
                });
                return text;
            },

            completeHabit: async (id) => {
                const state = get();
                const habit = state.habits.find(h => h.id === id);
                if (!habit || habit.completed) return;

                const xpGained = Math.floor(habit.xpReward * state.user.multiplier);
                const dmgDealt = habit.dmg;

                const updatedHabits = state.habits.map(h =>
                    h.id === id ? { ...h, completed: true, completedAt: new Date().toISOString() } : h
                );

                let newXp = state.user.xp + xpGained;
                let newLevel = state.user.level;
                let newMaxXp = state.user.maxXp;

                if (newXp >= state.user.maxXp) {
                    newXp = newXp - state.user.maxXp;
                    newLevel += 1;
                    newMaxXp = Math.floor(newMaxXp * 1.5);
                }

                const updatedBosses = [...state.bosses];
                const currentBoss = updatedBosses[state.currentBossIndex];
                currentBoss.hp = Math.max(0, currentBoss.hp - dmgDealt);

                const t = (key, params = {}) => {
                    let text = translations[state.language][key] || key;
                    Object.keys(params).forEach(p => { text = text.replace(`{${p}}`, params[p]); });
                    return text;
                };

                const newNotif = {
                    id: Date.now(),
                    text: `${t('dealtDamage', { dmg: dmgDealt.toLocaleString() })} ${t('gainedXp', { xp: xpGained })}`
                };

                // Update local state
                set((state) => ({
                    user: { ...state.user, level: newLevel, xp: newXp, maxXp: newMaxXp },
                    habits: updatedHabits,
                    bosses: updatedBosses,
                    notifications: [...state.notifications, newNotif]
                }));

                // ── Supabase Persistence ──
                const { supabase, logHabit, saveProgress } = await import('./supabaseClient');
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await logHabit(user.id, id, xpGained, dmgDealt);
                    await saveProgress(user.id, {
                        level: newLevel,
                        xp: newXp,
                        streak: state.user.streak,
                        starCoins: state.user.starCoins,
                        gems: state.user.gems
                    });
                }
            },

            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
            })),

            addNotification: (text) => set((state) => ({
                notifications: [...state.notifications, { id: Date.now(), text }]
            })),

            buyGacha: async () => {
                const state = get();
                if (state.user.gems >= 100) {
                    const newGems = state.user.gems - 100;
                    set((state) => ({
                        user: { ...state.user, gems: newGems },
                        notifications: [...state.notifications, { id: Date.now(), text: translations[state.language].purchaseSuccess }]
                    }));

                    // Sync to Supabase
                    const { supabase, saveProgress } = await import('./supabaseClient');
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) await saveProgress(user.id, { ...get().user, gems: newGems });
                }
            },

            addGems: async (amount) => {
                const newGems = get().user.gems + amount;
                set((state) => ({
                    user: { ...state.user, gems: newGems }
                }));

                // Sync to Supabase
                const { supabase, saveProgress } = await import('./supabaseClient');
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await saveProgress(user.id, { ...get().user, gems: newGems });
            }
        }),
        {
            name: 'habit-galaxy-storage', // unique name
        }
    )
);

export default useStore;
