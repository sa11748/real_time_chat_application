const socket = io('http://localhost:8000', {
  transports: ['websocket']
});

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.getElementById("chat-container");
const audio = new Audio('ting.mp3');
const reactionAudio = new Audio('pop.mp3');

// Append message with optional reaction UI
const append = (message, position, messageId = null, sender = null) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', position);
  if (messageId) messageElement.dataset.id = messageId;

  const textEl = document.createElement('span');
  textEl.innerText = message;
  messageElement.appendChild(textEl);

  // Reaction UI
  const reactionBar = document.createElement('div');
  reactionBar.className = 'reaction-bar';
  ['❤️','😂','😮','👍','🔥'].forEach(emoji => {
    const btn = document.createElement('span');
    btn.className = 'reaction-btn';
    btn.innerText = emoji;
    btn.onclick = () => {
      socket.emit('send-reaction', {
        messageId,
        emoji,
        sender: name
      });
    };
    reactionBar.appendChild(btn);
  });
  messageElement.appendChild(reactionBar);

  messageContainer.appendChild(messageElement);
  if (position === 'left') audio.play();
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

// Insert or update reaction display on a message
const addReactionToMessage = (messageId, emoji, from) => {
  const targetMsg = document.querySelector(`[data-id="${messageId}"]`);
  if (targetMsg) {
    let reactionDisplay = targetMsg.querySelector('.reaction-display');
    if (!reactionDisplay) {
      reactionDisplay = document.createElement('div');
      reactionDisplay.className = 'reaction-display';
      targetMsg.appendChild(reactionDisplay);
    }
    const emojiSpan = document.createElement('span');
    emojiSpan.innerText = `${emoji} (${from})`;
    reactionDisplay.appendChild(emojiSpan);
    reactionAudio.play();
  }
};

// Name prompt
let name;
name = prompt("Enter your name to join:");
if (name) {
  socket.emit('new-user-joined', name.trim());
} else {
  alert("Name is required!");
  window.location.reload();
}

// Event listeners
socket.on('welcome-message', data => {
  append(`Server: ${data.text}`, 'right');
});

socket.on('user-joined', name => {
  append(`${name} joined the chat`, 'right');
});

socket.on('receive', data => {
  const msgText = `${data.name} (${data.time}): ${data.message}`;
  const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  append(msgText, 'left', messageId, data.name);
});

socket.on('left', name => {
  append(`${name} left the chat`, 'right');
});

socket.on('receive-reaction', ({ messageId, emoji, sender }) => {
  addReactionToMessage(messageId, emoji, sender);
});

socket.on('connect_error', err => {
  append(`Connection failed: ${err.message}`, 'right');
});

socket.on('reconnect', () => {
  append('Reconnected to server!', 'right');
});

setInterval(() => {
  socket.emit('ping', () => console.log('✓ Connection healthy'));
}, 30000);

form.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
  }
});
