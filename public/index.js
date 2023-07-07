const scoreBoard = document.getElementById("scoreBoard");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const socket = io(); // initialize a new socket.io instance by passing the server object

const devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;


let playerIcons = new Array(12);

let imagesLoaded = 0;
for (let i = 0; i < 12; i++) {
  playerIcons[i] = new Image();
  playerIcons[i].src = `./Resources/PNG/${i + 1}.png`;
  playerIcons[i].onload = function () {
    imagesLoaded++;
    if (imagesLoaded == 12) {
      console.log("all player icons loaded");
    }
  };
}

let meteorIcons = new Array(8);

let meteorCnt = 0;
for (let i = 0; i < 8; i++) {
  meteorIcons[i] = new Image();
  meteorIcons[i].src = `./Resources/PNG/Meteors/${i + 1}.png`;
  meteorIcons[i].onload = function () {
    meteorCnt++;
    if (meteorCnt == 8) {
      console.log("all meteor icons loaded");
    }
  };
}

//write better code for this later
let shield = new Image();
let rockets = new Image();
const bgImg = new Image();
bgImg.src = "./Resources/Backgrounds/s1.png";
bgImg.onload = function () {
  console.log("background loaded");
  rockets.src = "./Resources/PNG/Effects/fire08.png";
};
rockets.onload = function () {
  shield.src = "./Resources/PNG/Effects/shield3.png";
};

/* ********************************************************************************** */

const frontendPlayers = {};
let frontendProjectiles = new Array();
let frontendObstacles = {};
let frontendParticles = new Array();

let started = false;
let playerDied = false;
let cam = { x: 0, y: 0 };
const arenaSize ={
  x: 5300,
  y: 3000,
};

socket.on("updatePlayers", (backendPlayers) => {
  if (started) playerDied = socket.id in backendPlayers ? false : true;
  if (playerDied) return;

  const currPLayer = backendPlayers[socket.id];
  cam.x = currPLayer.x - canvas.width / 2; //canvas width can change for different devices, FIX LATER
  cam.y = currPLayer.y - canvas.height / 2;

  if (cam.x < 0) cam.x = 0;
  if (cam.y < 0) cam.y = 0;
  if (cam.x > arenaSize.x - canvas.width) cam.x = arenaSize.x - canvas.width;
  if (cam.y > arenaSize.y - canvas.height) cam.y = arenaSize.y - canvas.height;

  let scores = [];
  for (let id in backendPlayers) {
    scores.push({
      playerScore: backendPlayers[id].score,
      userName: backendPlayers[id].name,
    });
  }
  scores.sort((a, b) => b.playerScore - a.playerScore); //same as b > a

  const scoreBoardSize = (scores.length > 5) ? 5 : scores.length; 
  const scoreBoard = document.getElementById("leaderBoard");
  scoreBoard.innerHTML = "";
  for( let i = 0; i < scoreBoardSize ; i++ ){
    const scoreBoardElem = document.createElement("li");
    const scoreBoardName = document.createElement("mark");
    const scoreBoardScore = document.createElement("small");
    scoreBoardName.innerHTML = scores[i].playerScore;
    scoreBoardScore.innerHTML = scores[i].userName;
    scoreBoardElem.appendChild(scoreBoardName);
    scoreBoardElem.appendChild(scoreBoardScore);
    scoreBoardElem.classList.add("noSelect");
    scoreBoard.appendChild(scoreBoardElem);
  }


  for (let id in backendPlayers) {
    const backendPlayer = backendPlayers[id];

    if (
      //if just enabling it gives a LoL fog of war effect could be cool
      backendPlayer.x < cam.x ||
      backendPlayer.x > cam.x + canvas.width ||
      backendPlayer.y < cam.y ||
      backendPlayer.y > cam.y + canvas.height
    ) {
      if (frontendPlayers[id]) {
        //if player isnt in viewport anymore, remove them
        frontendPlayers[id].nameTag.elem.remove();
        frontendPlayers[id].hpBar.elem.remove();
        delete frontendPlayers[id];
      }
      continue; //only render players that are in the viewport
    }

    if (!frontendPlayers[id]) {
      frontendPlayers[id] = new Player(
        backendPlayer.x,
        backendPlayer.y,
        20,
        backendPlayer.icon,
        backendPlayer.hp,
        backendPlayer.name
      );
    } else {
      //player interpolation to smooth out movement during lag
      // gsap.to(frontendPlayers[id], {
      //   // x: backendPlayer.x,
      //   // y: backendPlayer.y,
      //   duration: 0.015,
      //   ease: "linear",
      // });

      frontendPlayers[id].x = backendPlayer.x;
      frontendPlayers[id].y = backendPlayer.y;
      frontendPlayers[id].angle = backendPlayer.angle;
      frontendPlayers[id].velocity = backendPlayer.velocity;
      frontendPlayers[id].hp = backendPlayer.hp;
    }
  }
});

socket.on("playerDisconnected", (id) => {
  if (frontendPlayers[id]) {
    frontendPlayers[id].nameTag.elem.remove();
    frontendPlayers[id].hpBar.elem.remove();
    delete frontendPlayers[id];
  }
});

socket.on("playerKilled", (id) => {
  if (frontendPlayers[id]) {
    frontendPlayers[id].nameTag.elem.remove();
    frontendPlayers[id].hpBar.elem.remove();
    delete frontendPlayers[id];
  }
});

socket.on("updateProjectiles", (backendProjectiles) => {
  frontendProjectiles = backendProjectiles;
});

socket.on("updateObstacles", (backendObstacles) => {
  frontendObstacles = backendObstacles;
});

socket.on("hit", (backendHitLocation) => { 
  // const hitSfx = new Audio("./Resources/Bonus/sfx_sounds_damage1.ogg");
  // hitSfx.play();
  for(let i=0;i<15;i++){
    frontendParticles.push(new Particle(backendHitLocation));
  }
});
  

function start(name) {
  if (name == "") name = "Orbitter";
  socket.emit("new player", {
    devicePixelRatio,
    name,
  });
  started = true;
  animate();
}

function reset(name) {
  start(name);
  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "none";
  score = 0;
  scoreBoard.innerHTML = "Score: " + score;
  playerDied = false;
  animate();
}

function gameOver() {
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
  if (start && playerDied) {
    gameOver();
    cancelAnimationFrame(animationID); //stops animation loop at current frame
    return;
  }

  context.fillRect(0, 0, canvas.width, canvas.height); //clears canvas each time to redraw player and projectiles in new position

  context.drawImage(
    bgImg,
    cam.x,
    cam.y,
    4000, 
    2200,
    0,
    0,
    canvas.width,
    canvas.height, 
  );

  for (let i = 0; i < frontendProjectiles.length; i++) {
    const frontendProjectile = frontendProjectiles[i];
    if (
      frontendProjectile.x < cam.x ||
      frontendProjectile.x > cam.x + canvas.width ||
      frontendProjectile.y < cam.y ||
      frontendProjectile.y > cam.y + canvas.height
    ) {
      continue; //only render players that are in the viewport
    }
    context.save();
    context.translate(
      frontendProjectile.x - cam.x,
      frontendProjectile.y - cam.y
    );
    context.rotate(frontendProjectile.angle + 1.5708);
    context.drawImage(rockets, -2.5, -5, 5, 25);
    context.restore();
  }

  // for (let i = 0; i < frontendObstacles.length; i++) {
  for(let id in frontendObstacles){ 
    const frontendObstacle = frontendObstacles[id];
    if (!frontendObstacle) continue; //if obstacle is destroyed, skip it (undefined
    if (
      frontendObstacle.x < cam.x ||
      frontendObstacle.x > cam.x + canvas.width ||
      frontendObstacle.y < cam.y ||
      frontendObstacle.y > cam.y + canvas.height
    ) {
      continue; //only render players that are in the viewport
    }

    context.drawImage(
      meteorIcons[frontendObstacle.icon],
      frontendObstacle.x - frontendObstacle.radius - cam.x,
      frontendObstacle.y - frontendObstacle.radius - cam.y,
      frontendObstacle.radius * 2,
      frontendObstacle.radius * 2
    );
  }

  for (let i = 0; i < frontendParticles.length; i++) {
    const frontendParticle = frontendParticles[i];
    if (!frontendParticle) continue; //if obstacle is destroyed, skip it (undefined
    if (
      frontendParticle.x < cam.x ||
      frontendParticle.x > cam.x + canvas.width ||
      frontendParticle.y < cam.y ||
      frontendParticle.y > cam.y + canvas.height
    ) {
      continue; //only render players that are in the viewport
    }
    if(frontendParticle.radius <= 1){
      frontendParticles.splice(i, 1); //removes projectile from array
    }
    frontendParticle.update();
  }

  for (let id in frontendPlayers) {
    frontendPlayers[id].updateDirection(cam);
  }
}
