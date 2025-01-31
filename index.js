const { Ollama } = require('ollama');
const path = require('node:path');
const server = require('express');
const cors = require('cors');
const redis = require('redis');
const app = server();

// Initialize Redis client
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.error('Redis error:', err));

// Connect to Redis
redisClient.connect().catch(console.error);

// Initialize Ollama client
const ollama = new Ollama({
    host: 'http://localhost:11434',
});

app.use(cors());
app.use(server.static(path.join(__dirname, 'public')));
app.use(server.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Save chat session
app.post('/API/saveChat', async (req, res) => {
    const { chatId, messages } = req.body;
    try {
        await redisClient.set(chatId, JSON.stringify(messages));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving chat:', error);
        res.status(500).json({ error: 'Failed to save chat' });
    }
});

// Load chat session
app.get('/API/loadChat/:chatId', async (req, res) => {
    const { chatId } = req.params;
    try {
        const messages = await redisClient.get(chatId);
        res.json({ messages: JSON.parse(messages) });
    } catch (error) {
        console.error('Error loading chat:', error);
        res.status(500).json({ error: 'Failed to load chat' });
    }
});

// Chat routes
app.post('/API/chat', async (req, res) => {
    try {
        const message = req.body.message;
        const response = await ollama.chat({
            model: 'deepseek-r1:1.5b',
             messages: [{
                role: 'user',
                content: message + " and if is math or code respond with markdown and LaTeX support for frontend compability you must do this.", 
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

app.post('/API/chat1.5b', async (req, res) => {
    try {
        const message = req.body.message;
        const response = await ollama.chat({
            model: 'deepseek-r1:1.5b',
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

app.post('/API/chat8b', async (req, res) => {
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

app.post('/API/chat32b', async (req, res) => {
    try {
        const message = req.body.message;
        const response = await ollama.chat({
            model: 'deepseek-r1:32b',
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

app.get('/API/getAllChats', async (req, res) => {
    try {
        const keys = await redisClient.keys('*');
        res.json({ chatIds: keys });
    } catch (error) {
        console.error('Error getting chat IDs:', error);
        res.status(500).json({ error: 'Failed to get chat IDs' });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({"message": "file not found"});
})

// 500 Handler
app.use((req, res) => {
    res.status(500).json({"message": "an error occured on the server"});
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});