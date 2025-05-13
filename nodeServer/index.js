const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

// Serve static files from the root directory (one level up from nodeServer)
app.use(express.static(path.join(__dirname, '../')));

const users = {};

io.on('connection', socket => {
    console.log('🟢 New connection:', socket.id);
//user joins
    socket.on('new-user-joined', name => {
        if (!name || name.trim() === '') return;

        users[socket.id] = name.trim();
        socket.broadcast.emit('user-joined', users[socket.id]);

        // Welcome the new user privately
        socket.emit('welcome-message', {
            text: `Welcome to the chat, ${users[socket.id]}!`,
            users: Object.values(users)
        });
    });

    socket.on('send', message => {
        if (!message || message.trim() === '') return;
        if (!users[socket.id]) return;

        const msg = {
            id: uuidv4(), // Unique message ID
            message: message.trim(),
            name: users[socket.id],
            time: new Date().toLocaleTimeString()
        };

        socket.broadcast.emit('receive', msg);

        socket.emit('receive' , msg);
    });

        socket.on('send-reaction', ({ messageId, emoji, sender }) => {
            if (!messageId || !emoji || !sender) return;
            console.log(`💬 Reaction received: ${emoji} on ${messageId} from ${sender}`);
    
            io.emit('receive-reaction', {
                messageId,
                emoji,
                sender
            });
        });

        socket.on('receive', data => {
            const msgText = `${data.name} (${data.time}): ${data.message}`;
            append(msgText, data.name === name ? 'right' : 'left', data.id, data.name);
          });
          

    //user leaves

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            socket.broadcast.emit('left', users[socket.id]);
            console.log('🔴 User disconnected:', socket.id);
            delete users[socket.id];
        }
    });

    // Ping-pong to keep connection healthy
    socket.on('ping', (cb) => {
        if (typeof cb === 'function') cb();
    });
});

// Start the server
const PORT = 8000;
http.listen(PORT, () => {
    console.log(`🚀 Chat server running at http://localhost:${PORT}`);
});
