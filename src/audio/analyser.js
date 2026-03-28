 // useAnalyser.js
import { useEffect, useRef } from "react";

export function useAnalyser() {
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 1024;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    dataRef.current = dataArray;

    analyser.connect(ctx.destination);
  }, []);

  return {
    ctx: ctxRef,
    analyser: analyserRef,
    data: dataRef,
  };
}

export function getEnergy(dataArray, from, to) {
  let sum = 0;

  for (let i = from; i < to; i++) {
    sum += dataArray[i];
  }

  return sum / (to - from) / 255; // normalizacja 0–1
}

export function getBands(analyser, dataArray) {
  analyser.getByteFrequencyData(dataArray);

  return {
    bass: getEnergy(dataArray, 0, 20),
    mid: getEnergy(dataArray, 20, 100),
    high: getEnergy(dataArray, 100, 256),
  };
}