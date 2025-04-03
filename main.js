/*Rush Hour
 
 Leonard Kiefner
 Thorben Meier
 Emil Wilde
 
 originally written in Processing in 2022
 translated to JavaScript by Emil Wilde in 2023
 */

const canvas = document.getElementById("canvas");
const context = this.canvas.getContext('2d');
const timerEl = document.getElementById("timer");

//let LEVELS = fetch("./levels.json").then((response) => response.json()).then((json) => LEVELS = json);


var request = new XMLHttpRequest();
request.open("GET", "./levels.json", false);
request.send(null)
const LEVELS = JSON.parse(request.responseText);

const times = [];
var fps = 1;

let LevelMap = new Map(LEVELS["Level" + 1]);

//canvas.width = Math.min(screen.width, 1024);
canvas.width = Math.min(document.documentElement.clientWidth, 1024);
canvas.height = Math.min(document.documentElement.clientHeight, LevelMap.heightPixel - 64);

window.addEventListener("resize", () => {
    canvas.width = Math.min(document.documentElement.clientWidth, 1024);

    //canvas.width = screen.width;
    canvas.height = Math.min(document.documentElement.clientHeight, LevelMap.heightPixel - 64);

    //console.log(screen.width);
    //console.log(canvas.width);
});

// Position of player center in level coordinates
var playerX; var playerY;
// Velocity of player
var playerVX; var playerVY;
// Speed at which the player moves
var playerSpeed = 150;
// The hitbox of the player is a circle and this is its radius
var playerR = 20;

//walking direction of the player, needed to draw different player images based on direction
var w_right = true; //right direction is true for start
var w_left = false; var w_up = false; var w_down = false;

// left / top border of the screen in map coordinates
// used for scrolling
var screenLeftX = 0; var screenTopY = 0;

//countdown timer
var timer;

//game states
var gameState;
const GAMEWAIT = 0; const GAMERUNNING = 1; const GAMEOVER = 2; const GAMEWON = 3; const CAUGHT = 4; const HELP = 5;

//variable storing the collected money
var moneyCount = 0;

//money needed to bribe ticketmen
var bribe = 1;

//lifes of the player
var lifeCount = 3;

//Lists storing ticket inspectors and rats 
var inspectors = [];
var rats = [];

//lifes
const HERZ = new Image(); HERZ.src = "./images/herz.png"; HERZ.width = 55; HERZ.height = 55;
//money
const DOLLAR = new Image(); DOLLAR.src = "./images/dollar.png"; DOLLAR.width = 55; DOLLAR.height = 55;

//different player perspectives
//~ Thorben
const PLAYER_R = new Image(); PLAYER_R.src = "./images/playerR.png";
const PLAYER_L = new Image(); PLAYER_L.src = "./images/playerL.png";
const PLAYER_D = new Image(); PLAYER_D.src = "./images/playerD.png";
const PLAYER_U = new Image(); PLAYER_U.src = "./images/playerU.png";

//start and help screen
const STARTSCREEN = new Image(); STARTSCREEN.src = "./images/startscreen.png"; //~ Leonard
const HELPSCREEN = new Image(); HELPSCREEN.src = "./images/helpscreen.png"; //~ Emil

const SOUNDS = {
    music: new Audio("./sounds/music.mp3"),
    won: new Audio("./sounds/won.wav"),
    gameOver: new Audio("./sounds/gameover.wav"),
    hit: new Audio("./sounds/hit.wav"),
    moneyCollect: new Audio("./sounds/moneyCollect.wav")

}

SOUNDS.music.loop = true;

const soundsArray = Object.values(SOUNDS);
soundsArray.forEach((e) => e.volume = 0.5);

var mute = false;



//gamestate gamewait draws start screen
gameState = GAMEWAIT;
draw();


function newGame(levelNr) {

    //load map
    //let level = LEVELS.Levels[levelNr-1];
    LevelMap = new Map(LEVELS["Level" + levelNr]);

    //clear lists from previous games
    inspectors = [];
    rats = [];

    //player and enemy spawn
    for (let x = 0; x < LevelMap.w; ++x) {
        for (let y = 0; y < LevelMap.h; ++y) {
            //put player at 'S' tile and replace with 'L' (platform line)
            if (LevelMap.at(x, y) == 'S') {
                playerX = LevelMap.centerXOfTile(x);
                playerY = LevelMap.centerYOfTile(y);
                LevelMap.set(x, y, 'L');
            }

            //put ticket inspectors at designated 'K' spawn tiles and replace with 'B' (floor)
            if (LevelMap.at(x, y) == 'K') {
                inspectors.push(new Inspector(LevelMap, LevelMap.centerXOfTile(x), LevelMap.centerYOfTile(y)));
                LevelMap.set(x, y, 'B');
            }
            //put rats at designated 'M' spawn tiles and replace with 'B' (floor)
            if (LevelMap.at(x, y) == 'M') {
                rats.push(new Rat(LevelMap, LevelMap.centerXOfTile(x), LevelMap.centerYOfTile(y)));
                LevelMap.set(x, y, 'B');
            }
        }
    }

    //spawns five money tiles
    for (let i = 0; i < 5; i++) {
        randomSpawn();
    }

    timer = 60; //sets timer to one minute
    lifeCount = 3; //set lifes to 3

    //set player velocity to zero
    playerVX = 0;
    playerVY = 0;
    w_right = true; //player is supposed to move in the right direction

    gameState = GAMERUNNING;
    SOUNDS.music.currentTime = 0;
    SOUNDS.music.play();


}

//spawns money tiles on random places in the map ~ Emil
function randomSpawn() {
    let rndmX = Math.floor(Math.random() * (LevelMap.w - 5)) + 5; //random tile x (constrained so that money doens't spawn directly on the platform)
    let rndmY = Math.floor(Math.random() * (LevelMap.h - 1)) + 1; //random tile y (constrained because top and bottom row of map are walls anyway)

    //if tile with random coordinates is a floor tile and theres no money tile already next to it, it gets replaced with a money tile, if not, the function calls itself again till it finds a floor tile
    if (LevelMap.at(rndmX, rndmY) == 'B' && LevelMap.at(rndmX - 1, rndmY) != 'G' && LevelMap.at(rndmX + 1, rndmY) != 'G' && LevelMap.at(rndmX, rndmY - 1) != 'G' && LevelMap.at(rndmX, rndmY + 1) != 'G') {
        LevelMap.set(rndmX, rndmY, 'G');
    } else randomSpawn();
}

document.onkeydown = (e) => {
    //player controls ~ Thorben
    if (e.key == "ArrowUp" || e.key == 'w') {
        playerVY = -playerSpeed;
        playerVX = 0;
        //set direction so that the correct image can be drawn
        w_up = true;
        w_down = false;
        w_right = false;
        w_left = false;
    } else if (e.key == "ArrowDown" || e.key == 's') {
        playerVY = playerSpeed;
        playerVX = 0;
        w_up = false;
        w_down = true;
        w_right = false;
        w_left = false;
    } else if (e.key == "ArrowLeft" || e.key == 'a') {
        playerVX = -playerSpeed;
        playerVY = 0;
        w_up = false;
        w_down = false;
        w_right = false;
        w_left = true;
    } else if (e.key == "ArrowRight" || e.key == 'd') {
        playerVX = playerSpeed;
        playerVY = 0;
        w_up = false;
        w_down = false;
        w_right = true;
        w_left = false;
    } else if (gameState == CAUGHT) { //caught player options
        if (e.key == 'b' && moneyCount >= bribe) { //bribe inspector, only works if player has enough money
            gameState = GAMERUNNING; //game resumes
            moneyCount -= bribe; //bribe gets subtracted from money count
            bribe *= 2; //bribe gets doubled for next time
        } else if (e.key == 'x' || e.key == 'b' && bribe > moneyCount) { //give up or not enough money
            gameState = GAMEOVER;

            //stop music and play game over sound
            SOUNDS.music.pause();
            SOUNDS.gameOver.play();
        }
    } else if (e.key == 'h' && gameState == GAMEWAIT) { //access helpscreen
        gameState = HELP;
    } else if (e.code == 'Space') { //space key actions depending on gamestate
        if (gameState == GAMEWAIT) { //start game
            newGame(1);
        } else if (gameState == GAMEOVER) { //start new game, reset moneyCount and bribe
            newGame(1);
            moneyCount = 0;
            bribe = 1;
        } else if (gameState == GAMEWON) { //start new game
            newGame(1);
            bribe += 2; //increase bribe to make it a bit harder
        } else if (gameState == HELP) { //go back to start screen
            gameState = GAMEWAIT;
        }
    }

    if (e.key == "m") {

        soundsArray.forEach((sound) => {
            if (mute) sound.volume = 0.5;
            else sound.volume = 0;
        });

        mute = !mute;
    }
};

//stop player when not holding down key anymore
document.onkeyup = (e) => {
    if (e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "a" || e.key == "d") playerVX = 0;
    else if (e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "w" || e.key == "s") playerVY = 0;
};

//collecting money:
//if player gets on money tile, it gets replaced with a normal floor tile and moneyCount is increased
//~ Emil
function collectMoney() {
    let tile = LevelMap.findTileInRect(playerX - playerR, playerY - playerR, 2 * playerR, 2 * playerR, "G");
    if (tile != null) {
        LevelMap.set(tile.x, tile.y, 'B');
        moneyCount += 1;
        //play money sound
        SOUNDS.moneyCollect.play();
    }
}

// update player
//~ Thorben
function updatePlayer() {
    let nextX = playerX + playerVX / fps;
    let nextY = playerY + playerVY / fps;

    //if player runs into wall, train or map edge, stop
    if (LevelMap.testTileInRect(nextX - playerR, nextY - playerR + 2, 2 * playerR, 2 * playerR, "W_RAUCIJOP")) {
        playerVX = 0;
        playerVY = 0;
        nextX = playerX;
        nextY = playerY;
    }

    //if player fully crosses line of E tiles (platform line at the end of the map), the game is won
    if (LevelMap.testTileFullyInsideRect(nextX - playerR, nextY - playerR, 2 * playerR, 2 * playerR, "E")) {
        gameState = GAMEWON;
        //stop background music
        SOUNDS.music.pause();
        //play winning sound
        SOUNDS.won.play();
    }

    //update player position
    playerX = nextX;
    playerY = nextY;
}

function collision() { //~ Thorben

    //collision with one of the inspector pops up "caught"-screen
    for (let i = inspectors.length - 1; i >= 0; i--) {
        if (inspectors[i].collision() == true) {
            gameState = CAUGHT;
            inspectors.splice(i, 1); //remove inspector
            //play hit sound
            SOUNDS.hit.play();
        }
    }
}

function drawPlayer() {  //~ Thorben
    //draw player image based on moving direction
    if (w_right) {
        context.drawImage(PLAYER_R, playerX - screenLeftX - PLAYER_R.width / 2, playerY - screenTopY - PLAYER_R.height / 2);
    } else if (w_left) {
        context.drawImage(PLAYER_L, playerX - screenLeftX - PLAYER_L.width / 2, playerY - screenTopY - PLAYER_L.height / 2);
    } else if (w_down) {
        context.drawImage(PLAYER_D, playerX - screenLeftX - PLAYER_D.width / 2, playerY - screenTopY - PLAYER_D.height / 2);
    } else if (w_up) {
        context.drawImage(PLAYER_U, playerX - screenLeftX - PLAYER_U.width / 2, playerY - screenTopY - PLAYER_U.height / 2);
    }
}

function drawStates() {  //~ Leonard
    context.textAlign = "center";
    document.getElementById("extraText").style.visibility = "visible";
    //GAMEWAIT / Startscreen
    if (gameState == GAMEWAIT) {
        context.drawImage(STARTSCREEN, (canvas.width - STARTSCREEN.width) / 2, (canvas.height - STARTSCREEN.height) / 2);
        /*context.fillStyle = "white";
        context.font = "50px Arial";
        context.fillText("Press SPACE to start!", 2*canvas.width/3+35, canvas.height - 65);
        context.fillStyle = "black";
        context.font = "25px Arial";
        context.fillText("Press H for help", canvas.width / 2, canvas.height - 15);*/
        document.getElementById("timer").innerText = "Press SPACE to start, press H for help";
        document.getElementById("extraText").innerText = "";
        document.getElementById("extraText").style.visibility = "hidden";
    }
    //Game Over
    if (gameState == GAMEOVER) {
        /*context.fillStyle = "#FFE146";
        context.font = "bold 85px Arial";
        context.fillText("Game over!", canvas.width / 2, canvas.height / 2);*/
        if (timer <= 0) {
            document.getElementById("timer").innerText = "Oh no, you missed the subway!";
        } else if (bribe > moneyCount && timer > 0 && lifeCount > 0) {
            document.getElementById("timer").innerText = "You don't have enough money. The inspector sent you back to the previous station.";
        } else if (lifeCount <= 0) {
            document.getElementById("timer").innerText = "You died because of toxic subway rats!";
        }
        document.getElementById("extraText").innerText = "Press SPACE to try again";
    }

    if (gameState == GAMEWON) {
        document.getElementById("timer").innerText = `Great! you caught the subway just in time with ${Math.ceil(timer)} seconds left.`;
        document.getElementById("extraText").innerText = "Press SPACE to go to the next Station";
    }

    //game running
    if (gameState == GAMERUNNING) {
        /*if (timer <= 10) { //when only 10 secons left, draw timer text in red, else in yellow
            context.fillStyle = "red";
        } else
            context.fillStyle = "#FFE146";
        context.font = "bold 40px Arial";
        context.fillText("Train departs in " + Math.round(timer) + " seconds", canvas.width/2, 75);*/

        //lifes counter
        /*context.fillStyle = "rgba(255, 255, 255, 0.28)";
        context.roundRect(canvas.width / 2 - 750/2, canvas.height - 100, 750, 75, 28);
        context.fill();
        context.stroke();
        fill(255);
        textSize(55);
        text("Lifes: ", width / 3 - 80, height - 60);

        if (lifeCount >= 1) { //draw 1st heart only when 1 life left
            image(herz, width / 3 - 10, height - 80);
        }
        if (lifeCount >= 2) { //draw 2nd heart only when 2 lifes left
            image(herz, width / 3 + 40, height - 80);
        }
        if (lifeCount >= 3) { //draw 3rd heart only when 3 lifes left
            image(herz, width / 3 + 90, height - 80);
        }

        //moneycounter
        text("Money: " + moneyCount + "$", 2 * width / 3 - 25, height - 60);
        image(dollar, 2 * width / 3 + 125, height - 80);*/
        document.getElementById("timer").innerText = `Train departs in ${Math.ceil(timer)} seconds`;
        document.getElementById("extraText").innerText = "";
        document.getElementById("extraText").style.visibility = "hidden";
    }

    if (gameState == CAUGHT) {
        document.getElementById("timer").innerText = "You don't have a ticket!";
        document.getElementById("extraText").innerText = `Bribe inspector (${bribe}$): B, Give Up: X`;
    }

    //helpscreen
    if (gameState == HELP) {
        context.drawImage(HELPSCREEN, (canvas.width - STARTSCREEN.width) / 2, (canvas.height - STARTSCREEN.height) / 2);
    }

}

function draw() {

    //context.fillStyle = "black";
    //context.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState == GAMERUNNING) {
        screenLeftX = clamp(playerX - canvas.width / 2, 0, LevelMap.widthPixel - canvas.width); //keep player in horizontal center but avoid scrolling beyond map edges
        screenTopY = clamp(playerY - canvas.height / 2, LevelMap.tileSize / 2, LevelMap.heightPixel - canvas.height - LevelMap.tileSize / 2);

        //screenTopY = (LevelMap.heightPixel - canvas.height) / 2; //keep map in vertical center of the screen

        LevelMap.draw(-screenLeftX, -screenTopY);
        updatePlayer();
        drawPlayer();
        collision();
        collectMoney();

        //draw inspectors
        for (let i = 0; i < inspectors.length; i++) {
            inspectors[i].move();
            inspectors[i].draw();
        }

        //move rats
        for (let i = 0; i < rats.length; i++) {
            rats[i].move();
            rats[i].collisionAction();
            rats[i].draw();
        }

        timer -= 1 / fps; //count down timer

        //game over when timer hits zero or all lifes lost
        if (timer <= 0 || lifeCount <= 0) {
            gameState = GAMEOVER;
            SOUNDS.music.pause();
            SOUNDS.gameOver.play();
        }
    }

    drawStates();

    document.getElementById("lifes").innerText = "Lifes: "+lifeCount;
    document.getElementById("money").innerText = "Money: "+moneyCount+"$";

    requestAnimationFrame(draw);

    // calculate Fps
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) times.shift();
    times.push(now);
    fps = times.length;
    document.getElementById("fpsCounter").innerText = `${fps}`;
}

function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
}

/*function drawMap(leftX, topY) {
    //pushStyle()
    //imageMode(CORNER)

    let startX = Math.floor(-leftX / LevelMap.tileSize);
    let startY = Math.floor(-topY / LevelMap.tileSize);

    for (let y = startY; y < startY + canvas.getBoundingClientRect().height / LevelMap.tileSize + 2; ++y) {
        for (let x = startX; x < startX + canvas.getBoundingClientRect().width / LevelMap.tileSize + 2; ++x) {
            let img = undefined;
            let tile = LevelMap.at(x, y);
            if (tile == '_') img = LevelMap.outsideImage;
            else if ('A' <= tile && tile <= 'Z') img = LevelMap.images[alphabet.indexOf(LevelMap.at(x, y))];
            if (img != undefined) {

                context.drawImage(img, x * LevelMap.tileSize + leftX, y * LevelMap.tileSize + topY, LevelMap.tileSize, LevelMap.tileSize);
            }
        }
    }

    //popStyle()
}*/

