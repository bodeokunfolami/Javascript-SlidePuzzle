const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;
const BOARDWIDTH = 4;
const BOARDHEIGHT = 4;
const TILESIZE = 80;
const BLANK = null;

const XMARGIN = (SCREEN_WIDTH - (TILESIZE * BOARDWIDTH + (BOARDWIDTH - 1))) / 2;
const YMARGIN =
  (SCREEN_HEIGHT - (TILESIZE * BOARDHEIGHT + (BOARDHEIGHT - 1))) / 2;

const RED = "rgb(200, 0, 0)";
const GREEN = "rgb(0, 200, 0)";
const BLUE = "rgb(0, 0, 200)";
const YELLOW = "rgb(150, 150, 0)";

const UP = "up";
const DOWN = "down";
const LEFT = "left";
const RIGHT = "right";

const state = {
  generatingPuzzle: true,
};

function clear() {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function overlay(x, y, width, height) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(x, y, width, height);
}

function getStartingBoard() {
  let x, y;
  let counter = 1;
  let board = new Array();

  for (x = 0; x < BOARDWIDTH; x++) {
    let column = new Array();
    for (y = 0; y < BOARDHEIGHT; y++) {
      column.push(counter);
      counter += BOARDWIDTH;
    }
    board.push(column);
    counter -= BOARDWIDTH * (BOARDHEIGHT - 1) + BOARDWIDTH - 1;
  }

  board[BOARDWIDTH - 1][BOARDHEIGHT - 1] = null;

  return board;
}

function getBlankPosition(board) {
  let x, y;
  for (x = 0; x < BOARDWIDTH; x++) {
    for (y = 0; y < BOARDHEIGHT; y++) {
      if (board[x][y] === null) return { x, y };
    }
  }
}

function makeMove(board, move) {
  let blankPos = getBlankPosition(board);
  if (move === UP) {
    board[blankPos.x][blankPos.y] = board[blankPos.x][blankPos.y + 1];
    board[blankPos.x][blankPos.y + 1] = null;
  } else if (move === DOWN) {
    board[blankPos.x][blankPos.y] = board[blankPos.x][blankPos.y - 1];
    board[blankPos.x][blankPos.y - 1] = null;
  } else if (move === LEFT) {
    board[blankPos.x][blankPos.y] = board[blankPos.x + 1][blankPos.y];
    board[blankPos.x + 1][blankPos.y] = null;
  } else if (move === RIGHT) {
    board[blankPos.x][blankPos.y] = board[blankPos.x - 1][blankPos.y];
    board[blankPos.x - 1][blankPos.y] = null;
  }
}

function isValidMove(board, move) {
  let blankPos = getBlankPosition(board);
  if (move === UP && blankPos.y != BOARDHEIGHT - 1) {
    return true;
  } else if (move === DOWN && blankPos.y != 0) {
    return true;
  } else if (move === LEFT && blankPos.x != BOARDWIDTH - 1) {
    return true;
  } else if (move === RIGHT && blankPos.x != 0) {
    return true;
  }

  return false;
}

function getRandomMove(board, lastMove) {
  let validMoves = [UP, DOWN, LEFT, RIGHT];
  let index;

  if (lastMove === UP || !isValidMove(board, DOWN)) {
    index = validMoves.indexOf(DOWN);
    if (index > -1) validMoves.splice(index, 1);
  }
  if (lastMove === DOWN || !isValidMove(board, UP)) {
    index = validMoves.indexOf(UP);
    if (index > -1) validMoves.splice(index, 1);
  }
  if (lastMove === LEFT || !isValidMove(board, RIGHT)) {
    index = validMoves.indexOf(RIGHT);
    if (index > -1) validMoves.splice(index, 1);
  }
  if (lastMove === RIGHT || !isValidMove(board, LEFT)) {
    index = validMoves.indexOf(LEFT);
    if (index > -1) validMoves.splice(index, 1);
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function convertLeftTopOfTile(tilex, tiley) {
  let left = parseInt(XMARGIN + tilex * TILESIZE + (tilex - 1));
  let top = parseInt(YMARGIN + tiley * TILESIZE + (tiley - 1));
  return {
    left,
    top,
  };
}

function drawTile(tilex, tiley, number, adjx, adjy) {
  let tilePos = convertLeftTopOfTile(tilex, tiley);
  let left = tilePos.left;
  let top = tilePos.top;
  ctx.fillStyle = YELLOW;
  ctx.fillRect(left + adjx, top + adjy, TILESIZE, TILESIZE);

  ctx.font = "25px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(number, left + TILESIZE / 2 + adjx, top + TILESIZE / 2 + adjy);

  if (adjx !== 0 || adjy != 0) {
    // overlay(left + adjx, top + adjy, TILESIZE, TILESIZE);
  }
}

function drawBoard(board) {
  for (let x = 0; x < BOARDWIDTH; x++) {
    for (let y = 0; y < BOARDHEIGHT; y++) {
      if (board[x][y]) drawTile(x, y, board[x][y], 0, 0);
    }
  }
}

function slideAnimation(board, direction, animationSpeed) {
  let blankPos = getBlankPosition(board);
  let movex, movey;

  if (direction === UP) {
    movex = blankPos.x;
    movey = blankPos.y + 1;
  } else if (direction === DOWN) {
    movex = blankPos.x;
    movey = blankPos.y - 1;
  } else if (direction === LEFT) {
    movex = blankPos.x + 1;
    movey = blankPos.y;
  } else if (direction === RIGHT) {
    movex = blankPos.x - 1;
    movey = blankPos.y;
  }

  let coverPos = convertLeftTopOfTile(movex, movey);

  let counter = 0;

  animationLoop(
    board,
    movex,
    movey,
    direction,
    coverPos,
    counter,
    animationSpeed
  );
}

function animationLoop(
  board,
  movex,
  movey,
  direction,
  coverPos,
  counter,
  animationSpeed
) {
  document.removeEventListener("keyup", keyup, true);
  counter += animationSpeed;
  let i = counter;

  ctx.clearRect(coverPos.left, coverPos.top, TILESIZE, TILESIZE);
  //   overlay(coverPos.left, coverPos.top, TILESIZE, TILESIZE);

  if (direction === DOWN) {
    drawTile(movex, movey, board[movex][movey], 0, i);
  }
  if (direction === UP) {
    drawTile(movex, movey, board[movex][movey], 0, -i);
  }
  if (direction === LEFT) {
    drawTile(movex, movey, board[movex][movey], -i, 0);
  }
  if (direction === RIGHT) {
    drawTile(movex, movey, board[movex][movey], i, 0);
  }

  if (counter === TILESIZE) {
    makeMove(board, direction);
    if (animationSpeed === 8) {
      document.addEventListener("keyup", keyup, true);
    }
  }

  if (counter < TILESIZE) {
    requestAnimationFrame(() =>
      animationLoop(
        board,
        movex,
        movey,
        direction,
        coverPos,
        counter,
        animationSpeed
      )
    );
  }
}

function generateNewPuzzle(numSlides) {
  let sequence = new Array();
  let animationSpeed = TILESIZE / 3;
  let lastMove = null;

  let board = getStartingBoard();

  drawBoard(board);

  let counter = 0;

  generatePuzzleAnimation(board, sequence, lastMove, counter, animationSpeed);

  return board;
}

function generatePuzzleAnimation(
  board,
  sequence,
  lastMove,
  counter,
  animationSpeed
) {
  counter += 1;
  let move = getRandomMove(board, lastMove);
  slideAnimation(board, move, animationSpeed);
  lastMove = move;
  sequence.push(move);

  setTimeout(() => {
    if (counter === 80) {
      document.addEventListener("keyup", keyup, true);
    }
  }, 1000 / 15);

  if (counter < 80) {
    setTimeout(() => {
      requestAnimationFrame(() =>
        generatePuzzleAnimation(
          board,
          sequence,
          lastMove,
          counter,
          animationSpeed
        )
      );
    }, 1000 / 15);
  }
}

const keyup = (key) => {
  if (key.code === "ArrowUp") {
    if (isValidMove(board, UP)) slideAnimation(board, UP, 8);
  } else if (key.code === "ArrowDown" && isValidMove(board, DOWN)) {
    slideAnimation(board, DOWN, 8);
  } else if (key.code === "ArrowLeft" && isValidMove(board, LEFT)) {
    slideAnimation(board, LEFT, 8);
  } else if (key.code === "ArrowRight" && isValidMove(board, RIGHT)) {
    slideAnimation(board, RIGHT, 8);
  }
};

let board = generateNewPuzzle(80);

function update() {
  clear();
  drawBoard(board);
  //   overlay(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  requestAnimationFrame(update);
}

update();

