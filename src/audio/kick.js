import { useRef, useEffect } from "react";

export function createKick(ctx, analyser) {
  return () => {
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";

    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);

    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    //gain.connect(ctx.destination);
    // 🔥 NAJWAŻNIEJSZE:
    gain.connect(analyser);

    osc.start(t);
    osc.stop(t + 0.15);
  };
}

export function useKick() {
  const ctxRef = useRef(null);
  const kickRef = useRef(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    kickRef.current = createKick(ctx);
  }, []);

  const playKick = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    kickRef.current?.();
  };

  return { playKick };
}

