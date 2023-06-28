const express = require("express");
const app = express();

const https = require("https");
const server = https.createServer(app);
const { Server } = require("socket.io"); // import socket.io
// create a new instance of socket.io by passing the server object
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;

app.use(express.static("public")); // serves the static files

app.get("/", (req, res) => res.sendFile("./index.html"));

const arenaSize = 3000;
players = {};
obstacles = new Array();
projectiles = new Array();

io.on("connection", (socket) => {
  console.log("a user connected");

  // let devicePixelRatio =
  
  socket.on('new player', (data) => {
    players[socket.id] = {
      x: 3000 * Math.random() + 50,
      y: 2000 * Math.random() + 50,
      radius: 20, //hitbox
      icon: Math.floor(Math.random() * 12),
      angle: -1.5708,
      hp: 100,
      name: data.name,
      devicePixelRatio: data.devicePixelRatio,
    };
  });


  //player movement and mouse movement
  socket.on("mouseMove", (data) => {
    const player = players[socket.id];
    player.angle = data;
  });

  const speed = 4;
  socket.on("keydown", (data) => {
    const player = players[socket.id];
    if (!player) return;
    if(player.y - 40< 0) player.y = 40; //prevents player from going out of bounds
    if(player.y + 40> arenaSize) player.y = arenaSize - 40;
    if(player.x - 40< 0) player.x = 40;
    if(player.x + 40> arenaSize) player.x = arenaSize - 40;

    if (player && data.s) {
      player.y += speed;
    }
    if (player && data.w) {
      player.y += -speed;
    }
    if (player && data.d) {
      player.x += speed;
    }
    if (player && data.a) {
      player.x += -speed;
    }
  });

  //when a player shoots
  socket.on("shoot", (data) => {
    const player = players[socket.id];
    const projectile = {
      angle: data.angle,
      velocity: data.velocity,
      x: data.x,
      y: data.y,
      owner: socket.id,
      radius: 5, //hitbox
    };
    projectiles.push(projectile);
  });

  //when a player disconnects
  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete players[socket.id];
  });

});

let spawnTime = 1000;
setInterval(() => {
  // spawnTime = obstacles.length * (spawnTime/2);
  const obstacle = {
    x: arenaSize * Math.random(),
    y: arenaSize * Math.random(),
    radius:  Math.random() * (30 - 6) + 6, //hitbox
    icon: Math.floor(Math.random() * 8),
  };
  obstacles.push(obstacle);
}, spawnTime); //currently 10 new obstacles per second
//change tines depending on current number of obstacles 
//to keep the number of obstacles on the map constant
//and to prevent lag




setInterval(() => {
  
  io.emit("updatePlayers", players);
  io.emit("updateObstacles", obstacles);

  for(let id in players){
    const player = players[id];
    if(!player) continue; //if player is null, skip

    for(let i=0;i<obstacles.length;i++){
      const obstacle = obstacles[i];
      if(!obstacle) continue; //if obstacle is null, skip
      const dist = Math.hypot(player.x - obstacle.x, player.y - obstacle.y); //distance between player and obstacle
      if (dist - obstacle.radius - player.radius < 1) { //collision
        //tick damage
        player.hp -= 1;
        if (player.hp <= 0){
          delete players[id];
        } //remove player
      }
    }

  }
  

  for (let i = 0; i < projectiles.length; i++) {
    const projectile = projectiles[i];
    for(let id in players){
      const player = players[id];
      const dist = Math.hypot(projectile.x - player.x, projectile.y - player.y); //distance between projectile and player
      if (dist - player.radius - projectile.radius < 1) { //collision
        if (projectile.owner == id) continue; //if projectile owner is the player, skip
        player.hp -= 10; //damage player
        if (player.hp <= 0){ 
          delete players[id];
        } //remove player
        projectiles.splice(i, 1); //removes projectile from array
      }
    }

    for(let x = 0; x < obstacles.length; x++){
      const obstacle = obstacles[x];
      if(!obstacle) continue; //if obstacle is null, skip
      const dist = Math.hypot(projectile.x - obstacle.x, projectile.y - obstacle.y); //distance between projectile and obstacle
      if (dist - obstacle.radius - projectile.radius < 1) { //collision
        projectiles.splice(i, 1); //removes projectile from array
        delete obstacles[x]; //removes obstacle from array
      }
    }

    if(!projectile) continue; //if projectile is null, skip

    //update projectile position
    projectile.x +=
      projectile.velocity.x * 10;
    projectile.y +=
      projectile.velocity.y * 10;

      const dist = 1000;
      if(!players[projectile.owner]) return; //if player is null, skip
    if ( //if projectile is out of bounds
      projectile.x - players[projectile.owner].x < -dist ||
      projectile.x - players[projectile.owner].x > dist ||
      projectile.y - players[projectile.owner].y < -dist ||
      projectile.y - players[projectile.owner].y > dist
    ) {
      projectiles.splice(i, 1);
    }

    if ( //if projectile is out of bounds
      projectile.x < 0 ||
      projectile.x > arenaSize ||
      projectile.y < 0 ||
      projectile.y > arenaSize
    ) {
      projectiles.splice(i, 1);
    }

  }
  io.emit("updateProjectiles", projectiles);  

}, 15); //60fps ticker function

setInterval(() => {
  for(let id in players){
    const player = players[id];
    if(!player) continue; //if player is null, skip
    if(player.hp < 100) player.hp += 1;
  }
}, 1000);


server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
