class Tetromino {
  /**
   * Provide an array of [x, y] pairs
   * @param  {...any} blocks 
   */
  constructor(...blocks) {
    this.setPosition(0, 0);
    this.blocks = blocks;
  }

  drawSelf(context) {
    for (const [i, j] of this.blocks) {
      drawBlock(context, i + this.x, j + this.y);
    }
  }

  getPosition() {
    return [this.x, this.y];
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}

const ctx = document.getElementById("playfield").getContext("2d");

for (let i = 0; i < 12; i++) {
  drawBlock(ctx, i, i);
}

const test = new Tetromino([1,0], [2,0], [0,1], [1,1]);
test.setPosition(3, 7);
test.drawSelf(ctx);


function drawBlock(context, x, y) {
  context.rect(40 * x + 1, 40 * y + 1, 38, 38);
  context.fillStyle = "lightgray";
  context.fill();
  context.strokeStyle = "slategray";
  context.stroke();
}
