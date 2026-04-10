export function createSnare(ctx, analyser) {
  return () => {
    const t = ctx.currentTime;

    // === NOISE ===
    const bufferSize = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 2500; // 👈 mocne odcięcie dołu

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15); // 👈 krótszy = bardziej snappy

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(analyser);

    noise.start(t);
    noise.stop(t + 0.15);

    // === BODY (klik / snap) ===
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(500, t); // 👈 już OK

    // 🔥 DODAJEMY FILTR (to było kluczowe)
    const oscFilter = ctx.createBiquadFilter();
    oscFilter.type = "highpass";
    oscFilter.frequency.value = 300; // 👈 usuwa resztki basu

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(oscFilter);
    oscFilter.connect(oscGain);
    oscGain.connect(analyser);

    osc.start(t);
    osc.stop(t + 0.08);
  };
}