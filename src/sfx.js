/**
 * useSFX — lightweight Web Audio API sound engine.
 * No external MP3 files required; tones are synthesized on the fly.
 */

const ctx = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

function play(type = 'sine', freq = 440, duration = 0.15, vol = 0.25, fadeOut = true) {
    if (!ctx) return;
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

/** Short satisfying "click/pop" when logging a habit */
export function playHit() {
    play('square', 300, 0.08, 0.15);
    setTimeout(() => play('sine', 500, 0.07, 0.1), 40);
}

/** Fanfare on level-up */
export function playLevelUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
        setTimeout(() => play('triangle', f, 0.25, 0.3), i * 110);
    });
}

/** Coin ding for purchases / gacha */
export function playCoin() {
    play('sine', 1200, 0.12, 0.2);
    setTimeout(() => play('sine', 900, 0.08, 0.08), 80);
}

/** Thud when boss takes damage */
export function playBossHit() {
    play('sawtooth', 80, 0.22, 0.4);
    setTimeout(() => play('square', 180, 0.1, 0.15), 80);
}

/** Error / not-enough-gems */
export function playError() {
    play('square', 120, 0.18, 0.3);
}
