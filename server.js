const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io'); // import socket.io
// create a new instance of socket.io by passing the server object
const io = new Server(server,{pingInterval: 2000, pingTimeout: 5000});

const port = 3000;

app.use(express.static('public')); // serves the static files

app.get('/', (req, res) => res.sendFile('./index.html'));

players = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    // let devicePixelRatio = 

    // socket.on('new player', () => {
        players[socket.id] = {
            x: 500 * Math.random(),
            y: 500 * Math.random(),
            icon: Math.floor(Math.random() * 12),
            angle: -1.5708,
            // projectile: new Array(),
        };
        
        io.emit('updatePlayers', players);
    // });

    let keysDown = 0;

    //player movement and mouse movement
    socket.on('mouseMove', (data) => {
        const player = players[socket.id];
        player.angle = data;
    });

    const speed = 4;
    socket.on('keydown', (data) => {
        const player = players[socket.id];
        if (data.s) {
            player.y += speed;
        }
        if (data.w) {
            player.y += -speed;
        }
        if (data.d) {
            player.x += speed;
        }
        if (data.a) {
            player.x += -speed;
        }
    });

    //when a player shoots
    // socket.on('shoot', (data) => {
    //     const player = players[socket.id];
    //     const projectile = {   
    //         angle: data.angle,
    //         velocity: data.velocity,
    //         x: data.x,
    //         y: data.y,
    //         owner: socket.id,
    //     }
    //     // player.projectile.push(projectile);
    // });


    //when a player disconnects
    socket.on('disconnect', () => {
        console.log('user disconnected')
        delete players[socket.id];
    });
});




setInterval(() => {
    io.emit('updatePlayers', players);
}, 15); //60fps ticker function

server.listen(port, () => console.log(`Example app listening on port ${port}!`));
