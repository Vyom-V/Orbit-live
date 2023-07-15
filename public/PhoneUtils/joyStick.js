var leftManager;
var rightManager;

function initJoystick() {
    var leftOptions = { //movement
        zone: document.getElementById('leftJoystick'),
        mode: 'dynamic',
        size: 100,
    };
    var rightOptions = { //shoot
        zone: document.getElementById('rightJoystick'),
        mode: 'dynamic',
        size: 100,
    };
    leftManager = nipplejs.create(leftOptions);
    rightManager = nipplejs.create(rightOptions);

    leftManager.on('added', function (evt, leftJoystick) {
        leftJoystick.on('start move ', function (evt, data) {
            if(!data.direction) return;

            const thisPlayer = frontendPlayers[socket.id];
            playerAngle = 2*Math.PI - data.angle.radian;
            thisPlayer.angle = playerAngle; //client side prediction
            
            if(data.direction.y == 'up'){
                keys.w = true;
            }else{ keys.w = false; }
            if(data.direction.y == 'down'){
                keys.s = true;
            }else{ keys.s = false; }
            if(data.direction.x == 'right'){
                keys.d = true;
            }else{ keys.d = false; }    
            if(data.direction.x == 'left'){
                keys.a = true;
            }else{ keys.a = false; }
        });
        leftJoystick.on('end', function (evt, data) {
            keys.w = false;
            keys.s = false;
            keys.d = false;
            keys.a = false;
        });
    }).on('removed', function (evt, leftJoystick) {
        leftJoystick.off('start move end dir plain');
    });

    rightManager.on('added', function (evt, rightJoystick) {
        let setIntervalId = null;
        let fireData = null;
        
        //emiting every 200ms to make it more fair
        setIntervalId = setInterval(() => { //fire rate limiter
            const thisPlayer = frontendPlayers[socket.id];
            if(fireData.length != 0)
            fired = true; //firing effect for mobile

            fireData.x = thisPlayer.x;
            fireData.y = thisPlayer.y;
            let allFireData = [];
            allFireData.push(fireData);
            
            if(thisPlayer.rocketPerShoot > 1){ //2 rockets per shoot
                const spaceBetweenRockets = Math.abs( Math.sin(allFireData[0].angle) ) - Math.abs( Math.cos(allFireData[0].angle) ) < 0.4 &&
                                            Math.abs( Math.sin(allFireData[0].angle) ) - Math.abs( Math.cos(allFireData[0].angle) ) > -0.4                          
                                            ? 0 : 1;
                let offsetX = Math.cos(allFireData[0].angle)*15; 
                let offsetY = Math.sin(allFireData[0].angle)*15;
                if (spaceBetweenRockets) { const temp = offsetX; offsetX = offsetY; offsetY = temp; }
                
                allFireData[0].x = thisPlayer.x - offsetX;  //if travelling in x direction,
                allFireData[0].y = thisPlayer.y + offsetY;  //spread out in y direction & visa versa
                allFireData.push({
                    angle: allFireData[0].angle,
                    velocity: {
                    x: Math.cos(allFireData[0].angle),
                    y: Math.sin(allFireData[0].angle),
                    },
                    x: thisPlayer.x + offsetX,  //same but in opposite direction of allFireData[0]
                    y: thisPlayer.y - offsetY,  
                });
                }
                if (thisPlayer.rocketPerShoot > 2) {
                allFireData.push({  //middle rocket
                    angle: allFireData[0].angle,
                    velocity: {
                    x: Math.cos(allFireData[0].angle),
                    y: Math.sin(allFireData[0].angle),
                    },
                    x: thisPlayer.x ,  
                    y: thisPlayer.y ,  
                });
            }
            
            socket.emit("shoot", allFireData);
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve();
                }, 100);
              });
              promise.then(() => {
                fired = false;
              });
        } , 200);

        rightJoystick.on('start move ', function (evt, data) {
            if(!data.direction) return;
            const thisPlayer = frontendPlayers[socket.id];

            const fireAngle = 2*Math.PI - data.angle.radian;

            fireData = {
                angle: fireAngle,
                velocity: {
                  x: Math.cos(fireAngle),
                  y: Math.sin(fireAngle),
                },
                x: thisPlayer.x,
                y: thisPlayer.y,
            };

        })

        rightJoystick.on('end', function (evt, data) {
            clearInterval(setIntervalId);
        });
    }).on('removed', function (evt, rightJoystick) {
        rightJoystick.off('start move end dir plain');
    });


}