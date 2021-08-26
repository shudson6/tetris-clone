/********************************************************************************
 * Tetromino class!
 */
class Tetromino {
  /**
   * Provide an array of [x, y] pairs
   * @param  {...any} blocks 
   */
  constructor(a, b, c, d) {
    this.blocks = [ a, b, c, d ];
  }

  drawSelf(context, x, y) {
    for (const [i, j] of this.blocks) {
      drawBlock(context, i + x, j + y);
    }
  }

  getBlocks() {
    // deep copy to protect immutability
    return [ 
      [ ...this.blocks[0]],
      [ ...this.blocks[1]],
      [ ...this.blocks[2]],
      [ ...this.blocks[3]]
    ];
  }

  static L = new Tetromino([0,0], [1,0], [2,0], [2,1]);
  static J = new Tetromino([0,0], [0,1], [1,1], [2,1]);
  static S = new Tetromino([1,0], [2,0], [0,1], [1,1]);
  static Z = new Tetromino([0,0], [1,0], [1,1], [2,1]);
  static I = new Tetromino([0,0], [1,0], [2,0], [3,0]);
  static T = new Tetromino([1,0], [0,1], [1,1], [2,1]);
  static O = new Tetromino([0,0], [0,1], [1,0], [1,1]);
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

test = Tetromino.J();
test.drawSelf(ctx, 0, 8);

test = Tetromino.S();
test.drawSelf(ctx, 2, 11);

test = Tetromino.Z();
test.drawSelf(ctx, 4, 13);

test = Tetromino.I();
test.drawSelf(ctx, 5, 1);

test = Tetromino.T();
test.drawSelf(ctx, 7, 3);

test = Tetromino.O();
test.drawSelf(ctx, 9, 13);