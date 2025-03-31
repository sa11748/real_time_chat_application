const io = require('socket.io')(8000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

const users = {};

io.on('connection', socket => {
    console.log('New connection:', socket.id);

    socket.on('new-user-joined', name => {
        if(!name || name.trim() === '') return;
        
        users[socket.id] = name.trim();
        socket.broadcast.emit('user-joined', users[socket.id]);
        
        // Send welcome message to the new user only
        socket.emit('welcome-message', {
            text: `Welcome to the chat, ${users[socket.id]}!`,
            users: Object.values(users)
        });
    });

    socket.on('send', message => {
        if(!message || message.trim() === '') return;
        if(!users[socket.id]) return;
        
        socket.broadcast.emit('receive', {
            message: message.trim(),
            name: users[socket.id],
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        if(users[socket.id]) {
            socket.broadcast.emit('left', users[socket.id]);
            delete users[socket.id];
            console.log('User disconnected:', socket.id);
        }
    });

    // Ping-pong for connection health
    socket.on('ping', (cb) => {
        if(typeof cb === 'function') {
            cb();
        }
    });
});

// Server logging
console.log('Chat server running on port 8000');