const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});



// Define your Express route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Socket.IO connection event
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle socket events here

    socket.on('join', (code) => {
        console.log(`User joined room: ${code}`);
        socket.join(code);
    });

    socket.on('create-offer' , (data) => {
        console.log(`Offer made for room: ${data.code}`);
        console.log(data)
        socket.to(data.code).emit('offer-made', {data : data});
    });

    socket.on('make-answer', (data) => {
        console.log(`Answer made for room: ${data.code}`);
        socket.to(data.code).emit('answer-made', data.answer);
    });

    // Socket.IO disconnection event
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const port = 5001;
http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});