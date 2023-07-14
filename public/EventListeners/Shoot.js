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

  let data = [{
    angle: angle,
    velocity: {
      x: Math.cos(angle),
      y: Math.sin(angle),
    },
    x: thisPlayer.x,
    y: thisPlayer.y,
  }]; 

  
  if(thisPlayer.rocketPerShoot > 1){ //2 rockets per shoot
    const spaceBetweenRockets = Math.abs( Math.sin(angle) ) - Math.abs( Math.cos(angle) ) < 0.4 &&
                               Math.abs( Math.sin(angle) ) - Math.abs( Math.cos(angle) ) > -0.4                          
                                ? 0 : 1;
    let offsetX = Math.cos(angle)*15; 
    let offsetY = Math.sin(angle)*15;
    if (spaceBetweenRockets) { const temp = offsetX; offsetX = offsetY; offsetY = temp; }
    
    data[0].x = thisPlayer.x - offsetX;  //if travelling in x direction,
    data[0].y = thisPlayer.y + offsetY;  //spread out in y direction & visa versa
    data.push({
      angle: angle,
      velocity: {
        x: Math.cos(angle),
        y: Math.sin(angle),
      },
      x: thisPlayer.x + offsetX,  //same but in opposite direction of data[0]
      y: thisPlayer.y - offsetY,  
    });
  }
  if (thisPlayer.rocketPerShoot > 2) {
    data.push({  //middle rocket
      angle: angle,
      velocity: {
        x: Math.cos(angle),
        y: Math.sin(angle),
      },
      x: thisPlayer.x ,  
      y: thisPlayer.y ,  
    });
  }
  
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
  sfx_laser.currentTime = 0;
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
