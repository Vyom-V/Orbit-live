const scoreBoard = document.getElementById("scoreBoard");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const socket = io(); // initialize a new socket.io instance by passing the server object

const devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

//to get center of screen regardless of screen size
const x = canvas.width / 2;
const y = canvas.height / 2;


let score = 0;
scoreBoard.innerHTML = "Score: " + score;

let playerIcons = new Array(12);

let imagesLoaded = 0;
for (let i = 0; i < 12; i++) {
  playerIcons[i] = new Image();
  playerIcons[i].src = `./Resources/PNG/${i+1}.png`;
  playerIcons[i].onload = function () {
    imagesLoaded++;
    if (imagesLoaded == 12) {
      allLoaded();
    }
  };
}

function allLoaded() {
  console.log("all loaded");
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

const player = new Player(x, y, 30, 2);
const frontendPlayers = {};

socket.on("updatePlayers", (backendPlayers) => {
  for (let id in backendPlayers) {
    const backendPlayer = backendPlayers[id];

    if (!frontendPlayers[id]) {
      frontendPlayers[id] = new Player(backendPlayer.x, backendPlayer.y, 30, backendPlayer.icon);
    }
    else{
      frontendPlayers[id].x = backendPlayer.x;
      frontendPlayers[id].y = backendPlayer.y;
    }

    //optimise this later
    for (const id in frontendPlayers) {
      if (!backendPlayers[id]) {
        delete frontendPlayers[id];
      }
    }
  }
});

let animationId;
function animate() {
  animationID = requestAnimationFrame(animate);

  
  const img = new Image();
  img.src = "./Resources/Backgrounds/black.png";
  const pat = context.createPattern(img, "repeat");
  context.fillStyle = pat;
  // context.fillStyle = `rgba(0, 0, 0, 0.3`; 

  context.fillRect(0, 0, canvas.width, canvas.height); //clears canvas each time to redraw player and projectiles in new position

  for (let id in frontendPlayers) {
    frontendPlayers[id].updateDirection();  
  }
}


//player rotation
addEventListener("mousemove", (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
  player.angle = angle;
});

//player controller
addEventListener("keydown", (event) => {
  if (event.key == "s") {
    socket.emit("movement", 's');
    // player.velocity.y = 2;
  }
  if (event.key == "w") {
    socket.emit("movement", 'w');
    // player.velocity.y = -2;
  }
  if (event.key == "d") {
    socket.emit("movement", 'd');
    // player.velocity.x = 2;
  }
  if (event.key == "a") {
    socket.emit("movement",'a');
    // player.velocity.x = -2;
  }
});

addEventListener("keyup", (event) => {
  if (event.key == "s") {
    player.velocity.y = 0;
  }
  if (event.key == "w") {
    player.velocity.y = 0;
  }
  if (event.key == "d") {
    player.velocity.x = 0;
  }
  if (event.key == "a") {
    player.velocity.x = 0;
  }
});
