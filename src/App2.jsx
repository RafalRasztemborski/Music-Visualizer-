import { useState, useRef, useEffect } from 'react';
import Viewer from './components/Viewer';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import Cube from './sketches/Cube';
import Cube2 from './sketches/Cube2';
import './styles.css';

// export default function App() {
//   const sketches = [
//     { name: "Sketch 1", file: "sketch1" },
//     { name: "Sketch 2", file: "sketch2" }
//   ];

//   const [activeSketch, setActiveSketch] = useState(sketches[0]);

//   return (
//     <div className="app">
//       <Viewer sketchName={activeSketch.file} />
//       <Sidebar sketches={sketches} onSelect={setActiveSketch} />
//     </div>
//   );
// }

export default function App() {
  const [settings, setSettings] = useState({
    X_GAP: 5,
    Y_GAP: 5,
    Z_GAP: 5,
    X_ROTATE: 0.5,
    Y_ROTATE: 0.5,
    Z_ROTATE: 0,
  });

  //const sketch = Cube2(settings);

  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const sketch = Cube(settingsRef);

  return (
    <div className="app">
      <Viewer sketch={sketch} />
      <Controls settings={settings} setSettings={setSettings} />
    </div>
  );
}
