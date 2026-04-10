// useAudioEngine.js
import { useEffect, useRef } from "react";

export function useAudioEngine() {
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // 🔥 KLUCZOWE POŁĄCZENIE
    analyser.connect(ctx.destination);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    dataRef.current = dataArray;
  }, []);

  return {
    ctx: ctxRef,
    analyser: analyserRef,
    data: dataRef,
  };
}