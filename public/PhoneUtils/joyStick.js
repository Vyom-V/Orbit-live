var leftManager;
var rightManager;

function initJoystick() {
    var leftOptions = {
        zone: document.getElementById('leftJoystick'),
        mode: 'dynamic',
        size: 75,
    };
    var rightOptions = {
        zone: document.getElementById('rightJoystick'),
        mode: 'dynamic',
        size: 75,
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
        setIntervalId = setInterval(() => {
            if(fireData != null)
                socket.emit("shoot", fireData);
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