import React, { useState, useRef, useEffect } from 'react';
import p5 from 'p5';
import { useAudioReactive } from './hooks/useAudioReactive';
import { useAudioReactiveRealTime } from './hooks/useAudioReactiveRealTIme';

// --- Example Sketches ---
const sketches = {
  bouncingBall: {
    name: 'Bouncing Ball',
    controls: {
      speed: { type: 'range', min: 1, max: 10, default: 3 },
      showTrail: { type: 'checkbox', default: true },
    },
    sketch: (p5, params) => {
      let x = 100;
      let y = 100;
      let vx = 2;
      let vy = 2;

      p5.setup = () => {
        p5.createCanvas(600, 400);
      };

      p5.draw = () => {
        if (!params.showTrail) p5.background(0);

        x += vx * params.speed;
        y += vy * params.speed;

        if (x < 0 || x > p5.width) vx *= -1;
        if (y < 0 || y > p5.height) vy *= -1;

        p5.fill(255);
        p5.circle(x, y, 20);
      };
    },
  },
  dupa: {
    name: 'Dupa',
    controls: {
      X_SIZE: { type: 'range', min: 1, max: 100, default: 20 },
      Y_SIZE: { type: 'range', min: 1, max: 100, default: 20 },
      Z_SIZE: { type: 'range', min: 1, max: 500, default: 20 },

      X_ROWS: { type: 'range', min: 4, max: 35, default: 10 },
      Y_ROWS: { type: 'range', min: 4, max: 35, default: 10 },
      Z_ROWS: { type: 'range', min: 4, max: 35, default: 10 },

      X_GAP: { type: 'range', min: 0, max: 100, default: 0 },
      Y_GAP: { type: 'range', min: 0, max: 100, default: 0 },
      Z_GAP: { type: 'range', min: 0, max: 100, default: 0 },

      X_ROTATE: { type: 'range', min: 1, max: 360, default: 0 },
      Y_ROTATE: { type: 'range', min: 1, max: 360, default: 0 },
      Z_ROTATE: { type: 'range', min: 1, max: 360, default: 0 },

      spinX: { type: 'checkbox', default: false },
      spinY: { type: 'checkbox', default: false },
      spinZ: { type: 'checkbox', default: false },

      bassAnimTreshold: { type: 'range', min: 0, max: 1000, default: 500 },
      bassAttack: { type: 'range', min: 1, max: 100, default: 50 },
      decay: { type: 'range', min: 1, max: 100, default: 50 },

      // stroke: {type: "range", min: 1, max: 100, default: 5},

      rotationSpped: { type: 'range', min: 1, max: 1000, default: 20 },

      bg_fadeOut: { type: 'range', min: 0, max: 255, default: 80 },

      drawingTechnique: { type: 'checkbox', default: true },
      dynamicLight: { type: 'checkbox', default: true },

      beatDetector: { type: 'checkbox', default: true },

      z_position: { type: 'range', min: -2000, max: 800, default: 0 },
      Crazy_z_position: { type: 'range', min: -50, max: 50, default: 0 },

      animate_x: { type: 'checkbox', default: true },
      animate_y: { type: 'checkbox', default: true },
      animate_z: { type: 'checkbox', default: true },

      freeze: { type: 'checkbox', default: false },
      transitionDuraion: { type: 'range', min: 0, max: 100, default: 0 },

      // colorR: { type: "range", min: 0, max: 255, default: 0 },
      // colorG: { type: "range", min: 0, max: 255, default: 255 },
      // colorB: { type: "range", min: 0, max: 255, default: 200 },
      opacity: { type: 'range', min: 0, max: 255, default: 255 },

      // light_1: { type: "range", min: 0, max: 255, default: 0 },
      // light_2: { type: "range", min: 0, max: 255, default: 255 },
      // light_3: { type: "range", min: 0, max: 255, default: 255 },
      // light_4: { type: "range", min: -10, max: 10, default: -0.5 },
      // light_5: { type: "range", min: -10, max: 10, default: 0.5 },
      // light_6: { type: "range", min: -10, max: 10, default: -1 }
    },
    sketch: (
      sketch,
      paramsRef,
      bandsRef,
      onDebug,
      screenWidth,
      screenHeight,
    ) => {
      const SCREEN_WIDTH = screenWidth; //1280;
      const SCREEN_HEIGHT = screenHeight; // 440;

      let X_SIZE = paramsRef.current.X_SIZE;
      let Y_SIZE = paramsRef.current.Y_SIZE;
      let Z_SIZE = paramsRef.current.Z_SIZE;

      let X_ROWS = paramsRef.current.X_ROWS;
      let Y_ROWS = paramsRef.current.Y_ROWS;
      let Z_ROWS = paramsRef.current.Z_ROWS;

      let X_GAP = paramsRef.current.X_GAP;
      let Y_GAP = paramsRef.current.Y_GAP;
      let Z_GAP = paramsRef.current.Z_GAP;

      let x_pos = 0;
      let y_pos = 0;
      let z_pos = 0;

      let rotX = 0;
      let rotY = 0;
      let rotZ = 0;

      // MUSIC
      let smoothBass = 0;
      let bassVelocity = 0;

      let beatProgress = 0; // 0 → 1
      let isBeatActive = false;
      let beatDuration = 0.35; // sekundy (czas animacji po uderzeniu)
      let prevBass = 0;

      let stroke = paramsRef.current.stroke;

      // DO TRANZYCJI
      const lerp = (a, b, t) => a + (b - a) * t;
      const easeInOut = (t) => t * t * (3 - 2 * t);

      // STATE
      let state = {};
      let target = {};

      let transitionProgress = 1;
      let transitionDuration = 1.5; //paramsRef.current.transitionDuraion; // sekundy
      let currentPreset = null;

      // Animacja
      let sc = 0; // TO MA WPLYW NA ANIMACJE
      let bassAnim = 0; // TO MA WPLYW NA ANIMACJE

      let incrementerForAnimation = 0;

      // STORAGE (FOR ANIMATIONS)
      let keyframes = [];
      let isRecording = false;
      let isPlaying = false;
      let playhead = 0; // sekundy

      // hack for saving
      window.__keyframes = keyframes;

      // Loading animation
      window.__setKeyframes = (data) => {
        keyframes.length = 0; // zachowujemy referencję
        keyframes.push(...data);

        playhead = 0;
        isPlaying = true;

        console.log('LOADED ANIMATION:', keyframes.length);
      };

      function recordFrame(time) {
        keyframes.push({
          time,
          params: { ...paramsRef.current },
        });
      }

      let boxModel; // zmienna globalna wewnątrz sketch

      // let myShader;
      // sketch.preload = function() {
      //   // myShader = sketch.loadShader('./shader/shader.vert', './shader/shader.frag');
      // };
      sketch.setup = function () {
        //myShader = sketch.loadShader('/shader/shader.vert', '/shader/shader.frag')
        sketch.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT, sketch.WEBGL);

        let gl = sketch.drawingContext;
        gl.enable(gl.CULL_FACE); // Włącza odrzucanie ścianek
        gl.cullFace(gl.FRONT); // Mówi: "nie rysuj tego, co jest z tyłu"

        sketch.background(0);
        //sketch.hint(sketch.ENABLE_DEPTH_TEST); // sketch.hint is not a function
        //sketch.pixelDensity(1); //real game changer in terms of fps
        //sketch.noStroke();
        //sketch.noSmooth();

        // Tworzymy model sześcianu jednostkowego (1x1x1)
        // To wykonuje się tylko RAZ.
        boxModel = sketch.createModel(() => {
          sketch.box(1);
        }, 'mini_cube');

        // inicjalizacja z aktualnych sliderów
        state = { ...paramsRef.current };
        target = { ...paramsRef.current };

        sketch.keyPressed = () => {
          if (sketch.key === 'r') {
            isRecording = !isRecording;
            console.log('RECORD:', isRecording);
            console.log('FRAMES:', keyframes.length);

            if (isRecording) {
              // keyframes = [];
              keyframes.length = 0;
              playhead = 0;
            }
          }

          if (sketch.key === 'p') {
            isPlaying = !isPlaying;
            playhead = 0;
            console.log('PLAY:', isPlaying);
          }
        };
      };

      let fpsHistory = [];
      sketch.draw = function () {
        let hasChanged = false;

        //🔹 TRAIL (zamiast background) TO DO: przesun glębie bo urywa obraz
        // sketch.push();
        // sketch.resetMatrix();
        // sketch.translate(-sketch.width / 2, -sketch.height / 2);

        // sketch.noStroke();
        // sketch.fill(0, 0, 0, paramsRef.current.bg_fadeOut);
        // sketch.rect(0, 0, sketch.width, sketch.height);

        // sketch.pop();
        // // TRAIL

        // --- Wewnątrz p5.draw ---
        // TRAIL 2
        sketch.push();
        // 1. Resetujemy macierz, aby prostokąt pokrył cały ekran
        sketch.resetMatrix();

        // 2. WYŁĄCZAMY TEST GŁĘBI (To zastępuje niedziałające hint)
        // Dzięki temu prostokąt nie będzie "blokowany" przez sześciany w 3D
        const gl = sketch.drawingContext;
        gl.disable(gl.DEPTH_TEST);

        // 3. Rysujemy prostokąt czyszczący (Trail)
        sketch.noStroke();
        // state.bg_fadeOut: 0-255 (np. 20 dla długiego trailu)
        sketch.fill(0, 0, 0, paramsRef.current.bg_fadeOut);
        sketch.rect(
          -sketch.width / 2,
          -sketch.height / 2,
          sketch.width,
          sketch.height,
        );

        // 4. WŁĄCZAMY TEST GŁĘBI z powrotem dla reszty obiektów 3D
        gl.enable(gl.DEPTH_TEST);
        sketch.pop();

        // --- Tutaj dalej Twoje rysowanie boxów ---

        // TAIL 3
        // Wewnątrz rysowania TRAILU:
        // sketch.push();
        // sketch.resetMatrix();
        // const gl = sketch.drawingContext;

        // // 1. Wyłączamy zapis do bufora głębi, ale zostawiamy testowanie
        // gl.depthMask(false);

        // sketch.noStroke();
        // sketch.fill(0, 0, 0, paramsRef.current.bg_fadeOut);
        // sketch.rect(-sketch.width/2, -sketch.height/2, sketch.width, sketch.height);

        // // 2. Włączamy zapis z powrotem
        // gl.depthMask(true);
        // sketch.pop();

        // 1. Wyłączenie sprawdzania głębi (Najszybszy "Hack")
        // Jeśli Twój trail musi być rysowany w ten sposób, musisz tymczasowo wyłączyć depth test, aby p5 nie próbowało obliczać, czy prostokąt trailu jest przed czy za sześcianami.
        // sketch.push();
        // sketch.resetMatrix();
        // // Wyłączamy sprawdzanie głębi, żeby prostokąt nie "gryzł się" z 3D
        // sketch.hint(sketch.DISABLE_DEPTH_TEST);
        // sketch.noStroke();
        // sketch.fill(25, 25, 25, state.bg_fadeOut);
        // // Przesunięcie lekko w tył, by nie kolidowało z kamerą
        // sketch.translate(0, 0, -1);
        // sketch.rect(-sketch.width/2, -sketch.height/2, sketch.width, sketch.height);
        // sketch.hint(sketch.ENABLE_DEPTH_TEST);
        // sketch.pop();

        // 3 opcja
        //sketch.background(25, 25, 25, 50);

        // shader
        //sketch.shader(myShader);

        //myShader.setUniform('u_resolution', [SCREEN_WIDTH, SCREEN_HEIGHT]);
        //myShader.setUniform('u_time', millis() / 1000);

        //rect(-width/2, -height/2, width, height);

        let currentFPS = sketch.frameRate();
        fpsHistory.push(currentFPS);
        if (fpsHistory.length > 30) fpsHistory.shift();
        let avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;

        // for (let key in paramsRef.current) {
        //   if (paramsRef.current[key] !== target[key]) {
        //     hasChanged = true;
        //     break;
        //   }
        // }

        // if (hasChanged) {
        //   target = { ...paramsRef.current };
        //   transitionProgress = 0;
        // }
        if (!isPlaying && hasChanged) {
          target = { ...paramsRef.current };
          transitionProgress = 0;
        }

        transitionDuration = paramsRef.current.transitionDuraion;
        //console.log('transitionDuration', transitionDuration)
        // INTERPOLACJA (core system)
        const dt = sketch.deltaTime / 1000;

        if (transitionProgress < 1) {
          transitionProgress += dt / transitionDuration;
          if (transitionProgress > 1) transitionProgress = 1;

          const t = easeInOut(transitionProgress);

          const newState = {};

          for (let key in state) {
            const start = state[key];
            const end = target[key];

            if (typeof start === 'number' && typeof end === 'number') {
              newState[key] = lerp(start, end, t);
            } else {
              newState[key] = end;
            }
          }

          state = newState;
        } else {
          state = target;
        }

        //RECORDING
        if (isRecording) {
          playhead += dt;
          recordFrame(playhead);
          console.log('REC frames:', keyframes.length);
        }

        // RECORD PLAYING
        if (isPlaying && keyframes.length > 1) {
          playhead += dt;

          if (playhead > keyframes[keyframes.length - 1].time) {
            playhead = 0; // 🔥 LOOP
          }

          // znajdź 2 klatki między którymi jesteśmy
          let k1 = keyframes[0];
          let k2 = keyframes[keyframes.length - 1];

          for (let i = 0; i < keyframes.length - 1; i++) {
            if (
              playhead >= keyframes[i].time &&
              playhead <= keyframes[i + 1].time
            ) {
              k1 = keyframes[i];
              k2 = keyframes[i + 1];
              break;
            }
          }

          const span = k2.time - k1.time;
          const tRaw = span === 0 ? 0 : (playhead - k1.time) / span;
          const t = easeInOut(tRaw);

          const newTarget = {};

          for (let key in k1.params) {
            const a = k1.params[key];
            const b = k2.params[key];

            if (typeof a === 'number') {
              newTarget[key] = lerp(a, b, t);
            } else {
              newTarget[key] = b;
            }
          }

          // 👇 to wpinasz w Twój system //
          target = newTarget;
          transitionProgress = 1; // natychmiast ustawiamy state
        }

        // if(paramsRef.current.beatDetector) {

        // }

        // Podlaczenie do audio
        const bands = bandsRef.current.current;
        //console.log('BANDS', bands);
        const bass = bands.bass;
        //const { bass, mid, high } = bandsRef.current;
        // 🔥 SMOOTH BASS (attack + decay)
        const attack = paramsRef.current.bassAttack / 100; // jak szybko reaguje na beat
        const decay = paramsRef.current.decay / 100; // 0.2; // jak wolno opada
        // console.log(
        //   'attack',
        //   attack,
        //   'paramsRef.current.bassAttack',
        //   paramsRef.current.bassAttack,
        // );
        if (
          bass > smoothBass &&
          smoothBass < paramsRef.current.bassAnimTreshold / 5000
        ) {
          //console.log('smoothBass', smoothBass, 'bassAnim:', bassAnim);
          smoothBass += (bass - smoothBass) * attack;
        } else {
          smoothBass *= decay;
        }

        if (smoothBass < 0.01) {
          smoothBass = 0;
        }

        bassAnim += (smoothBass - bassAnim) * 0.1; // TO MA WPLYW NA ANIMACJE

        // próg – dostosuj do swojego audio
        const threshold = 0.1;

        if (bass > threshold && prevBass <= threshold) {
          isBeatActive = true;
          beatProgress = 0;
        }
        if (!isBeatActive) {
          beatProgress *= 0.9; // decay do 0
        }
        if (isBeatActive) {
          beatProgress += dt / beatDuration;

          if (beatProgress >= 1) {
            beatProgress = 0; // 🔥 FIX
            isBeatActive = false;
          }
        }

        // if(bass > 0.15) {
        //   paramsRef.current.dynamicLight = !paramsRef.current.dynamicLight;
        // }

        // const t = easeInOut(beatProgress);
        //prevBass = bass;

        // DEBUGING
        onDebug({
          isRecording,
          isPlaying,
          frames: keyframes.length,
          time: playhead,
          FPS: avgFPS.toFixed(1),
          smoothBass: smoothBass,
          incrementerForAnimation,
        });

        X_SIZE = paramsRef.current.X_SIZE;
        Y_SIZE = paramsRef.current.Y_SIZE; //+ parseInt(mid * 20)
        Z_SIZE = paramsRef.current.Z_SIZE; //* (bass )

        X_ROWS = paramsRef.current.X_ROWS;
        Y_ROWS = paramsRef.current.Y_ROWS; //+ parseInt(mid * 10)
        Z_ROWS = paramsRef.current.Z_ROWS; //+ parseInt(smoothBass * (25 * (smoothBass + 1)))

        // X_GAP = state.X_GAP + parseInt(bass * (120 / (bass + 1)))
        //Y_GAP = state.Y_GAP + parseInt(mid * (50 / (mid + 1)))
        //X_GAP = state.X_GAP;
        X_GAP = paramsRef.current.X_GAP; //+ parseInt(smoothBass * (60 * (smoothBass + 1)))
        // Y_GAP =
        //   paramsRef.current.Y_GAP +
        //   Math.floor(smoothBass * (120 * (smoothBass + 1)));
        Y_GAP = paramsRef.current.Y_GAP;
        Z_GAP = paramsRef.current.Z_GAP;

        sketch.rotateX(paramsRef.current.X_ROTATE / 90);
        sketch.rotateY(paramsRef.current.Y_ROTATE / 90);
        sketch.rotateZ(paramsRef.current.Z_ROTATE / 90);

        if (state.spinX) {
          rotX += dt * (state.rotationSpped / 100);
        }

        if (state.spinY) {
          rotY += dt * (state.rotationSpped / 100);
        }

        if (state.spinZ) {
          rotZ += dt * (state.rotationSpped / 100);
        }

        if (!paramsRef.current.drawingTechnique) {
          sketch.translate(0, 0, paramsRef.current.z_position);
        }

        sketch.rotateX(rotX);
        sketch.rotateY(rotY);
        sketch.rotateZ(rotZ);

        if (!paramsRef.current.drawingTechnique) {
          sketch.translate(
            -((X_ROWS * X_SIZE) / 2) +
              X_SIZE / 2 -
              (X_GAP * X_ROWS) / 2 +
              X_GAP / 2,
            (Y_ROWS * Y_SIZE) / 2 -
              Y_SIZE / 2 +
              (Y_GAP * Y_ROWS) / 2 -
              Y_GAP / 2,
            (Z_ROWS * Z_SIZE) / 2 -
              Z_SIZE / 2 +
              (Z_GAP * Z_ROWS) / 2 -
              Z_GAP / 2,
          );
        }

        const speed = 2;
        const hit = 0.5;
        const cooldown = 0.9;
        if (!state.freeze) {
          // if (bass > smoothBass) {
          //   smoothBass += (bass - smoothBass) * attack;
          // } else {
          //   smoothBass *= decay;
          // }

          sc = sketch.sin(sketch.millis() * 0.002);
          sc = incrementerForAnimation * 0.002;
          if (isBeatActive) {
            if (incrementerForAnimation < 0.5) {
              incrementerForAnimation += bass * 0.2;
            }

            if (incrementerForAnimation > 0.7) {
              incrementerForAnimation *= cooldown;
            }

            // sc += smoothBass / 5;
          } else {
            if (incrementerForAnimation >= 0) {
              incrementerForAnimation *= cooldown;
            }

            //sc *= decay;
          }
          sc = incrementerForAnimation;
          //sc = incrementerForAnimation * 0.002;
          // if(sc < 0.01) {
          //   sc = 0;
          // }
        } else {
          //incrementerForAnimation += bass

          sc = sketch.sin(t * 3); // TO MA WPLYW NA ANIMACJE
          //sc = easeInOut(smoothBass);
          //sc = sketch.cos(t * 3);
        }

        // WYKURWISTA POWINNA ISC DO SHADER
        // 2. LEPSZA WERSJA (gradient + fade)
        // Możesz połączyć fade + gradient:
        // sketch.push();
        // sketch.resetMatrix();

        //   for (let i = 0; i < sketch.height; i += 4) {
        //     let inter = i / sketch.height;

        //     let c = sketch.lerpColor(
        //       sketch.color(5, 10, 30, 25),
        //       sketch.color(0, 0, 0, 25),
        //       inter
        //     );

        //     sketch.stroke(c);
        //     sketch.line(-sketch.width, i - sketch.height/2, sketch.width, i - sketch.height/2);
        //   }

        //   sketch.pop();
        // Koniec 2

        if (paramsRef.current.dynamicLight) {
          let t = sketch.millis() * 0.005;
          let r = 150 + 50 * sketch.sin(t);
          let g = 150 + 55 * sketch.sin(t + 2);
          let b = 255;
          //sketch.emissiveMaterial(r, g, b);
          //sketch.ambientMaterial(200);
          sketch.fill(r, g, b, paramsRef.current.opacity);
          //sketch.normalMaterial(r, g, b);
        } else {
          sketch.colorMode(sketch.HSB, 360, 100, 100, 1);

          // Przykład koloru Psytrance reagującego na bas
          let hue = sketch.map(smoothBass, 0, 1, 280, 360); // Przejście od fioletu do magenty
          sketch.fill(hue, 100, 100);
          sketch.stroke(hue, 80, 100);

          sketch.noStroke();
          // Kolor bazowy (neonowa zieleń)
          sketch.emissiveMaterial(110, 100, 100);
          sketch.box(X_SIZE, Y_SIZE, Z_SIZE);
        }

        function isVisible2(x, y, z) {
          const margin = 500; // dodatkowy margines dla widoczności
          return (
            x > -SCREEN_WIDTH / 2 - margin &&
            x < SCREEN_WIDTH / 2 + margin &&
            y > -SCREEN_HEIGHT / 2 - margin &&
            y < SCREEN_HEIGHT / 2 + margin &&
            z > -2000 &&
            z < 2000 // zakres renderu w głąb
          );
        }

        function isVisible(x, y, z) {
          // Musimy dodać z_position, bo cały cube jest przesunięty w głąb
          const finalZ = z + paramsRef.current.z_position;

          // Margines, żeby obiekty nie znikały "na styku" krawędzi ekranu
          const margin = 200;

          return (
            x > -sketch.width / 2 - margin &&
            x < sketch.width / 2 + margin &&
            y > -sketch.height / 2 - margin &&
            y < sketch.height / 2 + margin &&
            finalZ > -1000 &&
            finalZ < 700 // Zakres widoczności w osi Z
          );
        }

        // --- ZOPTYMALIZOWANA LOGIKA RYSOWANIA ŚCIAN ---
        // Wywołaj to wewnątrz draw() zamiast starej potrójnej pętli

        // CACHEING
        // CACHE!
        const curParams = paramsRef.current;
        const scVal = sc; // Cache Twojego incrementera // SC DO ANIMAJCJI

        const currentAnimateX = curParams.animate_x;
        const currentAnimateY = curParams.animate_y;
        const currentAnimateZ = curParams.animate_z;

        const halfX = (X_ROWS * X_SIZE + X_GAP * X_ROWS) / 2;
        const halfY = (Y_ROWS * Y_SIZE + Y_GAP * Y_ROWS) / 2;

        const sinX = [];
        const sinY = [];
        const sinZ = [];

        for (let x = 0; x < X_ROWS; x++) {
          sinX[x] = sketch.sin((x / (X_ROWS - 1)) * sketch.PI);
        }
        for (let y = 0; y < Y_ROWS; y++) {
          sinY[y] = sketch.sin((y / (Y_ROWS - 1)) * sketch.PI);
        }
        for (let z = 0; z < Z_ROWS; z++) {
          sinZ[z] = sketch.sin((z / (Z_ROWS - 1)) * sketch.PI);
        }

        const drawOptimizedWalls = () => {
          const stepX = X_SIZE + X_GAP;
          const stepY = Y_SIZE + Y_GAP;
          const stepZ = Z_SIZE + Z_GAP;

          const totalWidth = X_ROWS * stepX;
          const totalHeight = Y_ROWS * stepY;
          const totalDepth = Z_ROWS * stepZ;

          const musicData = bandsRef.current.current.data;
          const low = 85;
          const mid = 170;
          const high = 255;

          // Helper do rysowania pojedynczego boxa z opcjonalną animacją
          const renderBox = (
            animValue = 0,
            ax = 0,
            ay = 0,
            az = 0,
            x_size = X_SIZE,
            y_size = Y_SIZE,
            z_size = Z_SIZE,
          ) => {
            sketch.push();
            if (animValue !== 0) {
              sketch.translate(ax, ay, az);
            }
            sketch.box(x_size, y_size, z_size);
            sketch.pop();
          };

          // --- 1. FRONT & BACK (Płaszczyzna XY, stałe Z) ---
          // Pętla po X i Y
          for (let x = 0; x < X_ROWS; x++) {
            for (let y = 0; y < Y_ROWS; y++) {
              // 1. Normalizacja współrzędnych do zakresu -1 do 1
              let normX = sketch.map(x, 0, X_ROWS - 1, -1, 1);
              let normY = sketch.map(y, 0, Y_ROWS - 1, -1, 1);

              // 2. Obliczanie dystansu od środka (0,0)
              // Używamy sqrt(x^2 + y^2) dla efektu kołowego lub max(abs(x), abs(y)) dla kwadratowego
              let distFromCenter = sketch.sqrt(normX * normX + normY * normY);
              let finalDist = sketch.constrain(distFromCenter, 0, 1);

              // 3. Mapowanie na audio: krawędzie (dist ok. 1) -> Bass (low index)
              // Środek (dist ok. 0) -> High (wysoki index)
              let audioMapping = 1 - finalDist;
              let safeIndex = mid + Math.floor(audioMapping * low);

              // Pobieramy wartość z konkretnego pasma
              const freqMagnitude = musicData ? musicData[safeIndex] : 0;

              // FRONT (z = 0)
              if (isFrontWall(x, y, 0)) {
                const anim = paramsRef.current.animate_z
                  ? sketch.sq(sc * sinX[x] * sinY[y] * (freqMagnitude / 3))
                  : 0;

                sketch.push();
                sketch.translate(
                  -totalWidth / 2 + x * stepX + stepX / 2,
                  totalHeight / 2 - y * stepY - stepY / 2,
                  -totalDepth / 2 + stepZ / 2,
                );
                renderBox(anim, 0, 0, -anim);
                sketch.pop();
              }
              // BACK (z = Z_ROWS - 1)
              if (isBackWall(x, y, Z_ROWS - 1)) {
                const anim = paramsRef.current.animate_z
                  ? sketch.sq(sc * sinX[x] * sinY[y] * (freqMagnitude / 2))
                  : 0;
                sketch.push();
                sketch.translate(
                  -totalWidth / 2 + x * stepX + stepX / 2,
                  totalHeight / 2 - y * stepY - stepY / 2,
                  totalDepth / 2 - stepZ / 2,
                );
                renderBox(anim, 0, 0, anim);
                sketch.pop();
              }
            }
          }

          /*
           function setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, _x, _y, _z) {
        x_pos = X_SIZE * x + X_GAP * x + _x / 2;
        y_pos = -(Y_SIZE * y) - Y_GAP * y - _y / 2;
        z_pos = -(Z_SIZE * z) - Z_GAP * z + _z / 2; //* paramsRef.current.z_position; (wykurwisty param ale psuje)
        z_pos += z_pos * paramsRef.current.Crazy_z_position;
        }*/

          //console.log('bandsRef', bandsRef.current);
          //console.log('bandsRef', bandsRef);
          //console.log('musicData', musicData);
          // --- 2. LEFT & RIGHT (Płaszczyzna YZ, stałe X) ---
          // Pętla po Y i Z
          for (let y = 0; y < Y_ROWS; y++) {
            for (let z = 0; z < Z_ROWS; z++) {
              // 1. Mapujemy y i z na zakres od -1 do 1, gdzie 0 to środek
              let normY = sketch.map(y, 0, Y_ROWS - 1, -1, 1);
              let normZ = sketch.map(z, 0, Z_ROWS - 1, -1, 1);

              // 2. Obliczamy odległość od środka (0,0) używając twierdzenia Pitagorasa
              // dist będzie w zakresie od 0 (środek) do ok. 1.41 (narożniki)
              let distFromCenter = sketch.sqrt(normY * normY + normZ * normZ);

              // 3. Odwracamy to: chcemy, żeby krawędzie (duży dist) miały mały indeks (Bass)
              // a środek (mały dist) miał wysoki indeks (High)
              // Ograniczamy dist do 1.0, żeby nie wyjść poza zakres tablicy danych
              let finalDist = sketch.constrain(distFromCenter, 0, 1);

              // Inwersja: 1 - finalDist sprawi, że krawędzie = 0 (low), środek = 1 (high)
              let audioMapping = 1 - finalDist;

              // Wybieramy index z dostępnego pasma (np. do 255)
              let safeIndex = Math.floor(audioMapping * low);

              const anim = paramsRef.current.animate_x
                ? sketch.sq(
                    sc *
                      sinZ[z] *
                      sinY[y] *
                      (musicData ? musicData[safeIndex] / 6 : 1),
                  )
                : 0;
              //console.log(musicData[Math.ceil(255 / y + 1)]);
              // LEFT (x = 0)
              const posY = totalHeight / 2 - y * stepY - stepY / 2;
              let posZ = -totalDepth / 2 + z * stepZ + stepZ / 2;
              //posZ -= posZ * paramsRef.current.Crazy_z_position;

              // LEFT
              if (isLeftWall(0, y, z)) {
                const posX = -totalWidth / 2 + stepX / 2;
                if (isVisible(posX, posY, posZ)) {
                  // <--- SPRAWDZANIE // UWGLEDNIJ SIZE JESZCZE

                  sketch.push();
                  sketch.translate(posX, posY, posZ);
                  renderBox(anim, -anim, 0, 0, X_SIZE + anim);
                  sketch.pop();
                }
              }
              // RIGHT
              if (isRightWall(X_ROWS - 1, y, z)) {
                const posX = totalWidth / 2 - stepX / 2;
                if (isVisible(posX, posY, posZ)) {
                  // <--- SPRAWDZANIE
                  sketch.push();
                  sketch.translate(posX, posY, posZ);
                  renderBox(anim, anim, 0, 0, X_SIZE + anim);
                  sketch.pop();
                }
              }
            }
          }

          // --- 3. TOP & BOTTOM (Płaszczyzna XZ, stałe Y) ---
          // Pętla po X i Z
          for (let x = 0; x < X_ROWS; x++) {
            for (let z = 0; z < Z_ROWS; z++) {
              let normX = sketch.map(x, 0, X_ROWS - 1, -1, 1);
              let normZ = sketch.map(z, 0, Z_ROWS - 1, -1, 1);
              let dist = sketch.sqrt(normX * normX + normZ * normZ);
              let safeIndex = low + Math.floor((1 - dist) * low);
              const anim = paramsRef.current.animate_y
                ? sketch.sq(
                    sc *
                      sinZ[z] *
                      sinX[x] *
                      (musicData ? musicData[safeIndex] / 8 : 1),
                  )
                : 0;

              const posX = -totalWidth / 2 + x * stepX + stepX / 2;
              const posZ = -totalDepth / 2 + z * stepZ + stepZ / 2;

              // TOP
              if (isTopWall(x, 0, z)) {
                const posY = totalHeight / 2 - stepY / 2;
                if (isVisible(posX, posY, posZ)) {
                  sketch.push();
                  sketch.translate(posX, posY, posZ);
                  renderBox(anim, 0, anim, 0);
                  sketch.pop();
                }
              }
              // BOTTOM
              if (isBottomWall(x, Y_ROWS - 1, z)) {
                const posY = -totalHeight / 2 + stepY / 2;
                if (isVisible(posX, posY, posZ)) {
                  sketch.push();
                  sketch.translate(posX, posY, posZ);
                  renderBox(anim, 0, -anim, 0);
                  sketch.pop();
                }
              }
            }
          }
        };

        //sketch.blendMode(sketch.BLEND);
        const drawCube = () => {
          const stepX = X_SIZE + X_GAP;
          const stepY = Y_SIZE + Y_GAP;
          const stepZ = Z_SIZE + Z_GAP;

          let startX, startZ, startY, baseX, baseZ, baseY;
          // FRON
          sketch.push();

          startX = -((X_ROWS * stepX) / 2);
          startY = (Y_ROWS * stepY) / 2;
          baseZ = -((Z_ROWS - 1) * stepZ) / 2;

          sketch.translate(startX, startY, baseZ);

          for (let x = 0; x < X_ROWS; x++) {
            let offsetY = 0;

            for (let y = 0; y < Y_ROWS; y++) {
              if (isFrontWall(x, y, 0)) {
                const anim = sketch.sq(scVal * sinX[x] * sinY[y] * 20);
                let _z = paramsRef.current.animate_z ? anim + 10 : 0;

                sketch.translate(0, -offsetY, _z);
                sketch.box(X_SIZE, Y_SIZE, Z_SIZE);
                sketch.translate(0, offsetY, -_z);
              }

              offsetY += stepY;
            }

            sketch.translate(stepX, 0, 0);
          }

          sketch.pop();
          // BACK
          sketch.push();

          startX = -((X_ROWS * stepX) / 2);
          startY = (Y_ROWS * stepY) / 2;
          baseZ = -((Z_ROWS - 1) * stepZ) - ((Z_ROWS - 1) * stepZ) / 2;

          sketch.translate(startX, startY, baseZ);

          for (let x = 0; x < X_ROWS; x++) {
            let offsetY = 0;

            for (let y = 0; y < Y_ROWS; y++) {
              if (isBackWall(x, y, Z_ROWS - 1)) {
                const anim = sketch.sq(scVal * sinX[x] * sinY[y] * 20);
                let _z = paramsRef.current.animate_z ? anim : 0;

                sketch.translate(0, -offsetY, -_z);
                sketch.box(X_SIZE, Y_SIZE, -Z_SIZE);
                sketch.translate(0, offsetY, _z);
              }

              offsetY += stepY;
            }

            sketch.translate(stepX, 0, 0);
          }

          sketch.pop();
          // LEFT
          sketch.push();

          startY = (Y_ROWS * stepY) / 2;
          startZ = -((Z_ROWS * stepZ) / 2);

          sketch.translate(-(X_ROWS * X_SIZE) / 2, startY, startZ);

          for (let y = 0; y < Y_ROWS; y++) {
            let offsetZ = 0;

            for (let z = 0; z < Z_ROWS; z++) {
              if (isLeftWall(0, y, z)) {
                const anim = sketch.sq(
                  scVal * sinZ[z] * sinY[y] * (bassAnim * 500),
                );
                let _x = paramsRef.current.animate_x ? anim : 0;

                sketch.translate(-_x, -y * stepY, -offsetZ);
                sketch.box(-X_SIZE, Y_SIZE, Z_SIZE);
                sketch.translate(_x, y * stepY, offsetZ);
              }

              offsetZ += stepZ;
            }
          }

          sketch.pop();
          // RIGHT
          sketch.push();

          startY = (Y_ROWS * stepY) / 2;
          startZ = -((Z_ROWS * stepZ) / 2);
          baseX = ((X_ROWS - 1) * stepX) / 2;

          sketch.translate(baseX, startY, startZ);

          for (let y = 0; y < Y_ROWS; y++) {
            let offsetZ = 0;

            for (let z = 0; z < Z_ROWS; z++) {
              if (isRightWall(X_ROWS - 1, y, z)) {
                const anim = sketch.sq(
                  scVal * sinZ[z] * sinY[y] * (bassAnim * 500),
                );
                let _x = paramsRef.current.animate_x ? anim : 0;

                sketch.translate(_x, -y * stepY, -offsetZ);
                sketch.box(-X_SIZE, Y_SIZE, Z_SIZE);
                sketch.translate(-_x, y * stepY, offsetZ);
              }

              offsetZ += stepZ;
            }
          }

          sketch.pop();
          // TOP
          sketch.push();

          startX = -((X_ROWS * stepX) / 2);
          startZ = -((Z_ROWS * stepZ) / 2);
          startY = -(Y_ROWS * stepY - (Y_ROWS * stepY) / 2);

          sketch.translate(startX, startY, startZ);

          for (let x = 0; x < X_ROWS; x++) {
            let offsetZ = 0;

            for (let z = 0; z < Z_ROWS; z++) {
              if (isTopWall(x, 0, z)) {
                const anim = sketch.sq(
                  scVal * sinZ[z] * sinX[x] * (bassAnim * 400),
                );
                let _y = paramsRef.current.animate_y ? anim : 0;

                sketch.translate(x * stepX, -_y, -offsetZ);
                sketch.box(X_SIZE, Y_SIZE, Z_SIZE);
                sketch.translate(-x * stepX, _y, offsetZ);
              }

              offsetZ += stepZ;
            }
          }
          sketch.pop();

          // BOTTOM (y = max)
          sketch.push();

          startX = -((X_ROWS * stepX) / 2);
          startZ = -((Z_ROWS * stepZ) / 2);
          baseY = Y_ROWS * stepY - (Y_ROWS * stepY) / 2;

          sketch.translate(startX, baseY, startZ);

          for (let x = 0; x < X_ROWS; x++) {
            let offsetZ = 0;

            for (let z = 0; z < Z_ROWS; z++) {
              if (isBottomWall(x, Y_ROWS - 1, z)) {
                const anim = sketch.sq(
                  scVal * sinZ[z] * sinX[x] * (bassAnim * 400),
                );
                let _y = paramsRef.current.animate_y ? anim : 0;

                sketch.translate(x * stepX, _y, -offsetZ);
                sketch.box(X_SIZE, Y_SIZE, Z_SIZE);
                sketch.translate(-x * stepX, -_y, offsetZ);
              }

              offsetZ += stepZ;
            }
          }

          sketch.pop();
        };

        const drawCure2 = () => {
          // 1. FRONT & BACK (Stałe Z)
          for (let x = 0; x < X_ROWS; x++) {
            for (let y = 0; y < Y_ROWS; y++) {
              // Wspólna animacja dla tych ścian
              const anim = sketch.sq(scVal * sinX[x] * sinY[y] * 20);
              // FRONT (z = 0)
              if (isFrontWall(x, y, 0)) {
                let _z = currentAnimateZ ? anim + 10 : 0;
                setPos(x, y, 0, X_GAP, Y_GAP, Z_GAP, 0, 0, _z);
                drawBox(x_pos, y_pos, z_pos, X_SIZE, Y_SIZE, Z_SIZE, 0, 0, _z);
              }
              // BACK (z = Z_ROWS - 1)
              //   if (isBackWall(x, y, Z_ROWS - 1)) {
              //     let _z = currentAnimateZ ? anim : 0;
              //     setPos(x, y, Z_ROWS - 1, X_GAP, Y_GAP, Z_GAP, 0, 0, -_z);
              //     drawBox(
              //       x_pos,
              //       y_pos,
              //       z_pos,
              //       X_SIZE,
              //       Y_SIZE,
              //       -Z_SIZE,
              //       0,
              //       0,
              //       -_z,
              //     );
              //   }
            }
          }

          // 2. LEFT & RIGHT (Stałe X)
          for (let y = 0; y < Y_ROWS; y++) {
            for (let z = 0; z < Z_ROWS; z++) {
              //const anim = sketch.sq(scVal * sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) * sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) * (bassAnim * 500));
              const anim = sketch.sq(
                scVal * sinZ[z] * sinY[y] * bassAnim * 500,
              );

              // LEFT (x = 0)
              if (isLeftWall(0, y, z)) {
                let _x = currentAnimateX ? anim : 0;
                setPos(0, y, z, X_GAP, Y_GAP, Z_GAP, -_x, 0, 0);
                if (isVisible(x_pos, y_pos, z_pos)) {
                  drawBox(
                    x_pos - scVal * _x * 2,
                    y_pos,
                    z_pos,
                    -X_SIZE,
                    Y_SIZE,
                    Z_SIZE,
                    -_x,
                    0,
                    0,
                  );
                }
              }

              // RIGHT (x = X_ROWS - 1)
              if (isRightWall(X_ROWS - 1, y, z)) {
                let _x = currentAnimateX ? anim : 0;
                setPos(X_ROWS - 1, y, z, X_GAP, Y_GAP, Z_GAP, _x, 0, 0);
                if (isVisible(x_pos, y_pos, z_pos)) {
                  drawBox(
                    x_pos + scVal * _x * 2,
                    y_pos,
                    z_pos,
                    -X_SIZE,
                    Y_SIZE,
                    Z_SIZE,
                    -_x,
                    0,
                    0,
                  );
                }
              }
            }
          }

          // // 3. TOP & BOTTOM (Stałe Y)
          for (let x = 0; x < X_ROWS; x++) {
            for (let z = 0; z < Z_ROWS; z++) {
              //const anim = sketch.sq(scVal * sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) * sketch.sin((x / (X_ROWS - 1)) * sketch.PI) * bassAnim * 400);
              const anim = sketch.sq(
                scVal * sinX[x] * sinZ[z] * bassAnim * 500,
              );

              // TOP (y = 0)
              if (isTopWall(x, 0, z)) {
                let _y = currentAnimateY ? anim : 0;
                setPos(x, 0, z, X_GAP, Y_GAP, Z_GAP, 0, -_y, 0);
                if (isVisible(x_pos, y_pos, z_pos)) {
                  drawBox(
                    x_pos,
                    y_pos + scVal * _y,
                    z_pos,
                    X_SIZE,
                    Y_SIZE,
                    Z_SIZE,
                    0,
                    -_y,
                    0,
                  );
                }
              }

              // BOTTOM (y = Y_ROWS - 1)
              if (isBottomWall(x, Y_ROWS - 1, z)) {
                let _y = currentAnimateY ? anim : 0;
                setPos(x, Y_ROWS - 1, z, X_GAP, Y_GAP, Z_GAP, 0, _y, 0);
                if (isVisible(x_pos, y_pos, z_pos)) {
                  drawBox(
                    x_pos,
                    y_pos - scVal * _y,
                    z_pos,
                    X_SIZE,
                    Y_SIZE,
                    Z_SIZE,
                    0,
                    -_y,
                    0,
                  );
                }
              }
            }
          }
        };

        //drawCure2();
        //drawCube();
        if (paramsRef.current.drawingTechnique) {
          drawOptimizedWalls();
        } else {
          drawCure2();
        }
      };

      function isFrontWall(x, y, z) {
        return z == 0 && y != 0 && y != Y_ROWS - 1 && x != 0 && x != X_ROWS - 1;
      }

      function isBackWall(x, y, z) {
        return (
          z == Z_ROWS - 1 &&
          y != 0 &&
          y != Y_ROWS - 1 &&
          x != 0 &&
          x != X_ROWS - 1
        );
      }

      function isTopWall(x, y, z) {
        return y == 0 && z != 0 && z != Z_ROWS - 1 && x != 0 && x != X_ROWS - 1;
      }

      function isBottomWall(x, y, z) {
        return (
          y == Y_ROWS - 1 &&
          z != 0 &&
          z != Z_ROWS - 1 &&
          x != 0 &&
          x != X_ROWS - 1
        );
      }

      function isLeftWall(x, y, z) {
        return x == 0 && y != 0 && y != Y_ROWS - 1 && z != 0 && z != Z_ROWS - 1;
      }

      function isRightWall(x, y, z) {
        return (
          x == X_ROWS - 1 &&
          y != 0 &&
          y != Y_ROWS - 1 &&
          z != 0 &&
          z != Z_ROWS - 1
        );
      }

      function setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, _x, _y, _z) {
        x_pos = X_SIZE * x + X_GAP * x + _x / 2;
        y_pos = -(Y_SIZE * y) - Y_GAP * y - _y / 2;
        z_pos = -(Z_SIZE * z) - Z_GAP * z + _z / 2; //* paramsRef.current.z_position; (wykurwisty param ale psuje)
        z_pos += z_pos * paramsRef.current.Crazy_z_position;
      }

      function drawBox(
        x_pos,
        y_pos,
        z_pos,
        X_SIZE,
        Y_SIZE,
        Z_SIZE,
        _x,
        _y,
        _z,
      ) {
        sketch.push();
        sketch.translate(x_pos, y_pos, z_pos);
        //sketch.resetMatrix();
        //sketch.translate(x_pos, y_pos, z_pos);
        sketch.box(X_SIZE + _x, Y_SIZE - _y, Z_SIZE + _z);
        sketch.pop();
      }

      function drawBox2(
        x_pos,
        y_pos,
        z_pos,
        X_SIZE,
        Y_SIZE,
        Z_SIZE,
        _x,
        _y,
        _z,
      ) {
        sketch.push();
        sketch.translate(x_pos, y_pos, z_pos);

        // Dynamiczne skalowanie na podstawie parametrów i audio
        let sX = Math.max(1, X_SIZE + _x);
        let sY = Math.max(1, Y_SIZE - _y);
        let sZ = Math.max(1, Z_SIZE + _z);

        sketch.scale(sX, sY, sZ);

        // Rysowanie modelu (jeśli createModel zadziałał, boxModel nie jest pusty)
        if (boxModel) {
          sketch.model(boxModel);
        } else {
          // Fallback w razie problemów z modelem
          sketch.box(1);
        }

        sketch.pop();
      }
    },
  },
};

// --- Controls Panel ---
function Controls({ config, values, setValues }) {
  return (
    <div className="controls-panel">
      <div className="p-4 border-l border-gray-700">
        <h2 className="text-lg mb-2">Controls</h2>
        {Object.entries(config).map(([key, conf]) => {
          if (conf.type === 'range') {
            return (
              // <div key={key} className={"mb-3 slider-container"}>
              //   <label className={"slider-label"}>{key}: {values[key]}</label>
              //   <input
              //     type="range"
              //     min={conf.min}
              //     max={conf.max}
              //     value={values[key]}
              //     onChange={(e) =>
              //       setValues({ ...values, [key]: Number(e.target.value) })
              //     }
              //   />
              // </div>
              <div key={key} className="control">
                <div className="label-row">
                  <span className="slider-label">{key}</span>
                  <span className="slider-value">{values[key]}</span>
                </div>
                <input
                  className="futuristic-slider"
                  type="range"
                  min={conf.min}
                  max={conf.max}
                  value={values[key]}
                  onChange={(e) =>
                    setValues({ ...values, [key]: Number(e.target.value) })
                  }
                />
              </div>
            );
          }

          if (conf.type === 'checkbox') {
            return (
              <div key={key} className="mb-3">
                <label>
                  <input
                    type="checkbox"
                    checked={values[key]}
                    onChange={(e) =>
                      setValues({ ...values, [key]: e.target.checked })
                    }
                  />
                  {key}
                </label>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function DebugOverlay({ params, bands, debug }) {
  return (
    <div style={{ position: 'absolute', top: 100, left: 30 }}>
      <div>REC: {String(debug.isRecording)}</div>
      <div>PLAY: {String(debug.isPlaying)}</div>
      <div>frames: {debug.frames}</div>
      <div>time: {debug.time?.toFixed(2)}</div>
      <div>BASS: {bands.current.bass}</div>
      <div>MID: {bands.current.mid}</div>
      <div>smoothBass: {debug.smoothBass}</div>
      <div>incrementerForAnimation: {debug.incrementerForAnimation}</div>

      <div style={{ color: debug.FPS >= 50 ? 'green' : 'red' }}>
        FPS: {debug.FPS}
      </div>
      <div></div>
    </div>
  );
}

function SketchView({
  sketchConfig,
  params,
  bands,
  onDebug,
  screenWidth,
  screenHeigh,
  setValues,
}) {
  const containerRef = useRef();
  const p5Instance = useRef(null);
  const paramsRef = useRef(params);
  const bandsRef = useRef(bands);

  // 🔁 aktualizuj tylko dane (bez restartu)
  useEffect(() => {
    paramsRef.current = params;
    bandsRef.current = bands;
  }, [params, bands]);

  // 🧠 twórz p5 tylko raz (lub przy zmianie sketch)
  useEffect(() => {
    if (p5Instance.current) {
      p5Instance.current.remove();
    }

    const sketch = (p) => {
      // preload od razu przy inicjalizacji
      // p.preload = () => {
      //myShader = p.loadShader('./shader/shader.vert', './shader/shader.frag');
      // };

      // p.setup = () => {
      //   p.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT, p.WEBGL);
      // };

      // p.draw = () => {
      //   if (!myShader) return; // zabezpieczenie jeśli shader się jeszcze nie załadował
      //   p.shader(myShader);
      //   p.rect(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT);
      // };
      sketchConfig.sketch(
        p,
        paramsRef,
        bandsRef,
        onDebug,
        screenWidth,
        screenHeigh,
      ); // 👈 przekazujemy REF, nie state
    };

    p5Instance.current = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.current?.remove();
      p5Instance.current = null;
    };
  }, [sketchConfig]); // ❗ brak params

  //return <div ref={containerRef} />;
  return (
    <div className="relative">
      {/* 🎨 Canvas */}
      <div ref={containerRef} />
      <div className="controls2">
        <Controls
          config={sketchConfig.controls}
          values={params}
          setValues={setValues}
        />
      </div>
      {/* <div class="test">
          {"ELO ELO "}
        </div> */}
      {/* <div className="controls_dupa">

      </div> */}
      {/* 🧾 DEBUG OVERLAY */}
      {/* <DebugOverlay params={params} bands={bands} /> */}
    </div>
  );
}

// --- Sidebar ---
function Sidebar({ sketches, current, setCurrent }) {
  return (
    <div className="w-64 border-l border-gray-700 p-4">
      <h2 className="text-lg mb-2">Sketches</h2>
      {Object.keys(sketches).map((key) => (
        <div
          key={key}
          className={`cursor-pointer p-2 ${current === key ? 'bg-gray-700' : ''}`}
          onClick={() => setCurrent(key)}
        >
          {sketches[key].name}
        </div>
      ))}
    </div>
  );
}

import { useKeyPress } from './handlers/useKeyPress';
import { useAudioSystem } from './hooks/useAudioSystem';

// --- Main App ---
export default function App() {
  // FOR TRACKING RECORDING
  const [debug, setDebug] = useState({});

  // const { playKick, playSnare, bandsRef } = useAudioSystem();

  // useKeyPress('Space', playKick);
  // useKeyPress('KeyS', playSnare);

  const bandsRef = useRef({
    bass: 0,
    mid: 0,
    high: 0,
    data: new Array(256).fill(0),
  });

  useAudioReactiveRealTime(bandsRef);

  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // navigator.mediaDevices.enumerateDevices().then((devices) => {
  //   devices.forEach((d) => {
  //     //if (d.kind === 'audioinput') {
  //     //console.log('AUDIO', d.label, d.deviceId);
  //     // }
  //   });
  // });

  //useAudioReactive();

  // const containerRef = useRef(null);
  // const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      //console.log('ON LOAD, rec.width:', rect.width);
      setSize({
        width: rect.width,
        height: rect.height,
      });
      setIsLoaded(true);
    };

    updateSize(); // initial

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    let raf;

    function updateAudio() {
      if (!analyserRef.current) {
        raf = requestAnimationFrame(updateAudio);
        return;
      }

      //console.log('UPDATE AUDIO');
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const data = dataArrayRef.current;

      // 🎧 PODZIAŁ PASM
      let bass = 0;
      let mid = 0;
      let high = 0;

      const len = data.length;
      //console.log('LENGTH', len);

      for (let i = 0; i < len; i++) {
        const v = data[i] / 255;

        if (i < len * 0.1) bass += v;
        else if (i < len * 0.4) mid += v;
        else high += v;
      }

      bass /= len * 0.1;
      mid /= len * 0.3;
      high /= len * 0.6;

      // 🔥 SMOOTH (ważne żeby nie skakało)
      const smooth = (prev, next, factor = 0.2) =>
        prev + (next - prev) * factor;

      const current = bandsRef.current;

      bandsRef.current = {
        bass: smooth(current?.bass || 0, bass),
        mid: smooth(current?.mid || 0, mid),
        high: smooth(current?.high || 0, high),
        data,
      };

      // console.log('bass:: ', bandsRef.current.bass);
      raf = requestAnimationFrame(updateAudio);
    }

    updateAudio();

    return () => cancelAnimationFrame(raf);
  }, []);

  const [currentSketch, setCurrentSketch] = useState('dupa');
  const sketchConfig = sketches[currentSketch];

  // console.log("bandsRef", bandsRef)

  const initialValues = Object.fromEntries(
    Object.entries(sketchConfig.controls).map(([k, v]) => [k, v.default]),
  );

  const [params, setParams] = useState(initialValues);

  /*********************************
    JSON loaded to PARAMS
  */
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // const parsed = JSON.parse(e.target.result);

        const parsed = JSON.parse(e.target.result);

        // 🎬 jeśli to animacja (array keyframes)
        if (Array.isArray(parsed)) {
          console.log('Wczytano ANIMACJĘ');

          if (window.__setKeyframes) {
            window.__setKeyframes(parsed);
          }

          return;
        }

        console.log('Wczytany JSON:', parsed);

        // 🔥 ważne: merge żeby nie wywalić brakujących pól
        setParams((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (err) {
        console.error('Błąd parsowania JSON:', err);
        alert('Nieprawidłowy plik JSON');
      }
    };

    reader.readAsText(file);
  }

  /*********************************
    PARAMS saved to JSON
  */
  function downloadJSON(data, fileName) {
    console.log('downolad JSON', 'params: ', data);
    // 1. Tworzymy Blob (Binary Large Object) z naszymi danymi
    const blob = new Blob([data], { type: 'application/json' });

    // 2. Tworzymy tymczasowy adres URL dla tego Bloba
    const url = URL.createObjectURL(blob);

    // 3. Tworzymy niewidoczny element <a>
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName; // Nazwa pliku, który zostanie pobrany

    // 4. Symulujemy kliknięcie i usuwamy link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. Zwalniamy pamięć
    URL.revokeObjectURL(url);
  }

  const debugText = window._debug || {};
  //console.log("debugText", debugText)
  //console.log("obj ", Object.entries(debugText));
  // const getWidth = () => {
  //    const el = document.getElementsByClassName("canvas-container")[0];
  //   const style = window.getComputedStyle(el);
  //   console.log("Width:", style.width);
  //   return style.width;
  // }
  // const getHeight = () => {
  //   const el = document.getElementsByClassName("canvas-container")[0];
  //   const style = window.getComputedStyle(el);
  //   console.log("height:", style.height);
  //   return style.height;
  // }

  //console.log("calling SketchView with size width", size.width, "size height", size.height)

  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  let lastKickTime = 0;

  function handleAudioUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const audio = new Audio(URL.createObjectURL(file));
    // audio.crossOrigin = "anonymous";
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();

    analyser.fftSize = 512;

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    audioRef.current = audio;
  }

  function playAudio() {
    if (!audioRef.current) return;

    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    audioRef.current.play();
  }

  return (
    <div className="app" ref={containerRef}>
      {/* Left: Canvas */}
      {size.width > 0 && size.height > 0 && (
        <div className="canvas-container">
          <SketchView
            sketchConfig={sketchConfig}
            bands={bandsRef}
            params={params}
            name={sketchConfig.name}
            onDebug={setDebug}
            screenWidth={size.width}
            screenHeigh={size.height}
            setValues={setParams}
          />
          {/* <div className="controls2">
          <Controls config={sketchConfig.controls} values={params} setValues={setParams} />
        </div> */}
          <DebugOverlay params={params} bands={bandsRef} debug={debug} />
        </div>
      )}
      <div>
        <button
          onClick={() => {
            console.log('params', params);
            downloadJSON(JSON.stringify(params), 'some_bad_ass_file.json');
          }}
        >
          {'SAVE SETTINGS'}
        </button>
        <br />
        <button
          onClick={() => {
            console.log('KEYFRAMES:', window.__keyframes);
            downloadJSON(JSON.stringify(window.__keyframes), 'animation.json');
          }}
        >
          SAVE ANIMATION
        </button>
        <br />
        <input
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
        />
        <p>{'status: '}</p>
        <input type="file" accept="audio/*" onChange={handleAudioUpload} />
        <button onClick={playAudio}>PLAY</button>
      </div>
      {/* Right: Controls + List */}
      <div className="panel">
        <div className="sidebar">
          <Sidebar
            sketches={sketches}
            current={currentSketch}
            setCurrent={setCurrentSketch}
          />
        </div>
      </div>
    </div>
  );
}
