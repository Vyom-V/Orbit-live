const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io"); // import socket.io
// create a new instance of socket.io by passing the server object
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;

app.use(express.static("public")); // serves the static files

app.get("/", (req, res) => res.sendFile("./index.html"));

players = {};
projectiles = new Array();

io.on("connection", (socket) => {
  console.log("a user connected");

  // let devicePixelRatio =
  
  socket.on('new player', (data) => {
    players[socket.id] = {
      x: 500 * Math.random(),
      y: 500 * Math.random(),
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

setInterval(() => {
  
  io.emit("updatePlayers", players);

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
    //update projectile position
    projectile.x +=
      projectile.velocity.x * 6;
    projectile.y +=
      projectile.velocity.y * 6;

    if ( //if projectile is out of bounds
      projectile.x < 0 ||
      projectile.x > 1000 ||
      projectile.y < 0 ||
      projectile.y > 1000
    ) {
      projectiles.splice(i, 1);
    }
  }
  io.emit("updateProjectiles", projectiles);  

}, 15); //60fps ticker function

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
