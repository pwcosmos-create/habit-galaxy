import React, { useState } from 'react';
import useStore from './store';
import { signIn, signUp, signInWithGoogle, isSupabaseConfigured } from './supabaseClient';

export const AuthScreen = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { addNotification, t, language, setLanguage } = useStore();

    const handleAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError(language === 'ko' ? '이메일과 비밀번호를 입력해주세요.' : 'Please enter email and password.'); return; }
        setLoading(true);
        setError('');

        // ── Admin Access Logic ──
        if (email === 'admin@habitgalaxy.com' && password === 'admin777') {
            useStore.setState((state) => ({
                user: { ...state.user, gems: 999999, level: 99, starCoins: 999999, isAdmin: true }
            }));
            addNotification("🛡️ 관리자 권한으로 시스템에 접속합니다.");
            onLogin();
            return;
        }

        // ── Demo Mode Bypass Logic ──
        if (!isSupabaseConfigured()) {
            addNotification(t('demoModeWelcome'));
            onLogin();
            setLoading(false);
            return;
        }

        try {
            let result;
            if (isLogin) {
                result = await signIn(email, password);
            } else {
                result = await signUp(email, password);
            }
            if (result.error) {
                setError(result.error.message);
            } else {
                addNotification(t('welcomeHero'));
                onLogin();
            }
        } catch (err) {
            addNotification(t('demoModeWelcome'));
            onLogin();
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                addNotification(t('demoModeWelcome'));
                onLogin();
            }
        } catch {
            addNotification(t('demoModeWelcome'));
            onLogin();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen font-display relative overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="absolute inset-0 pointer-events-none opacity-20 star-field"></div>

            {/* Language Switcher */}
            <div className="absolute top-6 right-6 z-50 flex gap-1 bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/5">
                {['ko', 'en', 'jp', 'es', 'zh'].map(lang => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${language === lang ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
                    >{lang.toUpperCase()}</button>
                ))}
            </div>

            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

            <div className="relative z-10 w-full max-w-sm mb-10 flex flex-col items-center text-center">
                <div className="absolute w-56 h-56 bg-primary/15 rounded-full blur-[60px] pointer-events-none"></div>
                <img
                    alt="Space Explorer Pet Mascot"
                    className="w-44 h-44 object-contain drop-shadow-[0_0_25px_rgba(34,211,238,0.5)] animate-[bounce_3s_ease-in-out_infinite] mb-4 z-10"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmvRpgLKqTIv-g2UGj7iKb2DYsF8SHhiF4pyQmnQCYvVhj5hxV4zfDWdQMfJtGsKfGFzDI2EWt_XXkKw0UK-LdlkiYfLAckAVsm8fiBlvaMw0p8WDVSPHSbB4p2sVvyy0Smut5HW2PbUb_JU1R6ZEErqu9gNQyXw6wGfEjMmkp6fo2AfRGRrkEx7ywx0a_qixkRGOVeFRlPJevdfZRfs5n1svTMqum_vUh_GI48eTSSVOIY8A7mTRkHE_E3LR48QICevirOdiqw7Y"
                />
                <h1 className="text-4xl font-black tracking-tight text-white uppercase">
                    {t('appName').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan">{t('appName').split(' ')[1]}</span>
                </h1>
                <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-2 px-4 leading-relaxed">
                    {t('motto')}
                </p>
            </div>

            <div className="relative z-10 w-full max-w-sm flex mb-6 glass-panel p-1 rounded-xl">
                <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-primary text-black shadow-[0_0_12px_rgba(13,242,89,0.4)]' : 'text-slate-400'}`}
                >{t('login')}</button>
                <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-primary text-black shadow-[0_0_12px_rgba(13,242,89,0.4)]' : 'text-slate-400'}`}
                >{t('signUp')}</button>
            </div>

            <div className="relative z-10 w-full max-w-sm glass-panel p-6 rounded-3xl border-primary/10 shadow-[0_0_50px_rgba(13,242,89,0.08)]">
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Email Address</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">mail</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all text-white placeholder-slate-600"
                                placeholder={t('emailPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Password</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">lock</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all text-white placeholder-slate-600"
                                placeholder={t('passwordPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    defaultChecked
                                />
                                <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                                <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[12px] text-black font-black opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">{t('stayLoggedIn')}</span>
                        </label>
                    </div>

                    {error && (
                        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(13,242,89,0.3)] disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                ...
                            </span>
                        ) : isLogin ? t('enterSystem') : t('initializeLink')}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                </div>

                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all hover:border-white/30 disabled:opacity-50"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    <span className="text-sm">{t('continueWithGoogle')}</span>
                </button>

                <p
                    className="text-[10px] text-slate-500 text-center mt-5 cursor-pointer hover:text-white transition-colors"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? (language === 'ko' ? "아직 아바타가 없나요? 가입하기 →" : "Don't have an avatar? Sign Up →") : (language === 'ko' ? "← 이미 영웅인가요? 로그인" : "← Already a hero? Log In")}
                </p>
            </div>

            {/* Mission Statement Section */}
            <div className="relative z-10 w-full max-w-sm mt-10">
                <div className="glass-panel p-6 rounded-3xl border-accent-cyan/10 bg-accent-cyan/5">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-accent-cyan animate-pulse">auto_awesome</span>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white underline decoration-accent-cyan/40 underline-offset-4">{t('missionTitle')}</h4>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-400 font-medium italic">
                        "{t('missionBody')}"
                    </p>
                </div>
            </div>

            <p className="relative z-10 text-slate-600 text-[9px] uppercase tracking-widest mt-12 text-center leading-relaxed">
                {t('appName')} · Gamified Habit Tracker<br />
                <span className="text-slate-700">{t('demoModeNotice')}</span>
            </p>
        </div>
    );
};
