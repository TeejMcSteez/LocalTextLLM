const { Ollama } = require('ollama');
const path = require('node:path');
const server = require('express');
const cors = require('cors');
const app = server();

// Initialize Ollama client
const ollama = new Ollama({
    host: 'http://localhost:11434',
    
});

app.use(cors());
app.use(server.static(path.join(__dirname, 'public')));
app.use(server.json()); // Add this line to parse JSON bodies

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.post('/API/chat', async (req, res) => {
    try {
        const message = req.body.message;
        const response = await ollama.chat({
            model: 'deepseek-r1:8b',
            messages: [{
                role: 'user',
                content: message,
                format: 'json'
            }]
        });
        
        // Send only the assistant's message content
        res.json({ 
            message: response.message.content 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response from Ollama' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
