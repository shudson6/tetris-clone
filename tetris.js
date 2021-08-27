const ctx = document.getElementById("playfield").getContext("2d");
let activeTetro = {};
const lockedBlocks = [];

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
  if ( ! checkPlayfieldBounds({ 
    tetro: activeTetro.tetro,
    x: activeTetro.x + 1,
    y: activeTetro.y
  })) {
    activeTetro.x += 1;
  }
}

function leftKeyPressed() {
  if ( ! checkPlayfieldBounds({ 
    tetro: activeTetro.tetro,
    x: activeTetro.x - 1,
    y: activeTetro.y
  })) {
    activeTetro.x -= 1;
  }
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

/**
 * This becomes the callback given to window.requestAnimationFrame()
 * @param {*} context 
 * @param {*} lockedBlocks 
 * @param {*} currentBlock 
 */
function draw() {
  ctx.clearRect(0, 0, 480, 640);
  drawPlayfield( ctx );
  for (const block of activeTetro.tetro.getBlocks()) {
    drawBlock(ctx, block[0] + activeTetro.x, block[1] + activeTetro.y);
  }

  requestAnimationFrame( draw );
}

/*******************************************************************************
 * Collision
 ******************************************************************************/

function checkPlayfieldBounds(tetro) {
  for (const block of tetro.tetro.getBlocks()) {
    const x = block[0] + tetro.x;
    if (x < 0 || x > 9) {
      return true;
    }
  }
  return false;
}

function tryRotate(tetro) {
  const rotated = {
    ...tetro,
    tetro: tetro.tetro.nextRotation(),
  }

  if (checkPlayfieldBounds( rotated )) {
    // try moving 1 in from left then right
    if ( ! checkPlayfieldBounds({ ...rotated, x: rotated.x + 1 })) {
      rotated.x += 1;
    }
    else if ( ! checkPlayfieldBounds({ ...rotated, x: rotated.x - 1 })) {
      rotated.x -= 1;
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
  activeTetro.y += 1;
  if (activeTetro.y > 19) {
    activeTetro.y = 0;
  }
}, 500);

draw();