import { useEffect, useRef } from "react";
import { getBands } from "./../audio/analyser";
import { useAudioEngine } from "./useAudioEngine";
import { createKick } from './../audio/kick';

export function useAudioSystem() {
  const { ctx, analyser, data } = useAudioEngine();

  const bandsRef = useRef({ bass: 0, mid: 0, high: 0 });
  const kickRef = useRef(null);

  useEffect(() => {
    if (!ctx.current || !analyser.current) return;

    // kick korzysta z TEGO SAMEGO ctx i analysera
    kickRef.current = createKick(ctx.current, analyser.current);

    function loop() {
      if (analyser.current && data.current) {
        bandsRef.current = getBands(analyser.current, data.current);
      }

      requestAnimationFrame(loop);
    }

    loop();
  }, []);

  const playKick = () => {
    if (ctx.current.state === "suspended") {
      ctx.current.resume();
    }

    kickRef.current?.();
  };

  return { playKick, bandsRef };
}

// function createKick(ctx, analyser) {
//   return () => {
//     const t = ctx.currentTime;

//     const osc = ctx.createOscillator();
//     const gain = ctx.createGain();

//     osc.frequency.setValueAtTime(150, t);
//     osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);

//     gain.gain.setValueAtTime(1, t);
//     gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

//     osc.connect(gain);

//     // 🔥 NAJWAŻNIEJSZE:
//     gain.connect(analyser);

//     osc.start(t);
//     osc.stop(t + 0.15);
//   };
// }