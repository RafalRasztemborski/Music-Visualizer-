import { useEffect, useRef } from 'react';
import p5 from 'p5';

export default function Viewer({ sketch }) {
  const containerRef = useRef(null);
  const p5Instance = useRef(null);
  const sketchRef = useRef(sketch);

  // 🔥 aktualizujemy tylko referencję (bez restartu p5)
  useEffect(() => {
    sketchRef.current = sketch;
  }, [sketch]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const instance = (p) => {
      let currentSketch;

      p.setup = () => {
        p.createCanvas(container.offsetWidth, container.offsetHeight, p.WEBGL);

        currentSketch = sketchRef.current(p);
        currentSketch?.setup?.();
      };

      p.draw = () => {
        // 🔥 zawsze używaj aktualnego sketch
        currentSketch = sketchRef.current(p);
        currentSketch?.draw?.();
      };

      p.windowResized = () => {
        p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      };
    };

    p5Instance.current = new p5(instance, container);

    return () => {
      p5Instance.current?.remove();
    };
  }, []); // ❗ tylko raz

  return <div ref={containerRef} className="viewer" />;
}
