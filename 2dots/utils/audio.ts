
// Simple Web Audio API wrapper for procedural sound effects
let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx || audioCtx.state === 'closed') {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  return audioCtx;
};

// Try to resume whenever possible and play a silent buffer to fully unlock iOS
export const initAudio = () => {
  const ctx = getCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Play a silent buffer to force the audio engine to wake up (Critical for iOS)
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    // Ignore errors here
  }
};

const triggerHaptic = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
};

export const playSelect = (index: number) => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    
    // Auto-resume if needed (handling interruption)
    if (ctx.state === 'suspended') ctx.resume();

    // Haptic tick
    triggerHaptic(5);
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // C Major Pentatonic scale
    const baseFreq = 261.63; 
    const pentatonicSteps = [0, 2, 4, 7, 9];
    
    const octave = Math.floor(index / 5);
    const stepIndex = index % 5;
    const semitones = (octave * 12) + pentatonicSteps[stepIndex];
    const freq = baseFreq * Math.pow(2, semitones / 12);

    // Schedule slightly in the future to prevent "past time" errors
    const t = ctx.currentTime + 0.01;

    osc.frequency.setValueAtTime(freq, t);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.02); // Attack
    gain.gain.linearRampToValueAtTime(0, t + 0.15);   // Decay
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.2);
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};

export const playSquare = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    // Haptic success vibration
    triggerHaptic([10, 30, 10]);

    const t = ctx.currentTime + 0.01;
    
    // C Major Chord: C, E, G (Octave 3 - Lowered)
    const baseFreq = 130.81;

    [0, 4, 7].forEach((semitone, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const freq = baseFreq * Math.pow(2, semitone / 12); 
      osc.frequency.value = freq;
      osc.type = 'triangle'; 
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.05 + (i * 0.02));
      gain.gain.linearRampToValueAtTime(0, t + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.7);
    });
  } catch (e) {}
};

export const playPop = (count: number) => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    // Stronger haptic for clearing
    triggerHaptic(15);

    const t = ctx.currentTime + 0.01;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Pitch sweep
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.15);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.6, t); 
    gain.gain.linearRampToValueAtTime(0, t + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.25);
  } catch (e) {}
};
