let sent = false;
addEventListener("mousemove", (event) => { 
    if(playerDied || !frontendPlayers[socket.id]) return;
    const angle = Math.atan2(
        (event.clientY * window.devicePixelRatio) - canvas.height / 2, //since player will always be in the center
        (event.clientX * window.devicePixelRatio) - canvas.width / 2,  //as camera (ie. entire surroundings) is moving
    );
      frontendPlayers[socket.id].angle = angle; //updates current players angle asap

    if(sent) return;
    //emiting every 15ms to reduce server load
    socket.emit("mouseMove", angle);
    sent = true;
    let promise = new Promise((resolve, reject) => { setTimeout(() => { resolve(); }, 15); }); //delay to reduce server load
    promise.then(() => { sent = false; });
});

let keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

setInterval(() => {
  if(keys.w || keys.a || keys.s || keys.d){
    socket.emit("keydown", keys);
  }
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
