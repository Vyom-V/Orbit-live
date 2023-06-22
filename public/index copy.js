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

let breakAnim1 = new Image();
breakAnim1.src = "./Resources/PNG/Damage/playerShip3_damage3.png";
let breakAnim2 = new Image();
breakAnim2.src = "./Resources/PNG/Damage/playerShip3_damage2.png";
let breakAnim3 = new Image();
breakAnim3.src = "./Resources/PNG/Damage/playerShip3_damage1.png";

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
  // player.draw();
  // animate();
  scoreBoard.innerHTML = "Score: " + score;
  // spawnEnemies();
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

class Projectile {
  constructor(x, y, radius, color, velocity, angle) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity; //object with x and y velocity rates to move at angle
    this.angle = angle;
  }

  draw() {
    // context.beginPath();
    // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    // context.fillStyle = this.color;
    // context.fill();
    context.translate(this.x, this.y);
    context.rotate(this.angle + 1.5708);
    context.drawImage(rockets, -2.5, -5, 5, 25);
    context.rotate(-this.angle - 1.5708);
    context.translate(-this.x, -this.y);
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x * 6;
    this.y = this.y + this.velocity.y * 6;
  }
}

class Enemy {
  //same as projectile but no rotation
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity; //object with x and y velocity rates to move at angle
  }

  draw() {
    context.drawImage(
      meteors,
      this.x-this.radius,
      this.y-this.radius,
      this.radius * 2,
      this.radius * 2
    );
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;
class Particle {
  //same as projectile but no rotation
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity; //object with x and y velocity rates to move at angle
  }

  draw() {
    context.drawImage(
      meteors,
      this.x,
      this.y,
      this.radius * 2,
      this.radius * 2
    );
  }

  update() {
    
    this.radius -= 0.05; //shrinks particles
    this.draw();
    this.velocity.x *= friction; //slows down particles
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const player = new Player(x, y, 30, "blue");

const projectiles = [];
const enemies = [];
const particles = [];

let intervalId;
function spawnEnemies() {
  intervalId = setInterval(() => {
    const radius = Math.random() * (30 - 6) + 6; //random radius between 6 and 30
    let x;
    let y;
    if (Math.random() < 0.5) {
      //left or right side of screen
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius; //either left or right side of screen
      y = Math.random() * canvas.height; //random y coordinate
    } else {
      //top or bottom of screen
      x = Math.random() * canvas.width; //random x coordinate
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius; //either top or bottom of screen
    }
    const color = "green";
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x); //always move towards player
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    const enemy = new Enemy(x, y, radius, color, velocity);
    enemies.push(enemy);
  }, 1000); //new enemy every second
}

function reset() {
  clearInterval(intervalId);
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.velocity.x = 0;
  player.velocity.y = 0;
  player.angle = 0;
  projectiles.splice(0, projectiles.length);
  enemies.splice(0, enemies.length);
  particles.splice(0, particles.length);
  score = 0;
  scoreBoard.innerHTML = "Score: " + score;
}

let animationId;
// var alpha = 0, /// current alpha value
//   delta = 0.2; /// delta = speed

function animate() {
  //animation loop
  animationID = requestAnimationFrame(animate);

  // const img = new Image();
  // img.src = "./Resources/Backgrounds/black.png";
  // const pat = context.createPattern(img, "repeat");
  // context.fillStyle = pat;

  // alpha += delta;
  // if (alpha <= 0 || alpha >= 0.5) delta = -delta;
  // context.fillStyle = `rgba(0, 0, 0, ${alpha})`; //sin wave opacity to create rocket flames effect

  context.fillStyle = `rgba(0, 0, 0, 0.3`; //sin wave opacity to create rocket flames effect

  context.fillRect(0, 0, canvas.width, canvas.height); //clears canvas each time to redraw player and projectiles in new position


  projectiles.forEach((projectile, index) => {
    projectile.update(); //updates projectile position

    //removes projectiles from screen when they go off screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1); //removes projectile from array
      }, 0); //removes projectile from screen on the next frame so no flicker
    }
  });

  particles.forEach((particle, index) => {
    if(particle.radius <= 2){
      particles.splice(index, 1); //removes projectile from array
    }
    particle.update(); //updates projectile position
  });


  enemies.forEach((enemy, index) => {
    enemy.update(); //updates enemy position

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y); //distance between player and enemy on collision
    if (dist - enemy.radius - player.radius < 1) {
      //collision
      const gameoverSfx = new Audio("./Resources/Bonus/sfx_lose.ogg");
      gameoverSfx.play();
      cancelAnimationFrame(animationID); //stops animation loop at current frame
      const finalScore = document.getElementById("finalScore");
      finalScore.innerHTML = "Your score was : " + score;
      const endScreen = document.getElementById("endScreen");
      endScreen.style.display = "block";

    }

    //collision detection btwn enemy and player O(n2) time
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y); //distance between projectile and enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        //create explosions
        for (let i = 0; i < enemy.radius * 1.5; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 5,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6), //directtion and speed
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        //collision
        setTimeout(() => {
          score += 100;
          scoreBoard.innerHTML = "Score: " + score;
          const sfx_hit = new Audio("./Resources/Bonus/hit.mp3");
          sfx_hit.play();
          // if(enemy.radius-10 > 15){
          //   gsap.to(enemy, {radius: enemy.radius-10}); //shrinks enemy on collision

          //   //todo : split enemy into 2 smaller enemies
          //   // setTimeout(() => {
          //   //     enemies.push(new Enemy(enemy.x, enemy.y, enemy.radius /2, enemy.color, enemy.velocity));
          //   //     // enemies.push(new Enemy(enemy.x+10, enemy.y, enemy.radius - 15, enemy.color, enemy.velocity));
          //   //   }, 0);
          // }
          // else

          enemies.splice(index, 1); //removes enemy from array
          projectiles.splice(projectileIndex, 1); //removes projectile from array
        }, 0); //removes enemy and projectile from screen on the next frame so no flicker
      }
    });
  });

  player.updateDirection();
}

window.addEventListener("click", (event) => {
  //need x and y velocity rates to move at angle / direction of click based on players location
  const angle = Math.atan2(
    event.clientY - player.y,
    event.clientX - player.x
  ); //gets angle of click
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  const projectile = new Projectile(player.x, player.y, 5, "red", velocity, angle);
  const sfx_laser = new Audio("./Resources/Bonus/fire.mp3");
  sfx_laser.play();
  projectiles.push(projectile);
});

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