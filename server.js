const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io"); // import socket.io
// create a new instance of socket.io by passing the server object
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;
console.log(port);
app.use(express.static("public")); // serves the static files

app.get("/", (req, res) => res.sendFile("./index.html"));

const arenaSize ={ x: 5300,y: 3000 };
let players = {};
let obstacles = new Array();
let projectiles = new Array();

io.on("connection", (socket) => {
  console.log("a user joined");
  
  socket.on('new player', (data) => {
    players[socket.id] = {
      x: 3000 * Math.random() + 50,
      y: 2000 * Math.random() + 50,
      radius: 20, //hitbox
      angle: -1.5708,
      hp: 100,
      icon: Math.floor(Math.random() * 12),
      name: data.name,
      score: 100,
      devicePixelRatio: data.devicePixelRatio,
    };
  });

  //player movement and mouse movement
  socket.on("mouseMove", (data) => {
    const player = players[socket.id];
    player.angle = data;
  });

  const speed = 5;
  socket.on("keydown", (data) => {
    const player = players[socket.id];
    if (!player) return;
    if(player.y - 40< 0) player.y = 40; //prevents player from going out of bounds
    if(player.y + 40> arenaSize.y) player.y = arenaSize.y - 40;
    if(player.x - 40< 0) player.x = 40;
    if(player.x + 40> arenaSize.x) player.x = arenaSize.x - 40;

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
    io.emit("playerDisconnected", socket.id)
    delete players[socket.id];
  });

});


setInterval(() => {
  io.emit("updateProjectiles", projectiles);  
  io.emit("updatePlayers", players);
  io.emit("updateObstacles", obstacles);

  //collision detection between players and obstacles
  // O(n*m or n^2) complexity 
  // n = number of players ( max 10 )
  // m = number of obstacles ( max 1000 )

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
  
  //collision detection between projectiles and (players or obstacles)
  // O(n*m or n^2) complexity
  // n = number of projectiles ( max depends on players )
  // m = number of obstacles ( max 1000 ) + number of players ( max 10 )
  for (let i = 0; i < projectiles.length; i++) {
    const projectile = projectiles[i];

    for(let id in players){
      const player = players[id];
      const dist = Math.hypot(projectile.x - player.x, projectile.y - player.y); //distance between projectile and player
      
      if (dist - player.radius - projectile.radius < 1) { //collision
        if (projectile.owner == id) continue; //if projectile owner is the player, skip
        
        io.emit("hit",{ //render particles effect on client
          x: projectile.x,
          y: projectile.y,
          type: 5,
        })
        
        player.hp -= 10; //damage player
        if (player.hp <= 0){ 
          players[projectile.owner].score += Math.round(player.score*0.7); //add score to player who killed the other player
          io.emit("playerKilled", id); 
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
        io.emit("hit",{ //render particles effect on client
          x: projectile.x,
          y: projectile.y,
          type: 1,
        })
        players[projectile.owner].score += 10; 
        if( players[projectile.owner].hp < 150 ) players[projectile.owner].hp += 3; //heal player
        projectiles.splice(i, 1); //removes projectile from array
        obstacles.splice(x,1); //removes obstacle from array
      }
    }

    if(!projectile) continue; //if projectile is null, skip
    if(!players[projectile.owner]) return; //if player is null, skip

    //update projectile position
    projectile.x += projectile.velocity.x * 10;
    projectile.y += projectile.velocity.y * 10;

    const maxDistFromOwner = 1000;
    if ( //if projectile is out of maxDistFromOwner
      projectile.x - players[projectile.owner].x < -maxDistFromOwner ||
      projectile.x - players[projectile.owner].x > maxDistFromOwner ||
      projectile.y - players[projectile.owner].y < -maxDistFromOwner ||
      projectile.y - players[projectile.owner].y > maxDistFromOwner
    ) {
      projectiles.splice(i, 1);
    }

    if ( //if projectile is out of bounds
      projectile.x < 0 ||
      projectile.x > arenaSize.x ||
      projectile.y < 0 ||
      projectile.y > arenaSize.y
    ) {
      projectiles.splice(i, 1);
    }

  }

}, 15); //60fps ticker function

//Obstacle spawner
let spawnTime = 1000;
let maxSpawned = 1000;
setInterval(() => {
  if (maxSpawned < obstacles.length) return;
  const obstacle = {
    x: arenaSize.x * Math.random(),
    y: arenaSize.y * Math.random(),
    radius:  Math.random() * (30 - 6) + 6, //hitbox
    icon: Math.floor(Math.random() * 8),
  };
  obstacles.push(obstacle);
}, 1000); //currently 1 new obstacles per second, max 1000
//change tines depending on current number of obstacles 
//to keep the number of obstacles on the map constant
//and to prevent lag


server.listen(port, () =>
  console.log(`Socket Server started , ${port}!`)
);
