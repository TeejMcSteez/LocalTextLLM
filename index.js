const { Ollama } = require('ollama');
const path = require('node:path');
const server = require('express');
const cors = require('cors');
const app = server();


// TODO:
//  Make scroll stay up the top upon response


// Initialize Ollama client
const ollama = new Ollama({
    host: 'http://localhost:11434',
    
});
// TODO:
// Add a callback for chat API to end the conversation upon trigger
// Allowing the user to stop a message if they mess up
// 
app.use(cors());
app.use(server.static(path.join(__dirname, 'public')));
app.use(server.json()); // Add this line to parse JSON bodies

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});
// TODO:
// Delete or repurpose default route
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

// TODO
// Add different routes for different models depending on what the users selection is
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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
