export default function (p) {
  p.setup = function () {
    p.createCanvas(400, 400);
  };

  p.draw = function () {
    p.background(20);
    p.fill(255);
    p.circle(p.mouseX, p.mouseY, 50);
  };
}
