 // useAnalyser.js
import { useEffect, useRef } from "react";

export function useAnalyser() {
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;5
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

// export function getBands(analyser, dataArray) {
//   analyser.getByteFrequencyData(dataArray);

//   return {
//     bass: getEnergy(dataArray, 0, 20),
//     mid: getEnergy(dataArray, 20, 100),
//     high: getEnergy(dataArray, 100, 256),
//   };
// }
let smoothedBass = 0;
let smoothedSnare = 0;

export function getBands(analyser, dataArray) {
  
  //analyser.getByteFrequencyData(dataArray);

  analyser.getByteFrequencyData(dataArray);
  analyser.smoothingTimeConstant = 0.1;
  
  const rawBass = getEnergy(dataArray, 2, 10);
  const rawSnare = getEnergy(dataArray, 40, 120);
  
  // Interpolacja liniowa (lerp) - 0.2 to szybkość reakcji (0-1)
  // smoothedBass += (rawBass - smoothedBass) * 0.9;
  // smoothedSnare += (rawSnare - smoothedSnare) * 0.5;

  if (smoothedBass < 0.01) {
    smoothedBass = 0;
  }

   if (smoothedSnare < 0.01) {
    smoothedSnare = 0;
  }

  const attack = 0.6;
const release = 0.45;

// BASS
if (rawBass > smoothedBass) {
  smoothedBass += (rawBass - smoothedBass) * attack;
} else {
  smoothedBass += (rawBass - smoothedBass) * release;
}

// SNARE
if (rawSnare > smoothedSnare) {
  smoothedSnare += (rawSnare - smoothedSnare) * attack;
} else {
  smoothedSnare += (rawSnare - smoothedSnare) * release;
}
  //smoothedSnare += (rawSnare - smoothedSnare) * 0.99;
  //smoothedSnare += (rawSnare - smoothedSnare) * 0.5;

  return {
    // Czysty, głęboki kick (uderzenie stopy)
    bass: smoothedBass,//getEnergy(dataArray, 2, 10), 
    
    // "Puknięcie" werbla / środek pasma
    // Zaczynamy wyżej, żeby nie łapać ogona basu
    mid:  smoothedSnare, //getEnergy(dataArray, 40, 120), 
    //mid: getEnergy(dataArray, 40, 120), 
    
    // Cyknięcia hi-hatu i talerzy
    high: getEnergy(dataArray, 180, 250),
  };
}