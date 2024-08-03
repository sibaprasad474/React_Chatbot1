const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Create an instance of Server from socket.io with CORS options
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const { router, setSocketIo } = require('./Router/router');

setSocketIo(io);

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

// Use routes
app.use('/api', router);

// Log client connections and disconnections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});
