let sent = false;

window.addEventListener("click", (event) => {
  //need x and y velocity rates to move at angle / direction of click based on players location
  const angle = Math.atan2(
    event.clientY * window.devicePixelRatio - frontendPlayers[socket.id].y,
    event.clientX * window.devicePixelRatio - frontendPlayers[socket.id].x
  );
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };

  const data = {
    angle: angle,
    velocity: velocity,
    x: frontendPlayers[socket.id].x,
    y: frontendPlayers[socket.id].y,
  };

  if (sent) return;
  //emiting every 15ms to reduce server load
  socket.emit("shoot", data);
  sent = true;
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 15);
  }); //delay to reduce server load
  promise.then(() => {
    sent = false;
  });

  // const projectile = new Projectile(player.x, player.y, 5, "red", velocity, angle);

  // const sfx_laser = new Audio("./Resources/Bonus/fire.mp3");
  // sfx_laser.play();

  // projectiles.push(projectile);
});
