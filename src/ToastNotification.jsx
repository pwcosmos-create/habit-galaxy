import React from 'react';
import useStore from './store';

export const ToastNotification = () => {
    const { notifications, removeNotification } = useStore();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    className="glass-panel bg-background-dark/90 border border-primary/50 text-white px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-[slideIn_0.3s_ease-out] w-full max-w-sm pointer-events-auto"
                >
                    <span className="material-symbols-outlined text-primary glow-gold">add_task</span>
                    <p className="font-bold text-sm flex-1">{notif.text}</p>
                    <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    {/* Auto-remove after 3 seconds */}
                    {setTimeout(() => removeNotification(notif.id), 3000) && null}
                </div>
            ))}
        </div>
    );
};
