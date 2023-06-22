const canvas = document.querySelector("canvas");
const scoreBoard = document.getElementById("scoreBoard");

const socket = io(); // initialize a new socket.io instance by passing the server object

const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//to get center of screen regardless of screen size
const x = canvas.width / 2;
const y = canvas.height / 2;

let score = 0;

let shield = new Image();
let playerIcon = new Image();
let rockets = new Image();
let meteors = new Image();
meteors.src = "./Resources/PNG/Meteors/meteorBrown_big1.png";

meteors.onload = function () {
  rockets.src = "./Resources/PNG/Effects/fire08.png";
};
rockets.onload = function () {
  shield.src = "./Resources/PNG/Effects/shield3.png";
};
shield.onload = function () {
  playerIcon.src = "./Resources/PNG/playerShip1_orange.png";
};

playerIcon.onload = function () {
  scoreBoard.innerHTML = "Score: " + score;
};

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.angle = -1.5708;
    this.velocity = {
      x: 0,
      y: 0,
    };
  }

  draw() {
    //draws player at x and y coordinatess
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
    // context.drawImage(playerIcon,x - 50,y  - 50);
  }

  updateDirection() {
    //updates player direction based on mouse movemnt
    let angleInRadians = this.angle + 1.5708;
    // this.draw();  //hitbox
    if( (this.x + this.velocity.x < canvas.width - this.radius) && (this.x + this.velocity.x > this.radius)) 
      this.x = this.x + this.velocity.x;
    if( (this.y + this.velocity.y < canvas.height - this.radius) && (this.y + this.velocity.y > this.radius) )
      this.y = this.y + this.velocity.y;
    context.translate(this.x, this.y);
    context.rotate(angleInRadians);
    context.drawImage(playerIcon,-this.radius/2,-this.radius/2,this.radius,this.radius);
    context.drawImage(shield, -this.radius, -this.radius, this.radius*2, this.radius*2);
    context.rotate(-angleInRadians);
    context.translate(-this.x, -this.y);
  }
}
const player = new Player(x, y, 30, "blue");
const players = {};

socket.on("updatePlayers", (backendPlayers) => {
  for(let id in backendPlayers){
    const player = backendPlayers[id];  

    if(!players[id]){
      players[id] = new Player(player.x, player.y, 30, "blue");
    }

    //optimise this later 
    for(const id in players){
      if(!backendPlayers[id]){
        delete players[id];
      }
    }

  }
  console.log(players);
});


let animationId;
function animate() {
  //animation loop
  animationID = requestAnimationFrame(animate);

  context.fillStyle = `rgba(0, 0, 0, 0.3`; //sin wave opacity to create rocket flames effect

  context.fillRect(0, 0, canvas.width, canvas.height); //clears canvas each time to redraw player and projectiles in new position

  for(let id in players){
    players[id].updateDirection();
  }

}

addEventListener("mousemove", (event) => {
  const angle = Math.atan2(
    event.clientY - player.y,
    event.clientX - player.x
  );
  player.angle = angle;
});


//player controller
addEventListener('keydown', (event) => {
  if(event.key == 's'){
    player.velocity.y = 2;
  }
});
addEventListener('keydown', (event) => {
  if(event.key == 'w'){
    player.velocity.y = -2;
  }
});
addEventListener('keydown', (event) => {
  if(event.key == 'd'){
    player.velocity.x = 2;
  }
});
addEventListener('keydown', (event) => {
  if(event.key == 'a'){
    player.velocity.x = -2;
  }
});

addEventListener('keyup', (event) => {
  if(event.key == 's'){
    player.velocity.y = 0;
  }
});
addEventListener('keyup', (event) => {
  if(event.key == 'w'){
    player.velocity.y = 0;
  }
});
addEventListener('keyup', (event) => {
  if(event.key == 'd'){
    player.velocity.x = 0;
  }
});
addEventListener('keyup', (event) => {
  if(event.key == 'a'){
    player.velocity.x = 0;
  }
});