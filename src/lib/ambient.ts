/** Optional soft ambient pad, generated in the browser. Off by default. No audio files. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function build() {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.connect(master);
  master.connect(ctx.destination);

  // A slow, open chord. Each voice drifts in volume at its own pace.
  [196, 246.94, 293.66, 392].forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    osc.type = i % 2 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    const gain = ctx!.createGain();
    gain.gain.value = 0.12;
    const lfo = ctx!.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.023;
    const depth = ctx!.createGain();
    depth.gain.value = 0.09;
    lfo.connect(depth);
    depth.connect(gain.gain);
    osc.connect(gain);
    gain.connect(filter);
    osc.start();
    lfo.start();
  });
}

export function setAmbient(on: boolean) {
  try {
    if (on && !ctx) build();
    if (!ctx || !master) return;
    if (on) void ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(on ? 0.12 : 0, ctx.currentTime + 2.5);
  } catch {
    // Sound is optional. Silence is an acceptable outcome.
  }
}
