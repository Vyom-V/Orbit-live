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
    // socket.on('new player', () => {
        players[socket.id] = {
            x: 500 * Math.random(),
            y: 500 * Math.random(),
            icon: Math.floor(Math.random() * 12),
        };
        
        io.emit('updatePlayers', players);
    // });
    socket.on('movement', (data) => {
        const player = players[socket.id];
        if (data == 'a') {
            player.x -= 5;
            io.emit('updatePlayers', players);
        }
        if (data == 'w') {
            player.y -= 5;
            io.emit('updatePlayers', players);
        }
        if (data == 'd') {
            player.x += 5;
            io.emit('updatePlayers', players);
        }
        if (data == 's') {
            player.y += 5;
            io.emit('updatePlayers', players);
        }
    });
    socket.on('disconnect', () => {
        console.log('user disconnected')
        delete players[socket.id];
    });
});


server.listen(port, () => console.log(`Example app listening on port ${port}!`));
