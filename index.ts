import { stdout } from "process";
const keypress = require("keypress");

const hero = "🧑‍";
const boardWidth = 20;
const boardHeight = 10;
const alienSpacing = 2;
const speedInFramesPerSecond = 30;
let numAliens = 50;
const alienZap = "⚡";
let alienZapLocation: [number, number] | null = null;
const alienCols = 10;
let alienIndices: Array<[number, number]> = [];
let alienInertia: number = numAliens / 2;
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

function alienShoots(alienZapLocation: [number, number]) {
    const [x, y] = alienZapLocation;
    if (!isAlien(board[y][x])) {
    }
}
function checkShouldAlienShoot() {
    console.log("alienZapLocation", alienZapLocation);
    if (!alienZapLocation) {
        const randomAlienIndex = Math.floor(
            Math.random() * alienIndices.length
        );
        alienZapLocation = alienIndices[randomAlienIndex];
        alienShoots(alienZapLocation);
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
    alienInertia =
        alienInertia === 0 ? alienIndices.length / 2 : alienInertia - 1;
    if (alienInertia === 0) {
        if (direction === AlienDirection.Right) {
            alienIndices = [];
            board.forEach((boardRow, boardRowIndex) => {
                // move aliens right
                let hasAlien = false;
                const oldAlienRow = boardRow;
                const newAlienRow = [...Array(boardWidth).fill(null)];
                for (let i = 0; i < oldAlienRow.length; i++) {
                    const el = oldAlienRow[i];
                    if (isAlien(el)) {
                        newAlienRow[i + 1] = el;
                        alienIndices.push([i + 1, boardRowIndex]);
                        hasAlien = true;
                    }
                }
                if (hasAlien) {
                    board[boardRowIndex] = newAlienRow;
                }
            });

            // if aliens reach right boundary, set direction left
            if (!canGoRight()) direction = AlienDirection.Left;
        } else if (direction === AlienDirection.Left) {
            alienIndices = [];
            board.forEach((boardRow, boardRowIndex) => {
                let hasAlien = false;
                const oldAlienRow = boardRow;
                const newAlienRow = [...Array(boardWidth).fill(null)];
                for (let i = 0; i < oldAlienRow.length; i++) {
                    const el = oldAlienRow[i];
                    if (isAlien(el)) {
                        newAlienRow[i - 1] = el;
                        alienIndices.push([i - 1, boardRowIndex]);
                        hasAlien = true;
                    }
                }
                if (hasAlien) board[boardRowIndex] = newAlienRow;
            });
            // TODO implement go down
            if (!canGoLeft()) direction = AlienDirection.Right;
        }
        // if (leftMostAlien === 0) direction = AlienDirection.Down;
    } else if (direction === AlienDirection.Down) {
        // move down & reset direction to right
        direction = AlienDirection.Right;
    }
}
function drawBoard() {
    board.forEach((boardRow) => {
        boardRow.forEach((el, rowIndex) => {
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

function init() {
    console.clear();
    for (let y = 0; y <= boardHeight; y++) {
        const alienRow: boardElements[] = [];
        for (let x = 0; x <= boardWidth; x++) {
            if (x <= alienCols && numAliens > 0) {
                const newAlien = new Alien(
                    y % 2 === 0 ? AlienSpecies.A : AlienSpecies.B,
                    x * alienSpacing,
                    y,
                    1,
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

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// main loop
function drawAlienZap() {
    if (alienZapLocation) {
        const [currentX, currentY] = alienZapLocation;
        if (!isAlien(board[currentY][currentX])) {
            board[currentY][currentX] = alienZap;
        }
        if (board[currentY - 1] && !isAlien(board[currentY - 1][currentX])) {
            board[currentY - 1][currentX] = null;
        }

        // board[alienZapLocation[1] - 1][alienZapLocation[0]] = null;

        if (alienZapLocation[1] > boardHeight) {
            board[alienZapLocation[1]][alienZapLocation[0]] = null;
            alienZapLocation = null;
        } else {
            alienZapLocation[1]++;
        }
    }
}

function main() {
    setInterval(function () {
        console.clear();
        drawBoard();
        checkAlienLocation();
        checkShouldAlienShoot();
        drawAlienZap();
    }, 1000 / speedInFramesPerSecond);
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
