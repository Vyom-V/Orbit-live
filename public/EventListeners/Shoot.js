let clickSent = false;
window.addEventListener("click", (event) => {
  const thisPlayer = frontendPlayers[socket.id];
  if (playerDied || !thisPlayer) return;
  //need x and y velocity rates to move at angle / direction of click based on players location

  const angle = Math.atan2(
    event.clientY * window.devicePixelRatio - (thisPlayer.y - cam.y), //since player will always be in the center
    event.clientX * window.devicePixelRatio - (thisPlayer.x - cam.x) //as camera (ie. entire surroundings) is moving
  );

  const data = {
    angle: angle,
    velocity: {
      x: Math.cos(angle),
      y: Math.sin(angle),
    },
    x: thisPlayer.x,
    y: thisPlayer.y,
  };

  //emiting every 30ms to reduce server load
  if (clickSent) return;
  socket.emit("shoot", data);
  clickSent = true;
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 30);
  });
  promise.then(() => {
    clickSent = false;
  });
  const sfx_laser = new Audio("./Resources/Bonus/fire.mp3");
  sfx_laser.play();
});
