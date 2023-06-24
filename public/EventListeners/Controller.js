let sent = false;
addEventListener("mousemove", (event) => {  
    const angle = Math.atan2(
        (event.clientY * window.devicePixelRatio) - frontendPlayers[socket.id].y,
        (event.clientX * window.devicePixelRatio) - frontendPlayers[socket.id].x
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
  if (event.key == "s") {
    keys.s = true;
    frontendPlayers[socket.id].y = speed; //client side prediction
  }
  if (event.key == "w") {
    keys.w = true;
    frontendPlayers[socket.id].y = -speed;
  }
  if (event.key == "d") {
    keys.d = true;
    frontendPlayers[socket.id].x = speed;
  }
  if (event.key == "a") {
    keys.a = true;
    frontendPlayers[socket.id].x = -speed;
  }
});

addEventListener("keyup", (event) => {
  if (event.key == "s") {
    keys.s = false;
  }
  if (event.key == "w") {
    keys.w = false;
  }
  if (event.key == "d") {
    keys.d = false;
  }
  if (event.key == "a") {
    keys.a = false;
  }
});
