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

  /**
   * Creates a doubly-linked circular list from the parameters. If only one is 
   * given, it _will_ link to itself in both directions.
   * 
   * Intented for creating the static tetrominos below.
   * 
   * @param  {...any} rotations 
   * @returns 
   */
  static createLinkedRotation(...rotations) {
    function link(l) {
      return () => { return l; };
    }

    for (let i = 1; i < rotations.length; i++) {
      rotations[i - 1].nextRotation = link( rotations[i] );
      rotations[i].prevRotation = link( rotations[i - 1] );
    }
    const first = rotations[0];
    const last = rotations[rotations.length - 1];
    last.nextRotation = link( first );
    first.prevRotation = link( last );

    for (const r of rotations) {
      Object.freeze( r );
    }

    return first;
  }

  // rotations from the Super Rotation System 
  // described at https://strategywiki.org/wiki/Tetris/Rotation_systems
  static I = Tetromino.createLinkedRotation(
    new Tetromino([0,0], [1,0], [2,0], [3,0]),
    new Tetromino([2,-1], [2,0], [2,1], [2,2]),
    new Tetromino([0,1], [1,1], [2,1], [3,1]),
    new Tetromino([1,-1], [1,0], [1,1], [1,2])
  );

  static J = Tetromino.createLinkedRotation(
    new Tetromino([0,0], [0,1], [1,1], [2,1]),
    new Tetromino([1,0], [1,1], [1,2], [2,0]),
    new Tetromino([0,1], [1,1], [2,1], [2,2]),
    new Tetromino([0,2], [1,0], [1,1], [1,2])
  );

  static L = Tetromino.createLinkedRotation(
    new Tetromino([0,1], [1,1], [2,0], [2,1]),
    new Tetromino([1,0], [1,1], [1,2], [2,2]),
    new Tetromino([0,1], [0,2], [1,1], [2,1]),
    new Tetromino([0,0], [1,0], [1,1], [1,2])
  );

  static O = Tetromino.createLinkedRotation(
    new Tetromino([0,0], [0,1], [1,0], [1,1])
  ); 

  static S = Tetromino.createLinkedRotation(
    new Tetromino([0,1], [1,0], [1,1], [2,0]),
    new Tetromino([1,0], [1,1], [2,1], [2,2]),
    new Tetromino([0,2], [1,1], [1,2], [2,1]),
    new Tetromino([0,0], [0,1], [1,1], [1,2])
  );

  static T = Tetromino.createLinkedRotation(
    new Tetromino([0,1], [1,0], [1,1], [2,1]),
    new Tetromino([1,0], [1,1], [1,2], [2,1]),
    new Tetromino([0,1], [1,1], [1,2], [2,1]),
    new Tetromino([0,1], [1,0], [1,1], [1,2])
  );

  static Z = Tetromino.createLinkedRotation(
    new Tetromino([0,0], [1,0], [1,1], [2,1]),
    new Tetromino([1,1], [1,2], [2,0], [2,1]),
    new Tetromino([0,1], [1,1], [1,2], [2,2]),
    new Tetromino([0,1], [0,2], [1,0], [1,1])
  );
}



function drawBlock(context, x, y) {
  context.beginPath();
  context.rect(40 * x + 1, 40 * y + 1, 38, 38);
  context.fillStyle = "lightgray";
  context.fill();
  context.strokeStyle = "slategray";
  context.stroke();
  context.closePath();
}

const ctx = document.getElementById("playfield").getContext("2d");

let test = [
  Tetromino.I,
  Tetromino.J,
  Tetromino.L,
  Tetromino.O,
  Tetromino.S,
  Tetromino.T,
  Tetromino.Z
];

test[0].drawSelf(ctx, 1, 1);
test[1].drawSelf(ctx, 1, 5);
test[2].drawSelf(ctx, 1, 9);
test[3].drawSelf(ctx, 1, 13);
test[4].drawSelf(ctx, 6, 3);
test[5].drawSelf(ctx, 6, 7);
test[6].drawSelf(ctx, 6, 11);

setInterval(() => {
  ctx.clearRect(0, 0, 480, 640);
  test = test.map(t => t.nextRotation());
  test[0].drawSelf(ctx, 1, 1);
  test[1].drawSelf(ctx, 1, 5);
  test[2].drawSelf(ctx, 1, 9);
  test[3].drawSelf(ctx, 1, 13);
  test[4].drawSelf(ctx, 6, 3);
  test[5].drawSelf(ctx, 6, 7);
  test[6].drawSelf(ctx, 6, 11);
}, 500);