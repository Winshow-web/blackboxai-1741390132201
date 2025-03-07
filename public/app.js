// Initialize Socket.IO connection
const socket = io();

// DOM Elements
const usernameModal = document.getElementById('usernameModal');
const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messages');
const userStatus = document.getElementById('userStatus');

let username = '';

// Handle username submission
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    username = usernameInput.value.trim();
    if (username) {
        // Store username in localStorage
        localStorage.setItem('chatUsername', username);
        // Hide modal
        usernameModal.classList.add('hidden');
        // Update status
        userStatus.textContent = `Logged in as: ${username}`;
        // Enable message form
        messageForm.classList.remove('opacity-50', 'pointer-events-none');
    }
});

// Check for stored username
window.addEventListener('load', () => {
    const storedUsername = localStorage.getItem('chatUsername');
    if (storedUsername) {
        username = storedUsername;
        usernameModal.classList.add('hidden');
        userStatus.textContent = `Logged in as: ${username}`;
    } else {
        messageForm.classList.add('opacity-50', 'pointer-events-none');
    }
});

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
    });
}

// Create message element
function createMessageElement(data, isSent) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`;
    
    messageDiv.innerHTML = `
        <div class="${isSent 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-800'} 
            rounded-lg px-4 py-2 max-w-[70%] break-words shadow">
            <div class="text-xs ${isSent ? 'text-blue-200' : 'text-gray-600'} mb-1">
                ${isSent ? 'You' : data.username}
            </div>
            <p class="text-sm">${data.message}</p>
            <p class="text-xs ${isSent ? 'text-blue-200' : 'text-gray-500'} mt-1">
                ${formatTime(data.timestamp)}
            </p>
        </div>
    `;
    
    return messageDiv;
}

// Handle message submission
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (message && username) {
        // Emit message to server
        socket.emit('chat message', {
            username: username,
            message: message
        });
        
        messageInput.value = '';
    }
});

// Handle incoming messages
socket.on('chat message', (data) => {
    const isSent = data.username === username;
    const messageElement = createMessageElement(data, isSent);
    messagesContainer.appendChild(messageElement);
    // Auto scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Handle connection status
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Error handling
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    userStatus.textContent = 'Connection error! Trying to reconnect...';
    userStatus.classList.add('text-red-500');
});
