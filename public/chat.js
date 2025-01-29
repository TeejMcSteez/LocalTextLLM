document.addEventListener('DOMContentLoaded', () => {
    const chatDiv = document.getElementById('chat');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');
    const loadingDiv = document.getElementById('loading');
    const paramSelect = document.getElementById('paramSelect');

    async function sendMessage() {
        const message = messageInput.value.trim();
        const selectedParam = paramSelect.value;
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

            const response = await fetch(`http://localhost:3000/API/chat${selectedParam}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // Hide loading indicator
            loadingDiv.style.display = 'none';
            
            // Add bot response with Markdown and KaTeX support
            const botDiv = document.createElement('div');
            if (window.markdownit && window.markdownitKatex) {
                const md = window.markdownit().use(window.markdownitKatex);
                const renderedMessage = md.render(data.message);
                botDiv.innerHTML = `<p><strong>Bot:</strong> ${renderedMessage}</p>`;
            } else {
                botDiv.innerHTML = `<p><strong>Bot:</strong> ${data.message}</p>`;
                console.error('Markdown-it or markdown-it-katex is not loaded');
            }
            chatDiv.appendChild(botDiv);
            
            // Trigger MathJax to process new content
            await MathJax.typesetPromise([botDiv]);
            
            // Smooth scroll to show new message
            botDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
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