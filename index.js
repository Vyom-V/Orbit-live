const canvas = document.querySelector("canvas");
const scoreBoard = document.getElementById("scoreBoard");

canvas.style.overflow = "hidden";
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//to get center of screen regardless of screen size
const x = canvas.width / 2;
const y = canvas.height / 2;

let score = 0;

let breakAnim1 = new Image();
breakAnim1.src = "./PNG/Damage/playerShip3_damage3.png";
let breakAnim2 = new Image();
breakAnim2.src = "./PNG/Damage/playerShip3_damage2.png";
let breakAnim3 = new Image();
breakAnim3.src = "./PNG/Damage/playerShip3_damage1.png";

let shield = new Image();
let playerIcon = new Image();
let rockets = new Image();
let meteors = new Image();
meteors.src = "./PNG/Meteors/meteorBrown_big1.png";

meteors.onload = function () {
  rockets.src = "./PNG/Effects/fire08.png"; 
}
rockets.onload = function () {
  shield.src = "./PNG/Effects/shield3.png";
};
shield.onload = function () {
  playerIcon.src = "./PNG/playerShip1_orange.png";
};
playerIcon.onload = function () {
  player.draw();
  animate();
  spawnEnemies(); 
  scoreBoard.innerHTML = "Score: " + score;
};


class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius+10;
    this.color = color;
    this.angle = -1.5708;
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
    context.translate(x, y);
    context.rotate(angleInRadians);
    context.drawImage(playerIcon, -25, -18, 50, 50);
    context.drawImage(shield, -50, -50,100, 100);
    context.rotate(-angleInRadians);
    context.translate(-x, -y);
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity,angle) {
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
    this.x = this.x + (this.velocity.x * 6);
    this.y = this.y + (this.velocity.y * 6);
  }
}

class Enemy {
  //same as projectile
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity; //object with x and y velocity rates to move at angle
  }

  draw() {
    // context.beginPath();
    // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    // context.fillStyle = this.color;
    // context.fill();
    context.translate(this.x, this.y);
    context.rotate(this.angle + 1.5708);
    context.drawImage(meteors, -this.radius, -this.radius, this.radius*2, this.radius*2);
    context.rotate(-this.angle - 1.5708);
    context.translate(-this.x, -this.y);
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }

}

const player = new Player(x, y, 40, "blue");

const projectiles = [];
const enemies = [];

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4; //random radius between 4 and 30
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

let animationId;
// var alpha = 0, /// current alpha value
//   delta = 0.2; /// delta = speed

function animate() {
  //animation loop
  animationID = requestAnimationFrame(animate);

  const img = new Image();
  img.src = "./Backgrounds/black.png";
  const pat = context.createPattern(img, "repeat");
  context.fillStyle = pat;

  // alpha += delta;
  // if (alpha <= 0 || alpha >= 0.5) delta = -delta;
  // context.fillStyle = `rgba(0, 0, 0, ${alpha})`; //sin wave opacity to create rocket flames effect

  // context.fillStyle = `rgba(0, 0, 0, 0.5`; //sin wave opacity to create rocket flames effect

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

  enemies.forEach((enemy, index) => {
    enemy.update(); //updates enemy position

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y); //distance between player and enemy on collision
    if (dist - enemy.radius - player.radius < 1) {
      //collision
      cancelAnimationFrame(animationID); //stops animation loop at current frame
    }

    //collision detection btwn enemy and player
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y); //distance between projectile and enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        //collision
        setTimeout(() => {
          score += 100;
          scoreBoard.innerHTML = "Score: " + score;
          
          enemies.splice(index, 1); //removes enemy from array

          // if(enemy.radius > 20){
          //   // context.drawImage(playerShip3_damage1,enemy.x,enemy.y); //todo: breaking animation

          //   //todo : split enemy into 2 smaller enemies 
          //   setTimeout(() => {
          //     enemies.push(new Enemy(enemy.x, enemy.y, enemy.radius /2, enemy.color, enemy.velocity));
          //     // enemies.push(new Enemy(enemy.x+10, enemy.y, enemy.radius - 15, enemy.color, enemy.velocity));
          //   }, 0);
          // }

          projectiles.splice(projectileIndex, 1); //removes projectile from array
        }, 0); //removes enemy and projectile from screen on the next frame so no flicker
      }
    });
  });

  player.updateDirection();
}

window.addEventListener("click", (event) => {
  //need x and y velocity rates to move at angle / direction of click
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  ); //gets angle of click
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  const projectile = new Projectile(x, y, 5, "red", velocity,angle);

  projectiles.push(projectile);
});

addEventListener("mousemove", (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  player.angle = angle;
});
// animate();
// spawnEnemies();
