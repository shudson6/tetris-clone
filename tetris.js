const INPUT_HOLD_DELAY = 200;
const INPUT_REPEAT_DELAY = 50;
const INITIAL_TICK_DELAY = 500;

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
let downArrowDown = false;
let leftTimeoutID;
let rightTimeoutID;
let downTimeoutID;

function handleKeyDown(event) {
  if (event.key === "Right" || event.key === "ArrowRight") {
    rightKeyPressed();
  }
  else if (event.key === "Left" || event.key === "ArrowLeft") {
    leftKeyPressed();
  }
  else if (event.key === "Down" || event.key === "ArrowDown") {
    downKeyPressed();
  }
  else if (event.key === "Up" || event.key === "ArrowUp") {
    upKeyPressed();
  }
}

function handleKeyUp(event) {
  if (event.key === "Right" || event.key === "ArrowRight") {
    clearTimeout( rightTimeoutID );
    rightArrowDown = false;
  }
  else if (event.key === "Left" || event.key === "ArrowLeft") {
    clearTimeout( leftTimeoutID );
    leftArrowDown = false;
  }
  else if (event.key === "Down" || event.key === "ArrowDown") {
    clearTimeout( downTimeoutID );
    downArrowDown = false;
  }
  else if (event.key === "Up" || event.key === "ArrowUp") {
    upArrowDown = false;
  }
}

function rightKeyPressed() {
  if ( ! rightArrowDown
      && moveRight()) {
    rightArrowDown = true;
    rightTimeoutID = setTimeout(rightKeyHeld, INPUT_HOLD_DELAY);
  }
}

function rightKeyHeld() {
  if ( rightArrowDown ) {
    moveRight();
    rightTimeoutID = setTimeout(rightKeyHeld, INPUT_REPEAT_DELAY);
  }
}

function leftKeyPressed() {
  if ( ! leftArrowDown
      && moveLeft()) {
    leftArrowDown = true;
    leftTimeoutID = setTimeout(leftKeyHeld, INPUT_HOLD_DELAY);
  }
}

function leftKeyHeld() {
  if ( leftArrowDown ) {
    moveLeft();
    leftTimeoutID = setTimeout(leftKeyHeld, INPUT_REPEAT_DELAY);
  }
}

function upKeyPressed() {
  if ( ! upArrowDown) {
    upArrowDown = true;
    activeTetro = tryRotate( activeTetro );
  }
}

function downKeyPressed() {
  if ( ! downArrowDown
      && moveDown()
  ) {
    downArrowDown = true;
    downTimeoutID = setTimeout(downKeyHeld, INPUT_HOLD_DELAY);
  }
}

function downKeyHeld() {
  if ( downArrowDown ) {
    moveDown();
    downTimeoutID = setTimeout(downKeyHeld, INPUT_REPEAT_DELAY);
  }
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

function drawScore(context) {
  context.font = "24px sans-serif";
  context.fillText(`level: ${level}`, 330, 180);
  context.fillText(`score: ${score}`, 330, 210);
  context.fillText(`lines: ${lines}`, 330, 240);
}

function drawNext(context) {
  context.font = "18px sans-serif";
  context.fillText("next:", 330, 30);
  drawBlocks( tetroQueue.peek().getBlocks()
      .map(b => new Block(b.x + 11, b.y + 2))
  );
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
  drawScore( ctx );
  drawNext( ctx );
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
    x: activeTetro.x - 1
  })) {
    activeTetro.x -= 1;
    nextTickLock = false;
    return true;
  }
  return false;
}

function moveRight() {
  if ( ! collisionDetect({ 
    ...activeTetro,
    x: activeTetro.x + 1
  })) {
    activeTetro.x += 1;
    nextTickLock = false;
    return true;
  }
  return false;
}

function moveDown() {
  if ( ! collisionDetect({
      ...activeTetro,
      y: activeTetro.y + 1
  })) {
    activeTetro.y += 1;
    score += 1;
    return true;
  }
  return false;
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

  nextTickLock = false;
  return rotated;
}

function checkForLines(tetro) {
  const yValues = new Set( tetro.tetro.getBlocks().map(b => b.y + tetro.y ));
  let count = 0;
  for (const y of yValues) {
    if (checkLine( y )) {
      removeLine( y );
      count++;
    }
  }
  scoreLines(count);
}

function checkLine(y) {
  return lockedBlocks.filter(b => b.y === y).length === 10;
}

function removeLine(y) {
  lockedBlocks = lockedBlocks.filter(b => b.y !== y);
  for (const b of lockedBlocks) {
    if (b.y < y) {
      b.y += 1;
    }
  }
}

/*******************************************************************************
 * Gameplay
 ******************************************************************************/

function startGame() {
  activeTetro = {
    tetro: tetroQueue.getNext(),
    x: 3,
    y: -1
  };
  interval = setInterval(tick, tickDelay);
  draw();
}

function tick() {
  if (! collisionDetect({ ...activeTetro, y: activeTetro.y + 1 })) {
    activeTetro.y += 1;
  }
  else if (nextTickLock === true) {
    lockedBlocks = lockedBlocks.concat(
        activeTetro.tetro.getBlocks().map(
            b => new Block(b.x + activeTetro.x, b.y + activeTetro.y)
    ));
    if (checkEndgame( activeTetro )) {
      clearInterval( interval );
      console.log("Game Over!");
    }
    checkForLines( activeTetro );
    activeTetro = {
      tetro: tetroQueue.getNext(),
      x: 3,
      y: -1
    };
    nextTickLock = false;
  }
  else {
    nextTickLock = true;
  }
}

function scoreLines(count) {
  lines += count;
  switch (count) {
    case 1:
      score += 200;
      break;
    case 2:
      score += 500;
      break;
    case 3:
      score += 800;
      break;
    case 4:
      score += 1200;
      break;
  }
  if (Math.floor(lines / 10) >= level) {
    levelUp();
  }
}

function levelUp() {
  level++;
  tickDelay -= 25;
  clearInterval(interval);
  interval = setInterval(tick, tickDelay);
}

/**
 * Endgame conditions: tetromino lands completely above the playfield.
 * 
 * @param {*} tetro 
 * @returns true if endgame conditions are met
 */
function checkEndgame(tetro) {
  return tetro.tetro.getBlocks()
      .map(b => b.y + tetro.y)
      .every(y => y < 0);
}

// warning: iife
// i did it this way because practice
// also, i kind of like this better for a singleton
const tetroQueue = (() => {
  let tetroBag = [];

  function freshTetroBag() {
    const tetros = [
      Tetromino.I,
      Tetromino.J,
      Tetromino.L,
      Tetromino.O,
      Tetromino.S,
      Tetromino.T,
      Tetromino.Z
    ];
    // "Knuth Shuffle"
    for (let idx = tetros.length; idx > 0; idx--) {
      const rand = Math.floor(Math.random() * idx);
      [tetros[idx - 1], tetros[rand]] = [tetros[rand], tetros[idx - 1]];
    }
    return tetros;
  }

  // shake it, you know, make sure it's not empty
  function shakeBag() {
    if (tetroBag.length == 0) {
      tetroBag = freshTetroBag();
    }
  }

  function getNext() {
    shakeBag();
    return tetroBag.pop();
  }

  function peek() {
    shakeBag();
    return tetroBag[ tetroBag.length - 1 ];
  }

  return {
    getNext,
    peek
  };
})();

/*******************************************************************************
 * Setup
 ******************************************************************************/

const ctx = document.getElementById("playfield").getContext("2d");
let activeTetro = {};
let lockedBlocks = [];
let lines = 0;
let level = 1;
let score = 0;
let tickDelay = INITIAL_TICK_DELAY;
let interval;

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

startGame();
