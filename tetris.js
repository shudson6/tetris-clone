/********************************************************************************
 * Tetromino class!
 * 
 * Tetra - 4 - Tetromino.
 * That's why its blocks member is hard-coded with 4 elements.
 * 
 * There's really no point creating new instances. Just use the provided ones.
 */
class Tetromino {
  /**
   * 
   * @param {*} a 
   * @param {*} b 
   * @param {*} c 
   * @param {*} d 
   */
  constructor(a, b, c, d) {
    this.blocks = [ a, b, c, d ];
  }

  /**
   * Rotates this Tetromino. The standard direction is clockwise, but
   * if counterclockwise === true it will rotate that way.
   * 
   * @param {*} counterclockwise indicates if rotation should be reversed
   */
  rotate(counterclockwise) {
    const sinTheta = counterclockwise ? 1 : -1;
    for (let v of this.blocks) {
      const [x, y] = v;
      v[0] = -y * sinTheta;
      v[1] = x * sinTheta;
    }
  }

  drawSelf(context, x, y) {
    for (const [i, j] of this.blocks) {
      drawBlock(context, i + x, j + y);
    }
  }

  getBlocks() {
    // deep copy
    return [ 
      [ ...this.blocks[0]],
      [ ...this.blocks[1]],
      [ ...this.blocks[2]],
      [ ...this.blocks[3]]
    ];
  }

  static L() {
    return new Tetromino([0,0], [1,0], [2,0], [2,1]);
  } 

  static J() {
    return new Tetromino([0,0], [0,1], [1,1], [2,1]);
  }

  static S() {
    return new Tetromino([1,0], [2,0], [0,1], [1,1]);
  }

  static Z() {
    return new Tetromino([0,0], [1,0], [1,1], [2,1]);
  } 

  static I() {
    return new Tetromino([0,0], [1,0], [2,0], [3,0]);
  } 

  static T() {
    return new Tetromino([1,0], [0,1], [1,1], [2,1]);
  } 

  static O() {
    return new Tetromino([0,0], [0,1], [1,0], [1,1]);
  } 
}

function drawBlock(context, x, y) {
  context.rect(40 * x + 1, 40 * y + 1, 38, 38);
  context.fillStyle = "lightgray";
  context.fill();
  context.strokeStyle = "slategray";
  context.stroke();
}

const ctx = document.getElementById("playfield").getContext("2d");

let test = Tetromino.L();
test.drawSelf(ctx, 3, 7);
test.rotate();
test.drawSelf(ctx, 6, 7);