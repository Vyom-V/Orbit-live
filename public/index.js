const scoreBoard = document.getElementById("scoreBoard");
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const statsUi = document.getElementById('statsUi');

const socket = io(); // initialize a new socket.io instance by passing the server object

const devicePixelRatio = window.devicePixelRatio || 1;
// canvas.width = window.innerWidth * devicePixelRatio;
// canvas.height = window.innerHeight * devicePixelRatio;
var dipRect = canvas.getBoundingClientRect();
canvas.width = Math.round(devicePixelRatio * dipRect.right) - Math.round(devicePixelRatio * dipRect.left);
canvas.height = Math.round(devicePixelRatio * dipRect.bottom)- Math.round(devicePixelRatio * dipRect.top);

// ****** Load Resources Images ****** //

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
let engine = new Image();
engine.src = "./Resources/ship/engine.png";
let engineFlame = new Image();
engineFlame.src = "./Resources/ship/engineFlame2.png";
let ship = new Image();
ship.src = "./Resources/ship/ship.png";
let cannon = new Image();
cannon.src = "./Resources/ship/cannon.png";
let bullet = new Image();
bullet.src = "./Resources/ship/rocket.png";
let rock = new Image();
rock.src = "./Resources/asteroids/base.png";

let shield = new Image();
shield.src = "./Resources/PNG/Effects/shield3.png";
let rockets = new Image();
rockets.src = "./Resources/PNG/Effects/fire08.png";
const bgImg = new Image();
bgImg.src = "./Resources/Backgrounds/s1.png";

/* ********  Global Variables  ********* */

const frontendPlayers = {};
let frontendProjectiles = new Array();
let frontendObstacles = {};
let frontendParticles = new Array();
let started = false;
let playerDied = false;
let playerScore = 100;
let cam = { x: 0, y: 0 };


/* ********  Socket Connection and Server Response  ********* */

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
    if(socket.id == id) playerScore = backendPlayers[id].score; //update this player score
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
      if(!backendPlayer.hasJoined) continue;

      frontendPlayers[id] = new Player(
        backendPlayer.x,
        backendPlayer.y,
        20,
        backendPlayer.icon,
        backendPlayer.hp,
        backendPlayer.name,
        backendPlayer.maxHp,
        backendPlayer.rocketPerShoot,
        backendPlayer.availablePoints
      );
    } else {
      //player interpolation to smooth out movement during lag
      // gsap.to(frontendPlayers[id], {
      //   // x: backendPlayer.x,
      //   // y: backendPlayer.y,
      //   duration: 0.015,
      //   ease: "linear",
      // });
      if(!backendPlayer.hasJoined) {
        if(frontendPlayers[id]) {
          frontendPlayers[id].nameTag.elem.remove();
          frontendPlayers[id].hpBar.elem.remove();
          delete frontendPlayers[id];
        }
        continue;
      }
      //use client side prediction ,update angle on client side to avoid jittering
      if(id != socket.id) frontendPlayers[id].angle = backendPlayer.angle;
      frontendPlayers[id].x = backendPlayer.x;
      frontendPlayers[id].y = backendPlayer.y;
      frontendPlayers[id].velocity = backendPlayer.velocity;
      frontendPlayers[id].hp = backendPlayer.hp;
      frontendPlayers[id].maxHp = backendPlayer.maxHp;
      frontendPlayers[id].rocketPerShoot = backendPlayer.rocketPerShoot;
      frontendPlayers[id].availablePoints =  backendPlayer.availablePoints;
    }
  }
});

socket.on("playerDisconnected", (id) => {
  if (frontendPlayers[id]) {
    frontendPlayers[id].nameTag.elem.remove();
    frontendPlayers[id].hpBar.remove();
    delete frontendPlayers[id];
  }
});

socket.on("playerKilled", (id) => {
  if (frontendPlayers[id]) {
    if(id == socket.id) {
      playerDied = true;
      //sound effect
      const gameOverSound = new Audio("./Resources/Bonus/gameover.wav");
      gameOverSound.play();
      gameOver();
      cancelAnimationFrame(animationID); //stops animation loop at current frame
      return;
    }
    frontendPlayers[id].nameTag.elem.remove();
    frontendPlayers[id].hpBar.remove();
    delete frontendPlayers[id];

    statsUi.innerHTML = newStatsUi();

  }
});

socket.on("updateProjectiles", (backendProjectiles) => {
  frontendProjectiles = backendProjectiles;
});

socket.on("getObstacles", (backendObstacles) => {
  frontendObstacles = backendObstacles;
});
socket.on("newObstacle", (obstacle) => {
  frontendObstacles[obstacle.id] = obstacle;
});
socket.on("updateObstacle", (obstacle) => {
  gsap.to(frontendObstacles[obstacle.id], {
      radius: obstacle.radius,
      duration: 0.015,
      ease: "linear",
    });
  // frontendObstacles[obstacle.id].radius = obstacle.radius;
});
socket.on("removeObstacle", (id) => {
  if(frontendObstacles[id]){
    delete frontendObstacles[id];
  }
});

socket.on("hit", (backendHitLocation) => { 
  const hitSfx = new Audio("./Resources/Bonus/hit.mp3");
  hitSfx.play();
  if(
    backendHitLocation.x < cam.x ||
    backendHitLocation.x > cam.x + canvas.width ||
    backendHitLocation.y < cam.y ||
    backendHitLocation.y > cam.y + canvas.height
  ) return; //if hit is outside of viewport, dont render it

  for(let i=0;i<8;i++){
    frontendParticles.push(new Particle(backendHitLocation));
  }
});

socket.on('levelUp' , (id) => {
  if(socket.id != id) return;
  const userPoints = document.getElementById('userPoints');
  
  openUi();
  frontendPlayers[id].availablePoints++;
  userPoints.innerHTML = 'Points: ' + frontendPlayers[id].availablePoints;
  
   setTimeout(() => {
    closeUi();
  }, 5000);
})

socket.on('upgradeSuccessful', (data)=>{
  if(data.id != socket.id) return;

  userPoints.innerHTML = 'Points: ' + frontendPlayers[socket.id].availablePoints;
  const stat = document.getElementById(data.stat);
  const pt = document.createElement('div');
  if(data.stat == 'rocketPerShoot') pt.classList.add('bar2');
  else pt.classList.add('bar');
  stat.appendChild(pt);
  console.log('success');
})

/* ******** Basic Game Functions ********* */


function startCanvas(name) {
  if (name == "") name = "Orbitter";
  socket.emit("new player", {
    devicePixelRatio,
    name,
  });
  started = true;
  animate();
}

function resetCanvas(name) {
  startCanvas(name);
  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "none";
  playerDied = false;
  animate();
}

function gameOver() {
  const gameoverSfx = new Audio("./Resources/Bonus/sfx_lose.ogg");
  gameoverSfx.play();
  const finalScore = document.getElementById("finalScore");
  finalScore.innerHTML = "You Scored: " + playerScore;
  const endScreen = document.getElementById("endScreen");
  endScreen.style.display = "block";
}

function upgrade(stat) {
  socket.emit('upgradeStats',stat.id);
  closeUi();
}
/* ********  Animation Loop  ********* */


//optimise this by splitting into 2 loops, one for rendering and one for updating 
//rendering is done at 60fps, updating is done at 30fps
let animationId;
function animate() {
  animationID = requestAnimationFrame(animate);
  // console.log(animationID);
  context.fillRect(0, 0, canvas.width, canvas.height); //clears canvas each time to redraw player and projectiles in new position

  //Background image

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
      continue; //only render that are in the viewport
    }
    context.save();
    context.translate(
      frontendProjectile.x - cam.x,
      frontendProjectile.y - cam.y
    );
    context.rotate(frontendProjectile.angle + 1.5708);
    context.drawImage(
      bullet,
      0 + (32 + Math.floor((animationID % 40) / 10)),
      0,
      32,
      32,
      -(50 * devicePixelRatio)/2, -70, 50 * devicePixelRatio, 70);
    context.restore();
  }

  for(let id in frontendObstacles){ 
    const frontendObstacle = frontendObstacles[id];
    if (!frontendObstacle) continue; //if obstacle is destroyed, skip it (undefined
    if (
      frontendObstacle.x < cam.x ||
      frontendObstacle.x > cam.x + canvas.width ||
      frontendObstacle.y < cam.y ||
      frontendObstacle.y > cam.y + canvas.height
    ) {
      continue; //only render that are in the viewport
    }

    // drawns hit box
    // context.beginPath();
    // context.arc(frontendObstacle.x - cam.x, frontendObstacle.y - cam.y, frontendObstacle.radius, 0, Math.PI * 2, false);
    // context.fillStyle = "blue";
    // context.fill();
    
    context.drawImage(
      // meteorIcons[frontendObstacle.icon],
      rock,
      frontendObstacle.x - (frontendObstacle.radius * 2.5) - cam.x,
      frontendObstacle.y - (frontendObstacle.radius * 2.5) - cam.y,
      (frontendObstacle.radius * 2.5) * 2,
      (frontendObstacle.radius * 2.5) * 2
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
      frontendParticles.splice(i, 1); //only render that are in the viewport
    }
    if(frontendParticle.radius <= 1){
      frontendParticles.splice(i, 1); //removes projectile from array
    }
    frontendParticle.update();
  }

  for (let id in frontendPlayers) {
    frontendPlayers[id].updateDirection(cam , animationID);
  }
}
