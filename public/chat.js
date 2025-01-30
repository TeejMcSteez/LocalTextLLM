document.addEventListener('DOMContentLoaded', () => {
    const chatDiv = document.getElementById('chat');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');
    const loadingDiv = document.getElementById('loading');
    const paramSelect = document.getElementById('paramSelect');
    const newChatButton = document.getElementById('newChat');
    const loadChatButton = document.getElementById('loadChat');
    let chatId = 'default';
    let messages = [];

    async function saveChat() {
        try {
            await fetch('http://localhost:3000/API/saveChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId, messages })
            });
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    }

    async function loadChat() {
        try {
            const response = await fetch(`http://localhost:3000/API/loadChat/${chatId}`);
            const data = await response.json();
            messages = data.messages || [];
            chatDiv.innerHTML = '';
            messages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.innerHTML = `<p><strong>${msg.role}:</strong> ${msg.content}</p>`;
                chatDiv.appendChild(msgDiv);
            });
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    }

    async function sendMessage() {
        const message = messageInput.value.trim();
        const selectedParam = paramSelect.value;
        if (!message) {
            alert('No message to send');
            return;
        }

        try {
            // Add user message immediately
            const userDiv = document.createElement('div');
            userDiv.innerHTML = `<p><strong>You:</strong> ${message}</p>`;
            chatDiv.appendChild(userDiv);
            messages.push({ role: 'user', content: message });

            // Show loading indicator
            loadingDiv.style.display = 'block';
            chatDiv.appendChild(loadingDiv);

            // Disable input while processing
            messageInput.disabled = true;
            sendButton.disabled = true;
            newChatButton.disabled = true;
            loadChatButton.disabled = true;

            const response = await fetch(`http://localhost:3000/API/chat${selectedParam}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            const botDiv = document.createElement('div');
            
            if (data.message === undefined) {
                alert("Server is not running or model is not loaded try another one or come back later.");
            }

            // Hide loading indicator
            loadingDiv.style.display = 'none';

            // Add bot response with Markdown and KaTeX support
            if (window.markdownit && window.markdownitKatex) {
                const md = window.markdownit().use(window.markdownitKatex);
                const renderedMessage = md.render(data.message);
                botDiv.innerHTML = `<p><strong>Bot:</strong> ${renderedMessage}</p>`;
            } else {
                botDiv.innerHTML = `<p><strong>Bot:</strong> ${data.message}</p>`;
                console.error('Markdown-it or markdown-it-katex is not loaded');
            }
            chatDiv.appendChild(botDiv);
            messages.push({ role: 'bot', content: data.message });

            // Trigger MathJax to process new content
            await MathJax.typesetPromise([botDiv]);

            // Smooth scroll to show new message
            botDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
            messageInput.value = '';

            // Re-enable input
            messageInput.disabled = false;
            sendButton.disabled = false;
            newChatButton.disabled = false;
            loadChatButton.disabled = false;

            // Save chat
            saveChat();
        } catch (error) {
            loadingDiv.style.display = 'none';
            messageInput.disabled = false;
            sendButton.disabled = false;
            newChatButton.disabled = false;
            loadChatButton.disabled = false;
            console.error('Error:', error);
            alert('Failed to send message');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    newChatButton.addEventListener('click', () => {
        chatId = prompt('Enter new chat ID:');
        messages = [];
        chatDiv.innerHTML = '';
    });
    loadChatButton.addEventListener('click', () => {
        chatId = prompt('Enter chat ID to load (default is default):');
        loadChat();
    });
});