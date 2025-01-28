document.addEventListener('DOMContentLoaded', () => {
    const chatDiv = document.getElementById('chat');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');
    const loadingDiv = document.getElementById('loading');

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message){
            alert('No message to send');
            return;
        }

        try {
            // Add user message immediately
            const userDiv = document.createElement('div');
            userDiv.innerHTML = `<p><strong>You:</strong> ${message}</p>`;
            chatDiv.appendChild(userDiv);
            
            // Show loading indicator
            loadingDiv.style.display = 'block';
            chatDiv.appendChild(loadingDiv);
            
            // Disable input while processing
            messageInput.disabled = true;
            sendButton.disabled = true;

            const response = await fetch('http://localhost:3000/API/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // Hide loading indicator
            loadingDiv.style.display = 'none';
            
            // Add bot response with Markdown and MathJax support
            const botDiv = document.createElement('div');
            const renderedMessage = marked.parse(data.message);
            botDiv.innerHTML = `<p><strong>Bot:</strong> ${renderedMessage}</p>`;
            chatDiv.appendChild(botDiv);
            
            // Trigger MathJax to process new content
            MathJax.typesetPromise([botDiv]).catch((err) => console.log('MathJax error:', err));
            
            // Auto scroll to bottom
            chatDiv.scrollTop = chatDiv.scrollHeight;
            messageInput.value = '';
            
            // Re-enable input
            messageInput.disabled = false;
            sendButton.disabled = false;
        } catch (error) {
            loadingDiv.style.display = 'none';
            messageInput.disabled = false;
            sendButton.disabled = false;
            console.error('Error:', error);
            alert('Failed to send message');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});