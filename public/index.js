const scoreBoard = document.getElementById("scoreBoard");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const socket = io("ws://localhost:3000"); // initialize a new socket.io instance by passing the server object

const devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;


// let score = 0;
// scoreBoard.innerHTML = "Score: " + score;

let playerIcons = new Array(12);

let imagesLoaded = 0;
for (let i = 0; i < 12; i++) {
  playerIcons[i] = new Image();
  playerIcons[i].src = `./Resources/PNG/${i+1}.png`;
  playerIcons[i].onload = function () {
    imagesLoaded++;
    if (imagesLoaded == 12) {
      console.log("all loaded");
    }
  };
}

//write better code for this later
let shield = new Image();
let rockets = new Image();
let meteors = new Image();
meteors.src = "./Resources/PNG/Meteors/meteorBrown_big1.png";
meteors.onload = function () {
  rockets.src = "./Resources/PNG/Effects/fire08.png";
};
rockets.onload = function () {
  shield.src = "./Resources/PNG/Effects/shield3.png";
};

/* ********************************************************************************** */

const frontendPlayers = {};
let frontendProjectiles = new Array();

let started = false;
let playerDied = false;

socket.on("updatePlayers", (backendPlayers) => {
  if(started) playerDied = socket.id in backendPlayers ? false : true;

  for (let id in backendPlayers) {
    const backendPlayer = backendPlayers[id];

    if (!frontendPlayers[id]) {
      frontendPlayers[id] = new Player(backendPlayer.x, backendPlayer.y, 20, backendPlayer.icon,backendPlayer.hp,backendPlayer.name);
    }
    else{
      frontendPlayers[id].x = backendPlayer.x;
      frontendPlayers[id].y = backendPlayer.y;
      frontendPlayers[id].angle = backendPlayer.angle;
      frontendPlayers[id].velocity = backendPlayer.velocity;
      frontendPlayers[id].hp = backendPlayer.hp;
    }

    //optimise this later
    for (const id in frontendPlayers) {
      if (!backendPlayers[id]) {
        frontendPlayers[id].nameTag.elem.remove();
        delete frontendPlayers[id];
      }
    }
  }
});

socket.on("updateProjectiles", (backendProjectiles) => {
  frontendProjectiles = backendProjectiles;
});

function start(name){
  if(name == "") name = 'Orbitter';
  socket.emit("new player",{
    devicePixelRatio,
    name,
  });
  started = true;
  animate();
}

function reset() {
  start();
  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "none";
  score = 0;
  scoreBoard.innerHTML = "Score: " + score;
  playerDied = false;
  animate();
}

function gameOver(){
  const gameoverSfx = new Audio("./Resources/Bonus/sfx_lose.ogg");
  gameoverSfx.play();
  const finalScore = document.getElementById("finalScore");
  finalScore.innerHTML = "Your score was : " + score;
  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "block";
}

let animationId;
function animate() {
  animationID = requestAnimationFrame(animate);
  if(start && playerDied){
    gameOver();
    cancelAnimationFrame(animationID); //stops animation loop at current frame
    return; 
  }
  const img = new Image();
  img.src = "./Resources/Backgrounds/black.png";
  const pat = context.createPattern(img, "repeat");
  context.fillStyle = pat;
  // context.fillStyle = `rgba(0, 0, 0, 0.3`; 

  context.fillRect(0, 0, canvas.width, canvas.height); //clears canvas each time to redraw player and projectiles in new position

  frontendProjectiles.forEach((frontendProjectile) => {
    context.save();
    context.translate(frontendProjectile.x, frontendProjectile.y);
    context.rotate(frontendProjectile.angle + 1.5708);
    context.drawImage(rockets, -2.5, -5, 5, 25);
    context.restore();
  });

  for (let id in frontendPlayers) {
    frontendPlayers[id].updateDirection();  
  }
}
