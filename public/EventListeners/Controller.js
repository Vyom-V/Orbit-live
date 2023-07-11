let keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

let playerAngle = null;
addEventListener("mousemove", (event) => {
  const thisPlayer = frontendPlayers[socket.id];
  if (playerDied || !thisPlayer) return;

  playerAngle = Math.atan2(
    event.clientY * window.devicePixelRatio - (thisPlayer.y - cam.y), //since player will always be in the center
    event.clientX * window.devicePixelRatio - (thisPlayer.x - cam.x) //as camera (ie. entire surroundings) is moving
  );

  thisPlayer.angle = playerAngle; //updates current players angle asap
});

setInterval(() => {
  if (keys.w || keys.a || keys.s || keys.d) {
    socket.emit("keydown", keys);
  }
  if(playerAngle != null) 
    socket.emit("mouseMove", playerAngle);
}, 15);

//player controller
let speed = 4;
addEventListener("keydown", (event) => {
  if (event.key == "s" || event.key == "S") {
    keys.s = true;
    // frontendPlayers[socket.id].y = speed; //client side prediction
  }
  if (event.key == "w" || event.key == "W") {
    keys.w = true;
    // frontendPlayers[socket.id].y = -speed;
  }
  if (event.key == "d" || event.key == "D") {
    keys.d = true;
    // frontendPlayers[socket.id].x = speed;
  }
  if (event.key == "a" || event.key == "A") {
    keys.a = true;
    // frontendPlayers[socket.id].x = -speed;
  }
});

addEventListener("keyup", (event) => {
  if (event.key == "s" || event.key == "S") {
    keys.s = false;
  }
  if (event.key == "w" || event.key == "W") {
    keys.w = false;
  }
  if (event.key == "d" || event.key == "D") {
    keys.d = false;
  }
  if (event.key == "a" || event.key == "A") {
    keys.a = false;
  }
});
