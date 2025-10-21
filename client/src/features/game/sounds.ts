let audioContext: AudioContext | null = null;

function ensureContext() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!audioContext) {
    const anyWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const ContextConstructor = window.AudioContext ?? anyWindow.webkitAudioContext;
    if (!ContextConstructor) {
      return null;
    }
    audioContext = new ContextConstructor();
  }
  return audioContext;
}

function playTone({
  frequency,
  duration,
  type,
  gain,
  sweep,
}: {
  frequency: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  sweep?: number;
}) {
  const ctx = ensureContext();
  if (!ctx) {
    return;
  }

  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (sweep) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * sweep), now + duration);
  }

  gainNode.gain.setValueAtTime(gain, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  oscillator.connect(gainNode).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

export function playLaunchSound() {
  playTone({ frequency: 320, duration: 0.12, type: 'sawtooth', gain: 0.2, sweep: 1.4 });
}

export function playSwishSound() {
  playTone({ frequency: 620, duration: 0.22, type: 'triangle', gain: 0.25, sweep: 0.6 });
}

export function playRimSound() {
  playTone({ frequency: 180, duration: 0.18, type: 'square', gain: 0.18, sweep: 0.5 });
}
