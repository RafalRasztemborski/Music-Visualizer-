import React, { useState, useRef, useEffect } from 'react';
import p5 from 'p5';
import { useAudioReactive } from './hooks/useAudioReactive';

// --- Example Sketches ---
const sketches = {
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

      stroke: { type: 'range', min: 1, max: 100, default: 5 },

      rotationSpped: { type: 'range', min: 1, max: 1000, default: 20 },

      bg_fadeOut: { type: 'range', min: 0, max: 100, default: 80 },

      dynamicLight: { type: 'checkbox', default: true },

      z_position: { type: 'range', min: -130, max: 2000, default: 0 },
      Crazy_z_position: { type: 'range', min: -50, max: 50, default: 0 },

      animate_x: { type: 'checkbox', default: true },
      animate_y: { type: 'checkbox', default: true },
      animate_z: { type: 'checkbox', default: true },

      freeze: { type: 'checkbox', default: false },
      transitionDuraion: { type: 'range', min: 0, max: 100, default: 0 },

      colorR: { type: 'range', min: 0, max: 255, default: 0 },
      colorG: { type: 'range', min: 0, max: 255, default: 255 },
      colorB: { type: 'range', min: 0, max: 255, default: 200 },
      opacity: { type: 'range', min: 0, max: 255, default: 255 },

      light_1: { type: 'range', min: 0, max: 255, default: 0 },
      light_2: { type: 'range', min: 0, max: 255, default: 255 },
      light_3: { type: 'range', min: 0, max: 255, default: 255 },
      light_4: { type: 'range', min: -10, max: 10, default: -0.5 },
      light_5: { type: 'range', min: -10, max: 10, default: 0.5 },
      light_6: { type: 'range', min: -10, max: 10, default: -1 },
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
      let sc = 0;
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

      sketch.setup = function () {
        sketch.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT, sketch.WEBGL);
        sketch.canvas.setAttribute('tabindex', '0');
        sketch.canvas.focus();

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

        // Background that stays from last pring
        // for (let i = 0; i < sketch.height; i++) {
        //   let inter = i / sketch.height;
        //   let c = sketch.lerpColor(
        //     sketch.color(5, 10, 30),
        //     sketch.color(0, 0, 0),
        //     inter
        //   );
        //   sketch.stroke(c);
        //   sketch.line(-sketch.width, i - sketch.height/2, sketch.width, i - sketch.height/2);
        // }
      };

      let fpsHistory = [];
      sketch.draw = function () {
        // Nie dziala wtedy BG overlay
        // DISPLAY FPS
        //  if (font) {
        //     let currentFPS = sketch.frameRate();

        //     fpsHistory.push(currentFPS);
        //     if (fpsHistory.length > 30) fpsHistory.shift();

        //     let avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;

        //     sketch.background(25);
        //     sketch.push();
        //     sketch.resetMatrix();
        //     sketch.translate(-sketch.width / 2, -sketch.height / 2);

        //     sketch.fill(255);
        //     sketch.noStroke();
        //     sketch.textSize(24);

        //     sketch.text("FPS: " + avgFPS.toFixed(1), 50, 50);

        //     sketch.pop();

        //  }
        // EXPONANTIAL SMOOTHING FPS
        //let smoothFPS = 60; // start
        // if (font) {
        //     sketch.background(25);
        //  // 🔹 FPS (na początku)
        //     let currentFPS = sketch.frameRate();
        //     smoothFPS = smoothFPS * 0.9 + currentFPS * 0.1;

        //     // 🔹 TRAIL (zamiast background)
        sketch.push();
        sketch.resetMatrix();
        sketch.translate(-sketch.width / 2, -sketch.height / 2);

        sketch.noStroke();
        sketch.fill(25, 25, 25, state.bg_fadeOut);
        sketch.rect(0, 0, sketch.width, sketch.height);

        sketch.pop();

        //     // TRAIL PRO
        // let passes = 3; // ilość "klatek rozmycia"
        // let fade = state.bg_fadeOut / passes;

        // for (let i = 0; i < passes; i++) {
        //   sketch.push();
        //   sketch.resetMatrix();
        //   sketch.translate(-sketch.width / 2, -sketch.height / 2);

        //   sketch.noStroke();
        //   sketch.fill(25, 25, 25, fade);
        //   sketch.rect(0, 0, sketch.width, sketch.height);

        //   sketch.pop();
        // }

        //     // 🔹 UI (na końcu)
        //     sketch.push();
        //     sketch.resetMatrix();
        //     sketch.translate(-sketch.width / 2, -sketch.height / 2);

        //     sketch.fill(255);
        //     sketch.noStroke();
        //     sketch.textSize(24);

        //     sketch.text("FPS: " + smoothFPS.toFixed(1), 50, 50);

        //     sketch.pop();

        // }

        //       if (font) {
        //         // TRAIL
        //         // sketch.push();
        //         // sketch.resetMatrix();
        //         // sketch.translate(-sketch.width / 2, -sketch.height / 2);

        //         // sketch.noStroke();
        //         // sketch.fill(25, 25, 25, 40);
        //         // sketch.rect(0, 0, sketch.width, sketch.height);

        //         // sketch.pop();

        //         // FPS TEXT
        //         sketch.push();
        //         sketch.resetMatrix();
        //         sketch.translate(-sketch.width / 2, -sketch.height / 2);

        //         sketch.fill(255);
        //         sketch.noStroke();
        //         sketch.textSize(24);

        //         sketch.text("FPS: " + smoothFPS.toFixed(1), 50, 50);

        //         sketch.pop();
        // }

        // 🔥 wykryj zmianę params (slider / JSON)
        let hasChanged = false;

        //sketch.background(25);

        let currentFPS = sketch.frameRate();
        fpsHistory.push(currentFPS);
        if (fpsHistory.length > 30) fpsHistory.shift();
        let avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;

        // DEBUGING
        onDebug({
          isRecording,
          isPlaying,
          frames: keyframes.length,
          time: playhead,
          FPS: avgFPS.toFixed(1),
        });

        for (let key in paramsRef.current) {
          if (paramsRef.current[key] !== target[key]) {
            hasChanged = true;
            break;
          }
        }

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

        // RECORDING
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

        // Podlaczenie do audio
        const { bass, mid, high } = bandsRef.current.current;

        X_SIZE = state.X_SIZE;
        Y_SIZE = state.Y_SIZE + parseInt(mid * 50);
        Z_SIZE = state.Z_SIZE; //* (bass )

        //X_ROWS = state.X_ROWS + parseInt(kick * 5);

        //X_ROWS = bass === 0 ? state.X_ROWS : (state.X_ROWS + 1) * (1 + bass * 5);
        //Y_ROWS = state.Y_ROWS;
        X_ROWS = state.X_ROWS;
        Y_ROWS = state.Y_ROWS + parseInt(mid * 10);
        //Y_ROWS = state.Y_ROWS + parseInt(snare * 7);
        //Z_ROWS = state.Z_ROWS  + parseInt(high * 10)
        Z_ROWS = state.Z_ROWS;

        X_GAP = state.X_GAP + parseInt(bass * 120);
        Y_GAP = state.Y_GAP + parseInt(mid * 50);
        Z_GAP = state.Z_GAP;

        // 1. NAJPROSTSZY EFEKT (fade trail)
        //Zamień background na:
        //   sketch.push();
        //   sketch.resetMatrix(); // ważne przy WEBGL

        //   sketch.noStroke();
        //   sketch.stroke(59);
        //   sketch.background(25);
        //   sketch.fill(25, 10, 30, state.bg_fadeOut); // ostatni parametr = szybkość zanikania
        //   sketch.rect(sketch.width/2, -sketch.height/2, sketch.width, sketch.height);
        //   sketch.rect(0,0, sketch.width, sketch.height);
        // sketch.pop();

        // koniec 1

        // sketch.background(16, 25, 110);
        // sketch.background(5, 10, 30); // ciemny granat

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

        //debugger;
        // let col = sketch.color(100, sketch.mouseY, 255, 255);
        // let col = sketch.color(
        //   paramsRef.current.colorR,
        //   paramsRef.current.colorG,
        //   paramsRef.current.colorB,
        //   paramsRef.current.opacity
        // );

        let col = sketch.color(255, 0, 180, state.opacity);

        // sketch.ambientLight(40, 0, 60);
        // sketch.directionalLight(0, 255, 255, -1, 0, -1);

        // 6. Cyberpunk preset (róż + niebieski)
        // background(10, 0, 20);
        // colorR: 255
        // colorG: 0
        // colorB: 180
        // ambientLight(40, 0, 60);
        // directionalLight(0, 255, 255, -1, 0, -1);

        sketch.fill(col);

        // sketch.directionalLight(204, 204, 204, -dirX, -dirY, -1);
        //  sketch.directionalLight(
        //   paramsRef.current.light_1,
        //   paramsRef.current.light_2,
        //   paramsRef.current.light_3,
        //   paramsRef.current.light_4,
        //   paramsRef.current.light_5,
        //   paramsRef.current.light_6
        // );

        // sketch.ambientLight(20, 20, 40);

        // fajne ustawienie

        // FPS

        // let dt = sketch.deltaTime * 0.05; // sekundy
        if (state.spinX) {
          rotX += dt * (state.rotationSpped / 100);
        }

        if (state.spinY) {
          rotY += dt * (state.rotationSpped / 100);
        }

        if (state.spinZ) {
          rotZ += dt * (state.rotationSpped / 100);
        }

        sketch.translate(0, 0, state.z_position);

        sketch.rotateX(rotX);
        sketch.rotateY(rotY);
        sketch.rotateZ(rotZ);

        //

        //      let rotX = 0;
        //       let rotY = 0;
        //       let rotZ = 0;

        //       let dt = sketch.deltaTime * 0.001; // sekundy

        //       if (paramsRef.current.spinX) {
        //         rotX += paramsRef.current.rotationSpped * dt;
        //       }

        //       if (paramsRef.current.spinY) {
        //         rotY += paramsRef.current.rotationSpped * dt;
        //       }

        //       if (paramsRef.current.spinZ) {
        //        rotZ += paramsRef.current.rotationSpped * dt;
        //       }

        //      sketch.rotateX(rotX);
        // sketch.rotateY(rotY);
        // sketch.rotateZ(rotZ);

        // sketch.ambientLight(20, 20, 40);
        // sketch.specularMaterial(0, 255, 200);

        /*
        5. Glass / hologram efekt
          Mega futurystyczne:
        */
        // sketch.noStroke();
        // sketch.specularMaterial(100, 200, 255);
        // sketch.shininess(100);

        // 6. Cyberpunk preset (róż + niebieski)
        // background(10, 0, 20);
        // colorR: 255
        // colorG: 0
        // colorB: 180
        // ambientLight(40, 0, 60);
        // directionalLight(0, 255, 255, -1, 0, -1);

        // TL;DR – NAJSZYBSZY UPGRADE
        // sketch.emissiveMaterial(0, 255, 200);
        // sketch.background(5, 10, 30);
        // sketch.noStroke();

        //rotateY(34)
        sketch.translate(
          -((X_ROWS * X_SIZE) / 2) +
            X_SIZE / 2 -
            (X_GAP * X_ROWS) / 2 +
            X_GAP / 2,
          (Y_ROWS * Y_SIZE) / 2 - Y_SIZE / 2 + (Y_GAP * Y_ROWS) / 2 - Y_GAP / 2,
          (Z_ROWS * Z_SIZE) / 2 - Z_SIZE / 2 + (Z_GAP * Z_ROWS) / 2 - Z_GAP / 2,
        );

        // 8. Bonus: „pulsująca energia”
        // Zamiast:
        //let sc = sketch.sin(sketch.millis() / 400);
        // daj:
        // let sc = sketch.sin(sketch.millis() * 0.002);
        const speed = 20;
        // console.log("sketch.millis()", sketch.millis())
        if (!state.freeze) {
          incrementerForAnimation += speed;
          //sc = sketch.sin(sketch.millis() * 0.002);
          sc = sketch.sin(incrementerForAnimation * 0.002);
        } else {
          //incrementerForAnimation += bass
          sc = sketch.sin(bass * 0.002);
        }

        if (paramsRef.current.dynamicLight) {
          let t = sketch.millis() * 0.001;
          let r = 50 + 50 * sketch.sin(t);
          let g = 200 + 55 * sketch.sin(t + 2);
          let b = 255;
          sketch.emissiveMaterial(r, g, b);
          //sketch.normalMaterial(r, g, b);
        }
        let i = 1;

        function drawCubes() {
          function isVisible(x, y, z) {
            const margin = 900; // dodatkowy margines dla widoczności
            return (
              x > -SCREEN_WIDTH / 2 - margin &&
              x < SCREEN_WIDTH / 2 + margin &&
              y > -SCREEN_HEIGHT / 2 - margin &&
              y < SCREEN_HEIGHT / 2 + margin &&
              z > -2000 &&
              z < 2000 // zakres renderu w głąb
            );
          }

          for (let x = 0; x < X_ROWS; x++) {
            for (let y = 0; y < Y_ROWS; y++) {
              for (let z = 0; z < Z_ROWS; z++) {
                if (isFrontWall(x, y, z)) {
                  i++;
                  const animation =
                    sketch.sq(
                      sc *
                        sketch.sin((x / (X_ROWS - 1)) * sketch.PI) *
                        sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) *
                        20,
                    ) + 10;

                  //let _z = sc; //sketch.round(sc *
                  //let _z = (paramsRef.current.animate_z) ? animation : 0; FAJNY EFEKT
                  let _z = paramsRef.current.animate_z ? animation : 0;
                  setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, 0, _z);
                  // drawBox(x_pos, y_pos, z_pos, X_SIZE , Y_SIZE, Z_SIZE, 0, 0, _z)
                } else if (isBackWall(x, y, z)) {
                  const animation = sketch.sq(
                    sc *
                      sketch.sin((x / (X_ROWS - 1)) * sketch.PI) *
                      sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) *
                      20,
                  );

                  let _z = paramsRef.current.animate_z ? animation : 0;

                  setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, 0, -_z);
                  drawBox(
                    x_pos,
                    y_pos,
                    z_pos,
                    X_SIZE,
                    Y_SIZE,
                    -Z_SIZE,
                    0,
                    0,
                    -_z,
                  );
                } else if (isLeftWall(x, y, z)) {
                  const animation = sketch.sq(
                    sc *
                      sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) *
                      sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) *
                      20,
                  );

                  let _x = paramsRef.current.animate_x ? animation : 0;

                  setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, -_x, 0, 0);
                  if (isVisible(x_pos, y_pos, z_pos)) {
                    drawBox(
                      x_pos,
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
                } else if (isRightWall(x, y, z)) {
                  const sth = y * z * bass;
                  const animation = sketch.sq(
                    sc *
                      sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) *
                      sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) *
                      20,
                  );

                  let _x = paramsRef.current.animate_x ? animation : 0;

                  setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, _x, 0, 0);
                  if (isVisible(x_pos, y_pos, z_pos)) {
                    drawBox(
                      x_pos,
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
                } else if (isTopWall(x, y, z)) {
                  const animation = sketch.sq(
                    sc *
                      sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) *
                      sketch.sin((x / (X_ROWS - 1)) * sketch.PI) *
                      20,
                  );

                  let _y = paramsRef.current.animate_y ? animation : 0;

                  setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, -_y, 0);
                  drawBox(
                    x_pos,
                    y_pos,
                    z_pos,
                    X_SIZE,
                    Y_SIZE,
                    Z_SIZE,
                    0,
                    -_y,
                    0,
                  );
                } else if (isBottomWall(x, y, z)) {
                  const animation = sketch.sq(
                    sc *
                      sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) *
                      sketch.sin((x / (X_ROWS - 1)) * sketch.PI) *
                      20,
                  );

                  let _y = paramsRef.current.animate_y ? animation : 0;

                  setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, _y, 0);
                  drawBox(
                    x_pos,
                    y_pos,
                    z_pos,
                    X_SIZE,
                    Y_SIZE,
                    Z_SIZE,
                    0,
                    -_y,
                    0,
                  );
                  // EDGES
                } else {
                  //setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, 0, 0);
                  //drawBox(x_pos, y_pos, z_pos,X_SIZE , Y_SIZE, Z_SIZE, 0, 0, 0)
                }
              }
            }
          }
        }

        drawCubes();

        // 🧾 HUD / debug text (top-right corner)
        //           sketch.fill(255, 255, 255, 255);
        //       sketch.push();
        //       sketch.resetMatrix(); // 🔥 mega ważne w WEBGL

        //       sketch.fill(255);
        //       sketch.noStroke();
        //       sketch.textSize(14);
        //       sketch.textAlign(sketch.LEFT, sketch.TOP);

        //       let status = `
        //       REC: ${isRecording}
        //       PLAY: ${isPlaying}
        //       frames: ${keyframes.length}
        //       time: ${playhead.toFixed(2)}
        //       `;

        //       // 👇 KLUCZOWE
        // sketch.translate(-sketch.width / 2, -sketch.height / 2);

        // sketch.text(status, 10, 10);

        //       sketch.pop();

        // sketch.push();
        // sketch.resetMatrix();
        // sketch.translate(-sketch.width / 2, -sketch.height / 2);

        //sketch.hint(sketch.DISABLE_DEPTH_TEST);

        // sketch.fill(255);
        // sketch.noStroke();
        // sketch.textSize(14);

        //       let status = `
        //       REC: ${isRecording}
        //       PLAY: ${isPlaying}
        //       frames: ${keyframes.length}
        //       time: ${playhead.toFixed(2)}
        //       `;

        //        let status2 = [
        //         `REC: ${isRecording}`,
        //         `PLAY: ${isPlaying}`,
        //       `frames: ${keyframes.length}`,
        //       `time: ${playhead.toFixed(2)}`
        //        ]
        //   window.recordingStatus = status2;

        // sketch.text(status, 10, 10);

        // sketch.pop();
        window._debug = {
          isRecording,
          isPlaying,
          frames: keyframes.length,
          time: playhead.toFixed(2),
        };
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
        z_pos += z_pos * state.Crazy_z_position;
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

        // glow layer
        // sketch.noStroke();
        // sketch.fill(0, 255, 255, 20);
        // sketch.box(X_SIZE * 1.3, Y_SIZE * 1.3, Z_SIZE * 1.3);

        /*  WYJELISMY TO SPOD POJEDYNCZEGO RENDERU
        🌈 4. Dynamiczny kolor (żyje 🔥)
          Zamiast stałego koloru:
      */
        //  if(paramsRef.current.dynamicLight) {
        //     let t = sketch.millis() * 0.001;
        //     let r = 50 + 50 * sketch.sin(t);
        //     let g = 200 + 55 * sketch.sin(t + 2);
        //     let b = 255;
        //     sketch.emissiveMaterial(r, g, b);
        // } else {

        let r = x_pos / X_ROWS;
        let g = y_pos / Y_ROWS;
        let b = z_pos / Z_ROWS;
        //sketch.emissiveMaterial(sketch.sin(r)*50, sketch.sin(g)*50, sketch.sin(b)*50);

        // let r = (x_pos / X_ROWS) * 255;
        // let g = (y_pos / Y_ROWS) * 255;
        // let b = (z_pos / Z_ROWS) * 255;
        // sketch.emissiveMaterial(r, g, b);

        // let t = sketch.millis() * 0.00;

        // let r = 128 + 127 * sketch.sin(t + x_pos * 0.3);
        // let g = 128 + 127 * sketch.sin(t + y_pos * 0.3);
        // let b = 128 + 127 * sketch.sin(t + z_pos * 0.3);

        // sketch.emissiveMaterial(r, g, b);

        // sketch.emissiveMaterial(
        //         paramsRef.current.colorR,
        //         paramsRef.current.colorG,
        //         paramsRef.current.colorB
        //     );

        //}

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

        // glow layer
        sketch.noStroke();
        sketch.fill(0, 255, 255, 20);
        sketch.box(X_SIZE * 1.3, Y_SIZE * 1.3, Z_SIZE * 1.3);

        // main cube
        sketch.emissiveMaterial(0, 255, 220);
        sketch.box(X_SIZE + _x, Y_SIZE - _y, Z_SIZE + _z);

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

// --- Sketch Renderer ---
// function SketchView({ sketchConfig, params }) {
//   const sketchFn = (p5) => sketchConfig.sketch(p5, params);
//   return <Sketch setup={(p5, canvasParentRef) => p5.setup?.(p5, canvasParentRef)} draw={(p5) => p5.draw?.(p5)} />;
// }

// function SketchView({ sketchConfig, params }) {
//   const containerRef = useRef();
//     let instance;

//   useEffect(() => {
//     console.log("sketchConfig", sketchConfig)
//     console.log("params", params)

//     const sketch = (p) => {
//       sketchConfig.sketch(p, params);
//     };

//     instance = new p5(sketch, containerRef.current);

//     return () => {
//       instance.remove(); // cleanup przy zmianie
//     };
//   }, [sketchConfig.name, params]);

//   return <div ref={containerRef} />;
// }

// function DebugOverlay({ params, bands }) {
//   const { bass, mid, high } = bands.current || {};
//   const debugText = window._debug || {};
//   return (
//     <div
//       style={{
//         position: "absolute",
//         top: 100,
//         left: 30,
//         color: "white",
//         fontFamily: "monospace",
//         fontSize: "12px",
//         background: "rgba(0,0,0,0.4)",
//         padding: "10px",
//         borderRadius: "6px",
//         pointerEvents: "none", // 🔥 nie blokuje klików
//       }}
//     >
//       <div>🎧 bass: {bass?.toFixed(2)}</div>
//       <div>🎧 mid: {mid?.toFixed(2)}</div>
//       <div>🎧 high: {high?.toFixed(2)}</div>

//       <hr />

//       <div>X_SIZE: {params.X_SIZE}</div>
//       <div>Y_SIZE: {params.Y_SIZE}</div>
//       <div>Z_SIZE: {params.Z_SIZE}</div>

//       <div>rows: {params.X_ROWS}</div>

//       {debugText && Object.entries(debugText).map((key, value) => {
//               return <div >{key}: {value}</div>
//           })}
//     </div>
//   );
// }

function DebugOverlay({ params, bands, debug }) {
  return (
    <div style={{ position: 'absolute', top: 100, left: 30 }}>
      <div>REC: {String(debug.isRecording)}</div>
      <div>PLAY: {String(debug.isPlaying)}</div>
      <div>frames: {debug.frames}</div>
      <div>time: {debug.time?.toFixed(2)}</div>
      <div>BASS: {bands.current.bass}</div>
      <div>MID: {bands.current.mid}</div>

      <div>FPS: {debug.FPS}</div>
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

  const { playKick, playSnare, bandsRef } = useAudioSystem();

  useKeyPress('Space', playKick);
  useKeyPress('KeyS', playSnare);

  //const { bands } = useAudioReactive();
  // SPACJA:
  //useKeyPress("Space", playKick);
  //const { playKick } = useKick();

  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // const containerRef = useRef(null);
  // const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      console.log('ON LOAD, rec.width:', rect.width);
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
