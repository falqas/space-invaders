// Full repo at https://github.com/falqas/space-invaders/

import { stdout } from 'process';
// @ts-ignore
import keypress from 'keypress'; // older package, no typescript support

// Shows debug info in the console, slower frame rate
const isDebugEnabled = true;

// Might encounter some squished aliens if your terminal font is not monospaced
const hero = '🧑‍';
enum AlienSpecies {
  A = '👾',
  B = '🛸',
}
const alienZap = '⚡';
const heroZap = '🔺';
const collision = '💥';
const boardWidth = 35;
const boardHeight = 10;
const alienCols = 10;
const alienSpacing = 2; // Ensure that alienSpacing is less than boardWidth / alienCols
const speedInFramesPerSecond = isDebugEnabled ? 20 : 30;
const numAliens = 50;
let heroIndex = Math.floor(boardWidth / 2);
let quote: string = '';
let alienIndices: Array<[number, number]> = [];
let alienZapLocation: [number, number] | null = null;
let alienInertia: number = numAliens / 2;
let alienZapInertia: number = Math.round(numAliens / 5);
let heroZapLocation: [number, number] | null = null;
let score = 0;

enum AlienDirection {
  Left,
  Right,
  Down,
}

// Vastly simplified alien class from initial design!
class Alien {
  species: AlienSpecies;
  constructor(species: AlienSpecies) {
    this.species = species;
  }
}

type boardElements = Alien | string | null;
const board: Array<boardElements[]> = [];

let direction = AlienDirection.Right;

// Initializes board with aliens and hero, then starts main game loop
function init() {
  let numAliensToSpawn = numAliens;
  for (let y = 0; y < boardHeight; y++) {
    const alienRow: boardElements[] = [];
    for (let x = 0; x < boardWidth; x++) {
      if (x < alienCols && numAliensToSpawn > 0) {
        const newAlien = new Alien(
          y % 2 === 0 ? AlienSpecies.A : AlienSpecies.B
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
  board.push(heroRow);
  placeHero();
  main();
}

init();

// Make process.stdin begin emitting "keypress" events
keypress(process.stdin);

// Listen for "keypress" event
process.stdin.on('keypress', function (_, key) {
  if (key) {
    switch (key.name) {
      case 'left':
        moveHero('left');
        break;
      case 'right':
        moveHero('right');
        break;
      case 'space':
        heroShoots();
        break;
      // Quit on ctrl-c
      case key.ctrl && 'c':
        console.log('Invade again sometime!');
        process.stderr.write('\x1B[?25h'); // Show terminal cursor
        process.exit();
    }
  }
});

// Required for vscode debugging
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stderr.write('\x1B[?25l'); // Hide terminal cursor

// Main game loop
function main() {
  // We use setInterval to run the main loop 30 times a second
  setInterval(function () {
    // Clear the console for the illusion of animation
    console.clear();
    console.log('Score', score);
    drawBoard();
    if (shouldAliensMove()) {
      moveAliens();
    }
    if (shouldAlienShoot()) {
      alienShoots();
    }
    if (isHeroHit()) {
      showHeroCollision();
      placeHero();
    }
    if (isAlienHit()) {
      showAlienCollision();
    }
    if (shouldMoveAlienZap()) {
      moveAlienZap();
    }
    if (heroZapLocation) {
      moveHeroZap();
    }
    if (alienIndices.length === 0) {
      playerWins();
    }
    if (isDebugEnabled) {
      logDebugInfo();
    }
  }, 1000 / speedInFramesPerSecond);
}

// Draw each element in the board
function drawBoard() {
  // The board is a 2D array, so we iterate using 2 nested loops
  board.forEach((boardRow) => {
    boardRow.forEach((el) => {
      if (isAlien(el)) {
        stdout.write(el.species);
      } else if (el === null) {
        // Print a space for null elements; try double-spacing in case aliens are squished
        stdout.write('  ');
      } else {
        stdout.write(el);
      }
    });
    // New line after each row
    stdout.write('\n');
  });
}

// Determine whether aliens should move, based on value of alienInertia
function shouldAliensMove() {
  // Derived from number of aliens on board
  if (alienInertia === 0) {
    // Reset alienInertia
    alienInertia = Math.round(alienIndices.length / 2);
    return true;
  } else {
    alienInertia -= 1;
    return false;
  }
}

function moveAliens() {
  // Go right until reach border, then go left until reach border, repeat
  if (alienInertia < 0) debugger;
  if (!canGoRight()) direction = AlienDirection.Left;
  if (!canGoLeft()) direction = AlienDirection.Right;
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
}

function getNextAlienIndex(currentX: number, currentY: number) {
  if (direction === AlienDirection.Right) {
    return [currentX + 1, currentY];
  }
  if (direction === AlienDirection.Left) {
    return [currentX - 1, currentY];
  }
  return [currentX, currentY];
}

// Determine whether alienZap should move, based on value of alienZapInertia
function shouldMoveAlienZap() {
  // Similar to shouldAliensMove, but for alienZap
  if (alienZapInertia <= 1 && alienZapLocation) {
    // Reset alienZapInertia
    alienZapInertia = Math.round(numAliens / 5);
    return true;
  } else {
    alienZapInertia -= 1;
    return false;
  }
}

function isAlien(el: boardElements): el is Alien {
  return (el as Alien)?.species !== undefined;
}

function alienShoots() {
  const randomAlienIndex = Math.floor(
    Math.random() * alienIndices.length
  );
  alienZapLocation = alienIndices[randomAlienIndex];
}

function shouldAlienShoot() {
  if (!alienZapLocation && alienInertia === 0) {
    return true;
  } else {
    return false;
  }
}

function isHeroHit() {
  if (
    alienZapLocation &&
    alienZapLocation[0] === heroIndex &&
    alienZapLocation[1] === boardHeight
  ) {
    return true;
  }
  return false;
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

function moveAlienZap() {
  if (alienZapLocation) {
    // If alien zap is at the bottom of the board, remove it from the board and reset alienZapLocation
    if (alienZapLocation[1] >= boardHeight) {
      board[alienZapLocation[1]][alienZapLocation[0]] = null;
      alienZapLocation = null;
      return;
    } else {
      alienZapLocation[1]++;
    }

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
  }
}

// Move hero left or right
function moveHero(dir: string) {
  const heroRow = board[board.length - 1];
  if (dir === 'left') {
    // If at edge, do nothing
    if (heroIndex === 0) return;
    heroRow[heroIndex] = null;
    heroIndex--;
  }
  if (dir === 'right') {
    if (heroIndex === heroRow.length - 1) return;
    heroRow[heroIndex] = null;
    heroIndex++;
  }
  board[board.length - 1][heroIndex] = hero;
}

// Position hero centered at bottom of board
function placeHero() {
  const heroRow = [...Array(boardWidth).fill(null)];
  heroIndex = Math.floor(boardWidth / 2);
  heroRow[heroIndex] = hero;
  board[board.length - 1] = heroRow;
}

// Display collision animation and inspirational quote. Completely unnecessary.
function showHeroCollision() {
  process.stdout.moveCursor(heroIndex, -1);
  process.stdout.write(collision + '\n\n');
  quote = getInspirationalQuote();
  console.log(`Try again! ${quote}`);
  sleep(1500);
}

function heroShoots() {
  if (heroZapLocation) return; // Only one zap should exist at a time
  heroZapLocation = [heroIndex, board.length - 2];
}

function isOutOfBounds(x: number, y: number) {
  if (x <= 0 || x >= boardWidth) return true;
  if (y <= 0 || y >= boardHeight) return true;
  return false;
}

function moveHeroZap() {
  if (!heroZapLocation) return;
  if (isOutOfBounds(heroZapLocation[0], heroZapLocation[1])) {
    board[heroZapLocation[1]][heroZapLocation[0]] = null;
    heroZapLocation = null;
    return;
  } else {
    board[heroZapLocation[1]][heroZapLocation[0]] = null;
    heroZapLocation[1]--;
    board[heroZapLocation[1]][heroZapLocation[0]] = heroZap;
  }
}

function isAlienHit() {
  return alienIndices.find(([alienX, alienY]) => {
    if (heroZapLocation) {
      return (
        alienX === heroZapLocation[0] && alienY === heroZapLocation[1]
      );
    }
  });
}

function showAlienCollision() {
  if (!heroZapLocation) return;
  board[heroZapLocation[1]][heroZapLocation[0]] = collision;
  score++;
  heroZapLocation = null;
}

function playerWins() {
  console.log('You win!');
  process.exit();
}

// Pause for ms milliseconds
function sleep(ms: number) {
  const start = Date.now();
  while (Date.now() < start + ms);
}

// Displays a silly inpirational quote at random
// Motivation is important while debugging! :)
function getInspirationalQuote() {
  const quotes = [
    'We may encounter many defeats but we must not be defeated.',
    'Fall seven times, stand up eight.',
    'Don’t let yesterday take up too much of today.',
    'It’s not whether you get knocked down, it’s whether you get up.',
    'People who are crazy enough to think they can change the world, are the ones who do.',
    'Failure will never overtake me if my determination to succeed is strong enough.',
    'Knowing is not enough; we must apply. Wishing is not enough; we must do.',
    'We generate fears while we sit. We overcome them by action.',
    'Whether you think you can or think you can’t, you’re right.',
    'Security is mostly a superstition. Life is either a daring adventure or nothing.',
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function logDebugInfo() {
  console.log('\n');
  console.log('-----------');
  console.log('Debug info:');
  console.log('-----------');
  console.log('numAliens', numAliens);
  console.log('alienInertia', alienInertia);
  console.log('direction', direction);
  console.log('alienZapInertia', alienZapInertia);
  console.log('alienZapLocation', alienZapLocation);
  console.log('heroIndex', heroIndex);
  console.log('alienIndices.length', alienIndices.length);
  console.log('alienIndices', alienIndices);
  console.log('\n');
  console.log(quote);
}

/* Ideas for improvement:
- Add number of lives for hero
- Add difficulty option (affecting speed of aliens and zaps)
- Add High Scores table
- Add bonus ufo that appears randomly and moves faster, higher points if hit
- Add barriers that aliens & hero can hide behind, are breakable
- Add ability for aliens to move down a row when they reach the edge
- Add sound in the form of bloops and bleeps
- Add better board visualization in debugger
- Use params rather than global vars (seemed fine for this small program)
- Add unit tests
*/
