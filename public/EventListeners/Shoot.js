let clickSent = false;
window.addEventListener("click", (event) => {
  if(playerDied || !frontendPlayers[socket.id]) return;
  //need x and y velocity rates to move at angle / direction of click based on players location
  const angle = Math.atan2(
    event.clientY * window.devicePixelRatio - canvas.height / 2,
    event.clientX * window.devicePixelRatio - canvas.width / 2
  );

  const data = {
    angle: angle,
    velocity: {
      x: Math.cos(angle),
      y: Math.sin(angle),
    },
    x: frontendPlayers[socket.id].x,
    y: frontendPlayers[socket.id].y,
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
