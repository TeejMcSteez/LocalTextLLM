document.addEventListener('DOMContentLoaded', () => {
    const chatDiv = document.getElementById('chat');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');
    const loadingDiv = document.getElementById('loading');
    const paramSelect = document.getElementById('paramSelect');
    const newChatButton = document.getElementById('newChat');
    const chatIdsDiv = document.getElementById('chatIds');
    let chatId = 'default';
    let messages = [];

    /**
     * Renders sent json content and user sent content with marked and markdown-it
     * @param {String} role Role of the message sender
     * @param {String} content Message for the role
     */
    function renderMessage(role, content) {
        const msgDiv = document.createElement('div');
        msgDiv.innerHTML = `<p><strong>${role}:</strong> ${content}</p>`;
        chatDiv.appendChild(msgDiv);
        MathJax.typesetPromise([msgDiv]);
        msgDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    /**
     * Saves chat to the redis server upon a sent message and successful response
     */
    async function saveChat() {
        try {
            await fetch('http://localhost:3000/API/saveChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId, messages })
            });
            displayChatIds(); // Refresh chat ID list after saving
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    }

    /**
     * Loads chat from redis server and displays saved chat
     */
    async function loadChat() {
        try {
            const response = await fetch(`http://localhost:3000/API/loadChat/${chatId}`);
            const data = await response.json();
            messages = data.messages || [];
            chatDiv.innerHTML = '';
            messages.forEach(msg => {
                renderMessage(msg.role, msg.content);
            });
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    }

    /**
     * Fetches and displays all available chat IDs
     */
    async function displayChatIds() {
        try {
            const response = await fetch('http://localhost:3000/API/getAllChats');
            const data = await response.json();
            chatIdsDiv.innerHTML = '';
            data.chatIds.forEach(id => {
                const button = document.createElement('button');
                button.textContent = id;
                button.className = 'px-2 py-1 bg-red-700 text-white rounded hover:bg-gray-600';
                button.onclick = () => {
                    chatId = id;
                    loadChat();
                };
                chatIdsDiv.appendChild(button);
            });
        } catch (error) {
            console.error('Error fetching chat IDs:', error);
        }
    }

    /**
     * Sends message to selected model also saves chat to messages upon completion
     * @returns if there is no message to send
     */
    async function sendMessage() {
        const message = messageInput.value.trim();
        const selectedParam = paramSelect.value;
        if (!message) {
            alert('No message to send');
            return;
        }

        try {
            // Add user message immediately
            renderMessage('user', message);
            messages.push({ role: 'user', content: message });

            // Show loading indicator
            loadingDiv.style.display = 'block';
            chatDiv.appendChild(loadingDiv);

            // Disable input while processing
            messageInput.disabled = true;
            sendButton.disabled = true;
            newChatButton.disabled = true;

            const response = await fetch(`http://localhost:3000/API/chat${selectedParam}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (data.message === undefined) {
                alert("Server is not running or model is not loaded try another one or come back later.");
            }

            // Hide loading indicator
            loadingDiv.style.display = 'none';

            // Add bot response with Markdown and KaTeX support
            renderMessage('bot', data.message);
            messages.push({ role: 'bot', content: data.message });

            // Smooth scroll to show new message
            messageInput.value = '';

            // Re-enable input
            messageInput.disabled = false;
            sendButton.disabled = false;
            newChatButton.disabled = false;

            // Save chat
            saveChat();
        } catch (error) {
            loadingDiv.style.display = 'none';
            messageInput.disabled = false;
            sendButton.disabled = false;
            newChatButton.disabled = false;
            console.error('Error:', error);
            alert('Failed to send message');
        }
    }

    /**
     * Event listeners
     */
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    newChatButton.addEventListener('click', () => {
        chatId = prompt('Enter new chat ID (default is default):');
        messages = [];
        chatDiv.innerHTML = '';
        displayChatIds();
    });

    // Initial load of chat IDs
    displayChatIds();
});