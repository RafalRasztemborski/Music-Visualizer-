export default function Cube(set) {
  return function (sketch) {

    const SCREEN_WIDTH = 800;
    const SCREEN_HEIGHT = 800;

    let X_ROWS = 11;
    let Y_ROWS = 11;
    let Z_ROWS = 11;

    let X_SIZE = 20;
    let Y_SIZE = 20;
    let Z_SIZE = 20;

    let x_pos = 0;
    let y_pos = 0;
    let z_pos = 0;

    sketch.setup = function () {
      sketch.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT, sketch.WEBGL);
    };

    sketch.draw = function() { 

		let X_GAP = set.X_GAP;
		let Y_GAP = set.Y_GAP;
		let Z_GAP = set.Z_GAP;

			sketch.scale(0.5,0.5, 0.5)
			sketch.background(16, 25, 110);
			//debugger;
			let col = sketch.color(100, sketch.mouseY, 255, 255);
			sketch.fill(col)
			
			// let dirY = 0
		    // let dirX = 0

            let dirY = (sketch.mouseY / parseFloat(sketch.height) - 0.5) * 2;
		    let dirX = (sketch.mouseX / parseFloat(sketch.width) - 0.5) * 2;
			
			//directionalLight(204, 204, 204, -dirX, -dirY, -1);
			sketch.stroke(20)
			sketch.line(0, -SCREEN_HEIGHT / 2, 0 , SCREEN_HEIGHT / 2 )
			let s =1.2;

			sketch.stroke(1)

			sketch.line(0, SCREEN_HEIGHT, SCREEN_WIDTH *2, SCREEN_HEIGHT)
			sketch.line(SCREEN_WIDTH, 0, SCREEN_WIDTH, SCREEN_HEIGHT * 2)

			for(let x = 0; x < 20; x++) {
				sketch.ellipse(SCREEN_WIDTH + (x * 20), 800 + (sketch.sin((x/19) * sketch.PI) * 200), 20, 20);
			}

			sketch.strokeWeight(2);
			// fajne ustawienie

            

			sketch.rotateX(set.X_ROTATE / 90);
			sketch.rotateY(set.Y_ROTATE / 90);
			sketch.rotateZ(set.Z_ROTATE / 90);

			sketch.rotateX(sketch.millis()/ 150);
            //sketch.rotateY(sketch.millis()/ 1650);
            sketch.rotateZ(sketch.millis()/ 5650);
			//rotateY(34)
			sketch.translate(-((X_ROWS * X_SIZE) / 2) + (X_SIZE / 2) - ((X_GAP * X_ROWS) / 2) + (X_GAP / 2), 
					   ((Y_ROWS * Y_SIZE) / 2) - (Y_SIZE / 2) + ((Y_GAP * Y_ROWS) / 2) - (Y_GAP / 2), 
					   ((Z_ROWS * Z_SIZE) / 2) - (Z_SIZE / 2) + ((Z_GAP * Z_ROWS) / 2) - (Z_GAP / 2)
					 )
			let sc = sketch.sin(sketch.millis() / 400);
            
			let i = 1;
			for (let x = 0; x < X_ROWS; x++) {
				for (let y = 0; y < Y_ROWS; y++) { 
					for (let z = 0; z < Z_ROWS; z++) {
						if (isFrontWall(x, y, z)) {
							i++
							//let _z = 0;
							//let _z = sc; //sketch.round(sc * 
                            let _z = sketch.sq(sc * 
								sketch.sin((x / (X_ROWS - 1)) * sketch.PI) * 
										 	sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) * 
										 20) + 10;
							setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, 0, _z);
							drawBox(x_pos, y_pos, z_pos, X_SIZE , Y_SIZE, Z_SIZE, 0, 0, _z)
						} else 
						if (isBackWall(x, y, z)) {
							//let _z = 0;
							let _z = sketch.sq(sc * sketch.sin((x / (X_ROWS - 1)) * sketch.PI) * 
										 sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) * 
										 20)
							setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, 0, -_z);
							drawBox(x_pos, y_pos, z_pos, X_SIZE , Y_SIZE, -Z_SIZE, 0, 0, -_z)
						} else 
						if (isLeftWall(x, y, z)) 
						{	//let _x = 0;
							let _x = sketch.sq(sc * sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) * 
										 sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) * 
										 20)
							setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, -_x, 0, 0);
							drawBox(x_pos, y_pos, z_pos, -X_SIZE , Y_SIZE, Z_SIZE, -_x, 0, 0)
								
						} else 
						if (isRightWall(x, y, z))
						{	// let _x = 0;
							let _x = sketch.sq(sc * sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) * 
										 sketch.sin((y / (Y_ROWS - 1)) * sketch.PI) * 
										 20)
							setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, _x, 0, 0);
							drawBox(x_pos, y_pos, z_pos, -X_SIZE , Y_SIZE, Z_SIZE, -_x, 0, 0)
						} else 
						if (isTopWall(x, y, z)) 
						{	// let _y = 0;
							let _y = sketch.sq(sc * sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) * 
										 sketch.sin((x / (X_ROWS - 1)) * sketch.PI) * 
										 20)
							
							setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, -_y, 0);
							drawBox(x_pos, y_pos, z_pos, X_SIZE , Y_SIZE, Z_SIZE, 0, -_y, 0)
						} else 
						if (isBottomWall(x, y, z)) {
							let _y = sketch.sq(sc * sketch.sin((z / (Z_ROWS - 1)) * sketch.PI) * 
										 sketch.sin((x / (X_ROWS - 1)) * sketch.PI) * 
										 20)
							setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, _y, 0);
							drawBox(x_pos, y_pos, z_pos, X_SIZE , Y_SIZE, Z_SIZE, 0, -_y, 0)
						// EDGES
						} else {
							//setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, 0, 0, 0);
							//drawBox(x_pos, y_pos, z_pos,X_SIZE , Y_SIZE, Z_SIZE, 0, 0, 0)
						}
					}
				}
			}

          
		}	

		function isFrontWall(x, y, z) {
			return z == 0 && y != 0 && y != Y_ROWS - 1 && x != 0 && x != X_ROWS - 1;
		}

		function isBackWall(x, y, z) {
			return z == Z_ROWS - 1 && y != 0 && y != Y_ROWS - 1 && x != 0 && x != X_ROWS - 1 
		}

		function isTopWall(x, y, z) {
			return y == 0 && z != 0 && z != Z_ROWS - 1 && x!= 0 && x != X_ROWS - 1
		}

		function isBottomWall(x, y, z) {
			return y == Y_ROWS - 1 && z != 0 && z != Z_ROWS - 1 && x != 0 && x != X_ROWS-1
		}

		function isLeftWall(x, y, z) {
			return x == 0 && y != 0 && y!= Y_ROWS - 1 && z != 0 && z!= Z_ROWS - 1
		}

		function isRightWall(x, y, z) {
			return x == X_ROWS - 1 && y != 0 && y!= Y_ROWS - 1 && z != 0 && z!= Z_ROWS - 1
		}

		function setPos(x, y, z, X_GAP, Y_GAP, Z_GAP, _x, _y, _z ) {
			x_pos =  (X_SIZE * x) + (X_GAP * x) + (_x / 2);
			y_pos = -(Y_SIZE * y) - (Y_GAP * y) - (_y / 2);
			z_pos = -(Z_SIZE * z) - (Z_GAP * z) + (_z / 2);	
		}

		function drawBox(x_pos, y_pos, z_pos, X_SIZE, Y_SIZE, Z_SIZE, _x, _y, _z) {
			sketch.push();
				sketch.translate(x_pos, y_pos, z_pos);
				sketch.box(X_SIZE + _x , Y_SIZE - _y, Z_SIZE + _z);
			sketch.pop();
		}
  };
}