import { useEffect, useState } from "react";
import { useAnalyser } from './../audio/analyser';

export function useAudioReactive() {
  const { ctx, analyser, data } = useAnalyser();
  const [bands, setBands] = useState({ bass: 0, mid: 0, high: 0 });

  useEffect(() => {
    function loop() {
      if (analyser.current && data.current) {
        const b = getBands(analyser.current, data.current);
        setBands(b);
      }

      requestAnimationFrame(loop);
    }

    loop();
  }, []);

  return { bands };
}

function getBands(analyser, dataArray) {
  analyser.getByteFrequencyData(dataArray);

  return {
    bass: getEnergy(dataArray, 0, 20),
    mid: getEnergy(dataArray, 20, 100),
    high: getEnergy(dataArray, 100, 256),
  };
}

function getEnergy(dataArray, from, to) {
  let sum = 0;

  for (let i = from; i < to; i++) {
    sum += dataArray[i];
  }

  return sum / (to - from) / 255; // normalizacja 0–1
}