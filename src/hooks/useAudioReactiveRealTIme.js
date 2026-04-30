import { useRef, useEffect } from 'react';

export const useAudioReactiveRealTime = (bandsRef) => {
  useEffect(() => {
    let audioCtx, analyser, source, stream;

    const initAudio = async () => {
      try {
        console.log('lemme use yr microphone');
        // 1. Prośba o dostęp do "mikrofonu" (czyli naszego wirtual nego kabla)
        // stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // analyser = audioCtx.createAnalyser();
        // source = audioCtx.createMediaStreamSource(stream);
        // //console.log('ooooo');
        // source.connect(analyser);
        // analyser.fftSize = 512;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
          analyser.getByteFrequencyData(dataArray);
          // console.log('I UPDATE');
          // Wyliczanie pasm (uproszczone)
          const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 2550;
          const mid =
            dataArray.slice(10, 50).reduce((a, b) => a + b, 0) / 10200;
          const high =
            dataArray.slice(50, 150).reduce((a, b) => a + b, 0) / 25500;

          //console.log('BASSS: ', bass);
          //console.log('MID: ', mid);

          bandsRef.current = {
            bass,
            mid,
            high,
            data: Array.from(dataArray), // Twoja pętla w sketchu tego potrzebuje
          };

          requestAnimationFrame(update);
        };
        update();
      } catch (err) {
        console.error('Audio init error:', err);
      }
    };

    // Przeglądarki blokują audio bez interakcji - musisz np. kliknąć przycisk START
    window.addEventListener('click', initAudio, { once: true });

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close();
    };
  }, []);

  return bandsRef;
};
