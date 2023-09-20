console.clear();
import { stdout } from "process";
const hero = "🧑🏾‍🚀";
const boardWidth = 30;
const boardHeight = 10;
const alienSpacing = 2;
const speedInFramesPerSecond = 30;
enum AlienSpecies {
    A = "👾",
    B = "🛸",
}
enum AlienDirection {
    Left,
    Right,
    Down,
}
let direction = AlienDirection.Right;

// interface AlienProps {
//     species: AlienSpecies
//     xLocation: number;
//     yLocation: number;
//     initialSpeed: number;
//     isAlive: boolean;
// }
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
// aliens have locationx&y, speed, life/death, shoot
// const aliens = Array(20).fill(alien);
const board: Array<(Alien | null)[]> = [];

function moveAliens(xStep = 0, yStep = 0) {
    board.forEach((boardRow) => {
        boardRow.forEach((el) => {
            if (el !== null) {
                el.xLocation += xStep;
                el.yLocation += yStep;
            }
        });
    });
}

function canGoRight() {
    // check if aliens have room to go right
    const collen = board.length;
    const rowlen = board[0].length;
    for (let i = 0; i < collen; i++) {
        if (board[i][rowlen - 1] !== null) return false;
    }
    return true;
}

function canGoLeft() {
    // check if aliens have room to go right
    const collen = board.length;
    const rowlen = board[0].length;
    for (let i = 0; i < collen; i++) {
        if (board[i][0] !== null) return false;
    }
    return true;
}

function checkAlienLocation() {
    // go right
    // if at border, go left
    // if at border, go down 1
    let leftMostAlien: number | null = null;
    let rightMostAlien: number | null = null;
    // could also use dfs here
    const colLen = boardHeight;
    const rowLen = board[0].length;
    for (let i = 0; i < rowLen; i++) {
        for (let j = 0; j < colLen; j++) {
            const alien = board[j][i];
            if (alien !== null) {
                leftMostAlien = j;
                break;
            }
        }
    }
    for (let i = rowLen - 1; i > 0; i--) {
        for (let j = colLen - 1; j > 0; j--) {
            const alien = board[j][i];
            if (alien !== null) {
                rightMostAlien = j;
                break;
            }
        }
    }
    console.log("1, leftMostAlien", leftMostAlien, rightMostAlien);

    if (direction === AlienDirection.Right) {
        moveAliens(1, 0);
        board.forEach((boardRow) => {
            boardRow.unshift(null);
            boardRow.pop();
        });

        // if aliens reach right boundary, set direction left
        console.log("2 rightMostAlien", rightMostAlien, leftMostAlien);
        if (!canGoRight()) direction = AlienDirection.Left;
    } else if (direction === AlienDirection.Left) {
        moveAliens(-1, 0);
        board.forEach((boardRow) => {
            boardRow.shift();
            boardRow.push(null);
        });
        // TODO implement go down
        if (!canGoLeft()) direction = AlienDirection.Right;
        // if (leftMostAlien === 0) direction = AlienDirection.Down;
    } else if (direction === AlienDirection.Down) {
        // move down & reset direction to right
        moveAliens(0, 1);

        direction = AlienDirection.Right;
    }
}
function drawAliens() {
    const visual = board.map((alienRow) => alienRow.join(","));
    // console.log("alients", aliens);
    board.forEach((boardRow) => {
        boardRow.forEach((el, rowIndex) => {
            // console.log(
            //     "x, y",
            //     alienInstance.xLocation,
            //     alienInstance.yLocation
            // );
            // const leftAlien = alienRow[0];
            // for (let i = 0; i < 100; i++) {
            //     if

            // }
            // for (let i = 0; i < leftMostAlien.xLocation; i++) stdout.write(" ");
            // if (alienInstance.isAlive) {
            // stdout.write(alienInstance.species);
            // }
            if (el !== null) {
                stdout.write(el.species);
            } else {
                stdout.write(" ");
            }
            stdout.write(" ");
        });
        stdout.write("\n");
    });
}

function drawBoard() {}

function init() {
    console.clear();
    const alienRows = 5;
    const alienCols = 10;
    const initialSpeed = 1;
    for (let y = 0; y <= boardHeight; y++) {
        const alienRow: (Alien | null)[] = [];
        for (let x = 0; x <= boardWidth; x++) {
            if (x <= alienCols) {
                const newAlien = new Alien(
                    y % 2 === 0 ? AlienSpecies.A : AlienSpecies.B,
                    x * alienSpacing,
                    y,
                    initialSpeed,
                    true
                );
                alienRow.push(newAlien);
            } else {
                const deadAlien = new Alien(
                    y % 2 === 0 ? AlienSpecies.A : AlienSpecies.B,
                    x * alienSpacing,
                    y,
                    initialSpeed,
                    false
                );
            }
            alienRow.push(null);
        }
        board.push(alienRow);
    }
}
init();
// setInterval(init, 1000);

var i = 0; // dots counter
var left = true;
var keypress = require("keypress");

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// main loop

function main() {
    setInterval(function () {
        // process.stdout.clearLine(); // clear current text
        // process.stdout.cursorTo(0); // move cursor to beginning of line
        // i = (i + 1) % 4;
        // var dots = new Array(i + 1).join(".");
        // process.stdout.write("Waiting" + dots); // write text
        console.clear();
        drawAliens();
        // moveAliens();
        checkAlienLocation();
        // checkCollision()
        // checkLocation
    }, 50);
}
console.log("board", board);
// listen for the "keypress" event
process.stdin.on("keypress", function (_, key) {
    // Quit on ctrl-c
    console.log("keypress", key);
    if (key && key.ctrl && key.name == "c") {
        console.log("Invade again sometime!");
        process.exit();
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();

main();
