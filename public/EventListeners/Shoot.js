let fired = false;
const sfx_laser = new Audio("./Resources/Bonus/fire.mp3");

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
  if (fired) return;
  socket.emit("shoot", data);
  fired = true;
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
  promise.then(() => {
    fired = false;
  });
  sfx_laser.play();
});


/* ******** rapid fire power up ******** */

// let fired = false;
// window.addEventListener('mousemove' , (event) => {
//   const thisPlayer = frontendPlayers[socket.id];
//   if (playerDied || !thisPlayer) return;

//   const angle = Math.atan2(
//     event.clientY * window.devicePixelRatio - (thisPlayer.y - cam.y),
//     event.clientX * window.devicePixelRatio - (thisPlayer.x - cam.x) 
//   );

//   if(event.buttons == 1){ //coresponds to left button down

//     if (fired) return;

//     const data = {
//       angle: angle,
//       velocity: {
//         x: Math.cos(angle),
//         y: Math.sin(angle),
//       },
//       x: thisPlayer.x,
//       y: thisPlayer.y,
//     };
//     socket.emit("shoot", data);

//     fired = true;
//     let promise = new Promise((resolve, reject) => { 
//       setTimeout(() => { resolve(); }, 100); 
//     });
//     promise.then(() => { fired = false; });

//     const sfx_laser = new Audio("./Resources/Bonus/fire.mp3");
//     sfx_laser.play();

//   }
// });
