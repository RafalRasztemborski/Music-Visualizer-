export default function Cube(settingsRef) {
  return function (p) {
    let X_ROWS = 11;
    let Y_ROWS = 11;
    let Z_ROWS = 11;

    let X_SIZE = 20;
    let Y_SIZE = 20;
    let Z_SIZE = 20;

    let x_pos, y_pos, z_pos;

    return {
      setup() {
        // opcjonalnie
      },

      draw() {
        p.background(16, 25, 110);

        p.scale(0.6);

        p.rotateX(set.X_ROTATE);
        p.rotateY(set.Y_ROTATE);
        p.rotateZ(set.Z_ROTATE);

        p.translate(
          -((X_ROWS * X_SIZE) / 2),
          (Y_ROWS * Y_SIZE) / 2,
          (Z_ROWS * Z_SIZE) / 2,
        );

        for (let x = 0; x < X_ROWS; x++) {
          for (let y = 0; y < Y_ROWS; y++) {
            for (let z = 0; z < Z_ROWS; z++) {
              x_pos = (X_SIZE + set.X_GAP) * x;
              y_pos = -(Y_SIZE + set.Y_GAP) * y;
              z_pos = -(Z_SIZE + set.Z_GAP) * z;

              p.push();
              p.translate(x_pos, y_pos, z_pos);
              p.box(X_SIZE, Y_SIZE, Z_SIZE);
              p.pop();
            }
          }
        }
      },
    };
  };
}
