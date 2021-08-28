const ctx = document.getElementById("playfield").getContext("2d");
let activeTetro = {};
let lockedBlocks = [];

class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/*******************************************************************************
 * Tetromino class!
 * 
 * Tetra - 4 - Tetromino.
 * That's why its blocks member is hard-coded with 4 elements.
 * 
 * There's really no point creating new instances. Just use the provided ones.
 ******************************************************************************/
class Tetromino {
  /**
   * 
   * @param {*} a 
   * @param {*} b 
   * @param {*} c 
   * @param {*} d 
   */
  constructor(a, b, c, d) {
    this.blocks = [ 
      new Block(...a), 
      new Block(...b), 
      new Block(...c), 
      new Block(...d) 
    ];
  }

  drawSelf(context, x, y) {
    for (const [i, j] of this.blocks) {
      drawBlock(context, i + x, j + y);
    }
  }

  getBlocks() {
    // deep copy
    return this.blocks.map(b => Object.assign({}, b));
  }

  /**
   * Creates a doubly-linked circular list from the parameters and adds getters
   * nextRotation() and prevRotation() to retrieve them.
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
    new Tetromino([0,-1], [0,0], [1,0], [2,0]),
    new Tetromino([1,-1], [1,0], [1,1], [2,-1]),
    new Tetromino([0,0], [1,0], [2,0], [2,1]),
    new Tetromino([0,1], [1,-1], [1,0], [1,1])
  );

  static L = Tetromino.createLinkedRotation(
    new Tetromino([0,0], [1,0], [2,-1], [2,0]),
    new Tetromino([1,-1], [1,0], [1,1], [2,1]),
    new Tetromino([0,0], [0,1], [1,0], [2,0]),
    new Tetromino([0,-1], [1,-1], [1,0], [1,1])
  );

  static O = Tetromino.createLinkedRotation(
    new Tetromino([0,-1], [0,0], [1,-1], [1,0])
  ); 

  static S = Tetromino.createLinkedRotation(
    new Tetromino([0,0], [1,-1], [1,0], [2,-1]),
    new Tetromino([1,-1], [1,0], [2,0], [2,1]),
    new Tetromino([0,1], [1,0], [1,1], [2,0]),
    new Tetromino([0,-1], [0,0], [1,0], [1,1])
  );

  static T = Tetromino.createLinkedRotation(
    new Tetromino([0,0], [1,-1], [1,0], [2,0]),
    new Tetromino([1,-1], [1,0], [1,1], [2,0]),
    new Tetromino([0,0], [1,0], [1,1], [2,0]),
    new Tetromino([0,0], [1,-1], [1,0], [1,1])
  );

  static Z = Tetromino.createLinkedRotation(
    new Tetromino([0,-1], [1,-1], [1,0], [2,0]),
    new Tetromino([1,0], [1,1], [2,-1], [2,0]),
    new Tetromino([0,0], [1,0], [1,1], [2,1]),
    new Tetromino([0,0], [0,1], [1,-1], [1,0])
  );
}

/*******************************************************************************
 * Controls (User input handling)
 ******************************************************************************/

let leftArrowDown = false;
let rightArrowDown = false;
let upArrowDown = false;

function handleKeyDown(event) {
  if ( (event.key === "Right" || event.key === "ArrowRight") 
      && !rightArrowDown 
  ) {
    rightArrowDown = true;
    rightKeyPressed();
  }
  else if ( (event.key === "Left" || event.key === "ArrowLeft")
      && !leftArrowDown
  ) {
    leftArrowDown = true;
    leftKeyPressed();
  }
  else if ( (event.key === "Up" || event.key === "ArrowUp")
      && !upArrowDown
  ) {
    upArrowDown = true;
    upKeyPressed();
  }
}

function handleKeyUp(event) {
  if (event.key === "Right" || event.key === "ArrowRight") {
    rightArrowDown = false;
  }
  else if (event.key === "Left" || event.key === "ArrowLeft") {
    leftArrowDown = false;
  }
  else if (event.key === "Up" || event.key === "ArrowUp") {
    upArrowDown = false;
  }
}

function rightKeyPressed() {
  moveRight();
}

function leftKeyPressed() {
  moveLeft();
}

function upKeyPressed() {
  activeTetro = tryRotate( activeTetro );
}

/*******************************************************************************
 * Graphics
 ******************************************************************************/

function drawBlock(context, x, y) {
  context.beginPath();
  context.rect(30 * x + 11, 30 * y + 11, 28, 28);
  context.fillStyle = "lightgray";
  context.fill();
  context.strokeStyle = "slategray";
  context.stroke();
  context.closePath();
}

function drawPlayfield(context) {
  context.beginPath();
  context.rect(10, 10, 300, 600);
  context.strokeStyle = "white";
  context.stroke();
  context.closePath();
}

function drawBlocks(blocks) {
  blocks.forEach(b => drawBlock(ctx, b.x, b.y));
}

/**
 * This becomes the callback given to window.requestAnimationFrame()
 * @param {*} context 
 * @param {*} lockedBlocks 
 * @param {*} currentBlock 
 */
function draw() {
  ctx.clearRect(0, 0, 480, 640);
  drawPlayfield( ctx );
  drawBlocks( lockedBlocks );
  for (const block of activeTetro.tetro.getBlocks()) {
    drawBlock(ctx, block.x + activeTetro.x, block.y + activeTetro.y);
  }

  requestAnimationFrame( draw );
}

/*******************************************************************************
 * Collision
 ******************************************************************************/

// set true when piece has bottomed out; if still true at next tick, piece
// locks and next piece starts.
// reset if player moves/rotates before next tick.
let nextTickLock = false;

function collisionDetect(tetro) {
  for (const b of tetro.tetro.getBlocks()) {
    const x = b.x + tetro.x;
    const y = b.y + tetro.y;
    // playfield bounds
    if (x < 0 || x > 9) {
      return true;
    }

    if (y > 19) {
      return true;
    }
    
    for (const l of lockedBlocks) {
      if (l.x === x && l.y === y) {
        return true;
      }
    }
  }
  return false;
}

function moveLeft() {
  if ( ! collisionDetect({ 
    ...activeTetro,
    x: activeTetro.x - 1,
  })) {
    activeTetro.x -= 1;
  }
}

function moveRight() {
  if ( ! collisionDetect({ 
    ...activeTetro,
    x: activeTetro.x + 1,
  })) {
    activeTetro.x += 1;
  }
}

function tryRotate(tetro) {
  const rotated = {
    ...tetro,
    tetro: tetro.tetro.nextRotation(),
  }

  if (collisionDetect( rotated )) {
    // try moving 1 in from left then right
    if ( ! collisionDetect({ ...rotated, x: rotated.x + 1 })) {
      rotated.x += 1;
    }
    else if ( ! collisionDetect({ ...rotated, x: rotated.x - 1 })) {
      rotated.x -= 1;
    }
    else if ( ! collisionDetect({ ...rotated, y: rotated.y - 1 })) {
      rotated.y -= 1;
    }
    else {
      return tetro;
    }
  }

  return rotated;
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

activeTetro.tetro = Tetromino.J;
activeTetro.x = 3;
activeTetro.y = 0;

setInterval(() => {
  if (! collisionDetect({ ...activeTetro, y: activeTetro.y + 1 })) {
    activeTetro.y += 1;
  }
  else if (nextTickLock === true) {
    lockedBlocks = lockedBlocks.concat(
        activeTetro.tetro.getBlocks().map(
            b => new Block(b.x + activeTetro.x, b.y + activeTetro.y)
    ));
    activeTetro = {
      tetro: Tetromino.Z,
      x: 3,
      y: 0
    };
    nextTickLock = false;
  }
  else {
    nextTickLock = true;
  }
}, 500);

draw();