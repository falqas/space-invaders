console.clear();
import { stdout } from "process";
const hero = "🧑‍";
const boardWidth = 20;
const boardHeight = 10;
const alienSpacing = 2;
const speedInFramesPerSecond = 30;
let numAliens = 50;
const alienZap = "⚡";
let alienZapLocation: [number, number] | null = null;
const alienCols = 10;
const alienIndices: Array<[number, number]> = [];
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
type boardElements = Alien | string | null;
const board: Array<boardElements[]> = [];

function isAlien(el: boardElements): el is Alien {
    return (el as Alien)?.species !== undefined;
}

function moveAliens(xStep = 0, yStep = 0) {
    board.forEach((boardRow) => {
        boardRow.forEach((el) => {
            if (isAlien(el)) {
                el.xLocation += xStep;
                el.yLocation += yStep;
            }
        });
    });
}

function alienShoots(x: number, y: number) {
    board[y][x] = alienZap;
}
function checkShouldAlienShoot() {
    console.log("alienZapLocation", alienZapLocation);
    if (!alienZapLocation) {
        const randomAlienIndex = Math.floor(
            Math.random() * alienIndices.length
        );
        alienZapLocation = alienIndices[randomAlienIndex];
        alienShoots(alienZapLocation[0], alienZapLocation[1]);
        alienZapLocation[0]--;
    }
}

function canGoRight() {
    // check if aliens have room to go right
    const collen = board.length;
    const rowlen = board[0].length;
    for (let i = 0; i < collen; i++) {
        if (isAlien(board[i][rowlen - 1])) return false;
    }
    return true;
}

function canGoLeft() {
    // check if aliens have room to go right
    const collen = board.length;
    const rowlen = board[0].length;
    for (let i = 0; i < collen; i++) {
        if (isAlien(board[i][0])) return false;
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

    if (direction === AlienDirection.Right) {
        moveAliens(1, 0);
        board.forEach((boardRow) => {
            let hasAlien = false;
            boardRow.forEach((el) => {
                if (isAlien(el)) hasAlien = true;
            });
            if (hasAlien) {
                boardRow.unshift(null);
                boardRow.pop();
            }
        });

        // if aliens reach right boundary, set direction left
        if (!canGoRight()) direction = AlienDirection.Left;
    } else if (direction === AlienDirection.Left) {
        moveAliens(-1, 0);
        board.forEach((boardRow) => {
            let hasAlien = false;
            boardRow.forEach((el) => {
                if (isAlien(el)) hasAlien = true;
            });
            if (hasAlien) {
                boardRow.shift();
                boardRow.push(null);
            }
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
            if (isAlien(el)) {
                stdout.write(el.species);
            } else if (el !== null) {
                stdout.write(el);
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
    const initialSpeed = 1;
    for (let y = 0; y <= boardHeight; y++) {
        const alienRow: boardElements[] = [];
        for (let x = 0; x <= boardWidth; x++) {
            if (x <= alienCols && numAliens > 0) {
                const newAlien = new Alien(
                    y % 2 === 0 ? AlienSpecies.A : AlienSpecies.B,
                    x * alienSpacing,
                    y,
                    initialSpeed,
                    true
                );
                alienRow.push(newAlien);
                alienIndices.push([x, y]);
                numAliens--;
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
}
init();
// setInterval(init, 1000);

var i = 0; // dots counter
var left = true;
var keypress = require("keypress");

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// main loop
function drawAlienZap() {
    if (alienZapLocation) {
        if (!isAlien(board[alienZapLocation[1]][alienZapLocation[0]])) {
            board[alienZapLocation[1]][alienZapLocation[0]] = alienZap;
        }
        alienZapLocation[1]++;
        if (alienZapLocation[1] > boardHeight) {
            alienZapLocation = null;
        }
    }
}

function main() {
    setInterval(function () {
        // process.stdout.clearLine(); // clear current text
        // process.stdout.cursorTo(0); // move cursor to beginning of line
        // i = (i + 1) % 4;
        // var dots = new Array(i + 1).join(".");
        // process.stdout.write("Waiting" + dots); // write text
        console.clear();
        drawAliens();
        drawAlienZap();
        // moveAliens();
        checkAlienLocation();
        checkShouldAlienShoot();
        // checkCollision()
        // checkLocation
    }, 50);
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
    if (dir === "left") {
        if (heroIndex === 0) return;
        heroRow[heroIndex] = null;
        heroRow[heroIndex - 1] = hero;
    }
    if (dir === "right") {
        if (heroIndex === heroRow.length - 1) return;
        heroRow[heroIndex] = null;
        heroRow[heroIndex + 1] = hero;
    }
}

// function handleKeyPress(key: any) {
//     console.log("key", key);
//     if (key.name === "left") {
//         console.log("left");

// listen for the "keypress" event
process.stdin.on("keypress", function (_, key) {
    if (key) {
        switch (key.name) {
            case "left":
                moveHero("left");
                break;
            case "right":
                moveHero("right");
                break;
            // Quit on ctrl-c
            case key.ctrl && "c":
                console.log("Invade again sometime!");
                process.exit();
        }
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();

main();
