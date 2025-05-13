const socket = io('http://localhost:8000',{
    transports : ['websocket']
});

// DOM Elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.getElementById("chat-container");
const typingIndicator = document.getElementById('typing-indicator');
const audio = new Audio('ting.mp3');

// Append message to chat
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.dataset.id = id;
    messageElement.innerHTML = `
    <div class="message-content">${message}</div>
    <div class="message-footer">
        ${position === 'right' ? '<span class="status sending">🕒</span>' : ''}
        <span class="timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    </div>
    <div class="reactions-container"></div>
    `;
    messageElement.classList.add('message', position);
    messageContainer.append(messageElement);

        // Add reaction handler
        messageElement.addEventListener('dblclick', () => {
          socket.emit('react', { 
              msgId: id, 
              emoji: '❤️' 
          });
      });
  
  
    if(position === 'left') audio.play();
    messageContainer.scrollTop = messageContainer.scrollHeight;
    return messageElement;
};



socket.on('welcome-message', (data) => {
    append(`Server: ${data.text}`, 'right');
    console.log('Active users:', data.users.join(', '));
  });

// Socket event handlers
socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', (data) => {
    append(`${data.name} (${data.time}): ${data.message}`, 'left');
});

socket.on('left', (name) => {
    append(`${name} left the chat`, 'right');
});

// Connection status handlers
socket.on('connect_error', (err) => {
    append(`Connection failed: ${err.message}`, 'right');
});

socket.on('reconnect', () => {
    append("Reconnected to server", 'right');
});

setInterval(() => {
    socket.emit('ping', () => console.log('✓ Connection healthy'));
  }, 30000);

//   Form submission handler
  form.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = messageInput.value.trim();
      if(message) {
        const messageId = Date.now();
          append(`You: ${message}`, 'right',messageId);
          socket.emit('send', {
            text : message,
            id : messageId
          });
          updateMessageStatus(messageId,'sending');
          messageInput.value = '';
      }
  });

  // Name prompt logic remains the same
const name = prompt("Enter your name to join:");
if(name) {
  socket.emit('new-user-joined', name.trim());
} else {
  alert("Name is required!");
  window.location.reload();
}

// Add click handlers to messages
messageElement.addEventListener('dblclick', () => {
  socket.emit('reaction', {msgId, emoji: '❤️'});
});



