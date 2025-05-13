const socket = io('http://localhost:8000', {
    transports: ['websocket']
  });
  
  // DOM elements and append() function remain the same
  const form = document.getElementById('send-container');
  const messageInput = document.getElementById('messageInp');
  const messageContainer = document.getElementById("chat-container");
  const audio = new Audio('../ting.mp3'); // Path adjusted
  
  const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message', position);
    messageContainer.append(messageElement);
    if(position === 'left') audio.play();
    messageContainer.scrollTop = messageContainer.scrollHeight;
  };
  
  // New event handlers
  socket.on('welcome-message', (data) => {
    append(`Server: ${data.text}`, 'right');
    console.log('Active users:', data.users.join(', '));
  });
  
  socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'right');
  });
  
  socket.on('receive', (data) => {
    append(`${data.name} (${data.time}): ${data.message}`, 'left');
  });
  
  socket.on('left', (name) => {
    append(`${name} left the chat`, 'right');
  });
  
  // Connection monitoring
  socket.on('connect_error', (err) => {
    append(`Connection failed: ${err.message}`, 'right');
  });
  
  socket.on('reconnect', () => {
    append('Reconnected to server!', 'right');
  });
  
  setInterval(() => {
    socket.emit('ping', () => console.log('✓ Connection healthy'));
  }, 30000);
  
  // Existing form handler remains the same
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if(message) {
      append(`You: ${message}`, 'right');
      socket.emit('send', message);
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