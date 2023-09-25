import { stdout } from 'process';
// @ts-ignore
import keypress from 'keypress'; // older package, no typescript support

const hero = '🧑‍';
const boardWidth = 35;
const boardHeight = 10;
const alienCols = 10;
const alienSpacing = 2; // Ensure that alienSpacing is less than boardWidth / alienCols
const speedInFramesPerSecond = 30;
const alienZap = '⚡';
const numAliens = 50;
const isDebugEnabled = true;

let alienIndices: Array<[number, number]> = [];
let alienZapLocation: [number, number] | null = null;
let alienInertia: number = numAliens / 2;

enum AlienSpecies {
  A = '👾',
  B = '🛸',
}
enum AlienDirection {
  Left,
  Right,
  Down,
}
let direction = AlienDirection.Right;

// Main game loop
function main() {
  // We use setInterval to run the main loop 30 times a second
  setInterval(function () {
    // Clear the console for the illusion of animation
    console.clear();
    drawBoard();
    moveAliens();
    checkShouldAlienShoot();
    drawAlienZap();
    if (isDebugEnabled) {
      logDebugInfo();
    }
  }, 1000 / speedInFramesPerSecond);
}

function shouldAliensMove() {
  // Determine whether aliens should move
  // Based on value of alienInertia
  if (alienInertia === 0) {
    // Reset alienInertia
    alienInertia = alienIndices.length / 2;
    return true;
  } else {
    alienInertia -= 1;
    return false;
  }
}
function getNextAlienIndex(currentX: number, currentY: number) {
  if (direction === AlienDirection.Right) {
    return [currentX + 1, currentY];
  }
  if (direction === AlienDirection.Left) {
    return [currentX - 1, currentY];
  }
  return [currentX - 1, currentY];
}
function moveAliens() {
  // Go right until at border, then go left until at border, repeat
  if (!canGoRight()) direction = AlienDirection.Left;
  if (!canGoLeft()) direction = AlienDirection.Right;
  if (shouldAliensMove()) {
    const newAlienIndices: Array<[number, number]> = [];
    // Iterate through board.length - 1, bc last row is hero
    for (let i = 0; i < board.length - 1; i++) {
      const boardRowIndex = i;
      const oldAlienRow = board[boardRowIndex];
      // Create a new row to replace the old row, prefilled with null
      const newAlienRow = [...Array(boardWidth).fill(null)];
      for (let j = 0; j < oldAlienRow.length; j++) {
        const el = oldAlienRow[j];
        // We only want to move aliens, no other elements
        if (isAlien(el)) {
          // Get the next location of each alien after moving
          const [nextX, _] = getNextAlienIndex(j, boardRowIndex);
          newAlienRow[nextX] = el;
          newAlienIndices.push([nextX, boardRowIndex]);
        }
        board[boardRowIndex] = newAlienRow;
      }
    }

    // Reassign alienIndices
    alienIndices = newAlienIndices;
    // TODO implement go down
    //   if (!canGoLeft()) direction = AlienDirection.Right;
    // }
  }
}

function drawBoard() {
  // Draw each element in the board
  // The board is a 2D array, so we iterate using 2 nested loops
  board.forEach((boardRow) => {
    boardRow.forEach((el) => {
      if (isAlien(el)) {
        stdout.write(el.species);
      } else if (el === null) {
        stdout.write(' ');
      } else {
        stdout.write(el);
      }
    });
    // New line after each row
    stdout.write('\n');
  });
}
class Alien {
  species: AlienSpecies;
  xLocation: number;
  yLocation: number;
  initialSpeed: number;
  isAlive: boolean;
  directon: AlienDirection; // not all aliens need this in retrospect, only first and last in a row
  constructor(
    species: AlienSpecies,
    xLocation: number,
    yLocation: number,
    initialSpeed = 1,
    isAlive = true,
    direction = AlienDirection.Right
  ) {
    this.species = species;
    this.xLocation = xLocation;
    this.yLocation = yLocation;
    this.initialSpeed = initialSpeed;
    this.isAlive = isAlive;
    this.directon = direction;
  }
}

type boardElements = Alien | string | null;
const board: Array<boardElements[]> = [];

function isAlien(el: boardElements): el is Alien {
  return (el as Alien)?.species !== undefined;
}

function alienShoots(alienZapLocation: [number, number]) {
  const [x, y] = alienZapLocation;
  if (!isAlien(board[y][x])) {
  }
}
function checkShouldAlienShoot() {
  if (!alienZapLocation) {
    const randomAlienIndex = Math.floor(
      Math.random() * alienIndices.length
    );
    alienZapLocation = alienIndices[randomAlienIndex];
    alienShoots(alienZapLocation);
  }
}

function canGoRight() {
  // Check if aliens have room to go right
  const collen = board.length;
  const rowlen = board[0].length;
  for (let i = 0; i < collen; i++) {
    if (isAlien(board[i][rowlen - 1])) return false;
  }
  return true;
}

function canGoLeft() {
  // Check if aliens have room to go right
  const collen = board.length;
  for (let i = 0; i < collen; i++) {
    if (isAlien(board[i][0])) return false;
  }
  return true;
}

// Make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

function drawAlienZap() {
  if (alienZapLocation) {
    const [currentX, currentY] = alienZapLocation;

    // Display alien zap if there is no alien in the way
    if (!isAlien(board[currentY][currentX])) {
      board[currentY][currentX] = alienZap;
    }

    // Remove alien zap from previous location (because it "moved" down)
    if (
      board[currentY - 1] &&
      !isAlien(board[currentY - 1][currentX])
    ) {
      board[currentY - 1][currentX] = null;
    }

    // If alien zap is at the bottom of the board, remove it from the board and reset alienZapLocation
    if (alienZapLocation[1] >= boardHeight) {
      board[alienZapLocation[1]][alienZapLocation[0]] = null;
      alienZapLocation = null;
    } else {
      alienZapLocation[1]++;
    }
  }
}

function moveHero(dir: string) {
  // move hero left or right
  // check if hero is at edge
  // if at edge, do nothing
  // if not at edge, move hero
  // if keypress left, move hero left
  // if keypress right, move hero right
  const heroRow = board[board.length - 1];
  const heroIndex = heroRow.indexOf(hero);
  if (dir === 'left') {
    if (heroIndex === 0) return;
    heroRow[heroIndex] = null;
    heroRow[heroIndex - 1] = hero;
  }
  if (dir === 'right') {
    if (heroIndex === heroRow.length - 1) return;
    heroRow[heroIndex] = null;
    heroRow[heroIndex + 1] = hero;
  }
}

// listen for the "keypress" event
process.stdin.on('keypress', function (_, key) {
  if (key) {
    switch (key.name) {
      case 'left':
        moveHero('left');
        break;
      case 'right':
        moveHero('right');
        break;
      // Quit on ctrl-c
      case key.ctrl && 'c':
        console.log('Invade again sometime!');
        process.stderr.write('\x1B[?25h'); // Show terminal cursor
        process.exit();
    }
  }
});
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}
process.stdin.resume();
process.stderr.write('\x1B[?25l'); // Hide terminal cursor

function init() {
  let numAliensToSpawn = numAliens;
  for (let y = 0; y < boardHeight; y++) {
    const alienRow: boardElements[] = [];
    for (let x = 0; x < boardWidth; x++) {
      if (x < alienCols && numAliensToSpawn > 0) {
        const newAlien = new Alien(
          y % 2 === 0 ? AlienSpecies.A : AlienSpecies.B,
          x * alienSpacing,
          y,
          1,
          true
        );
        alienRow.push(newAlien);
        alienIndices.push([x, y]);
        const gaps = [...Array(alienSpacing).fill(null)];
        alienRow.push(...gaps);
        numAliensToSpawn--;
      } else {
        alienRow.push(null);
      }
    }
    board.push(alienRow);
  }
  const heroRow = [...Array(boardWidth).fill(null)];
  const heroIndex = Math.floor(boardWidth / 2);
  heroRow[heroIndex] = hero;
  board.push(heroRow);
  main();
}

function logDebugInfo() {
  console.log('\n');
  console.log('-----------');
  console.log('Debug info:');
  console.log('-----------');
  console.log('numAliens', numAliens);
  console.log('alienInertia', alienInertia);
  console.log('direction', direction);
  console.log('alienZapLocation', alienZapLocation);
  console.log('alienIndices.length', alienIndices.length);
  console.log('alienIndices', alienIndices);
}

init();
