import { useEffect, useRef } from "react";
import { getBands } from "./../audio/analyser";
import { useAudioEngine } from "./useAudioEngine";
import { createKick } from './../audio/kick';

import { createSnare } from "./../audio/snare";

export function useAudioSystem() {
  const { ctx, analyser, data } = useAudioEngine();

  const bandsRef = useRef({ bass: 0, mid: 0, high: 0 });
  const kickRef = useRef(null);
  const snareRef = useRef(null);

  useEffect(() => {
    if (!ctx.current || !analyser.current) return;

    // kick korzysta z TEGO SAMEGO ctx i analysera
    kickRef.current = createKick(ctx.current, analyser.current);
    snareRef.current = createSnare(ctx.current, analyser.current);

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

  const playSnare = () => {
  if (ctx.current.state === "suspended") {
    ctx.current.resume();
  }

  snareRef.current?.();
};
  

  return { playKick, playSnare, bandsRef };
}