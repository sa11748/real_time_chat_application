const socket = io('http://localhost:8000');

// DOM Elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.getElementById("chat-container"); // Changed to match new HTML
const audio = new Audio('ting.mp3');

// Append message to chat
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message', position);
    messageContainer.append(messageElement);
    
    // Play sound for received messages and scroll to bottom
    if(position === 'left') {
        audio.play();
    }
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Form submission handler
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if(message) {
        append(`You: ${message}`, 'right');
        socket.emit('send', message);
        messageInput.value = '';
        messageInput.focus();
    }
});

// Prompt for username
const name = prompt("Enter your name to join:");
if(name) {
    socket.emit('new-user-joined', name.trim());
} else {
    alert("You must enter a name to join the chat!");
    window.location.reload();
}

// Socket event handlers
socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

socket.on('left', name => {
    append(`${data.name} left the chat`, 'right');
});

// Handle connection errors
socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
    append("Connection lost. Trying to reconnect...", 'right');
});

socket.on('reconnect', () => {
    append("Reconnected to chat server", 'right');
});