const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Mock decibel data endpoint for testing
app.get('/meter/livedata', (req, res) => {
    try {
        // Simulate realistic decibel readings
        const baseLevel = 45;
        const variation = Math.sin(Date.now() / 1000) * 10;
        const randomNoise = (Math.random() - 0.5) * 5;
        const decibelValue = Math.max(20, Math.min(120, baseLevel + variation + randomNoise));
        
        const response = {
            decibel: Math.round(decibelValue * 10) / 10,
            timestamp: Date.now(),
            status: 'active'
        };
        
        console.log(`[${new Date().toISOString()}] Mock decibel data sent: ${response.decibel} dB`);
        res.json(response);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error generating decibel data:`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: Date.now()
        });
    }
});

// Proxy endpoint to bypass CORS for real decibel meter
app.get('/proxy/meter/livedata', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:49994/meter/livedata');
        const data = await response.json();
        
        console.log(`[${new Date().toISOString()}] Proxied decibel data: ${JSON.stringify(data).substring(0, 100)}...`);
        res.json(data);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error proxying decibel data:`, error);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message,
            timestamp: Date.now()
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Server error:`, err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        timestamp: Date.now()
    });
});

// Handle 404
app.use((req, res) => {
    console.log(`[${new Date().toISOString()}] 404 - Route not found: ${req.path}`);
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.path} not found`,
        timestamp: Date.now()
    });
});

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Decibel Meter server running at http://localhost:${PORT}`);
    console.log(`[${new Date().toISOString()}] Mock decibel data available at http://localhost:${PORT}/meter/livedata`);
    console.log(`[${new Date().toISOString()}] Open the browser and navigate to http://localhost:3000 to view the decibel meter`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[${new Date().toISOString()}] Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
        process.exit(1);
    } else {
        console.error(`[${new Date().toISOString()}] Server error:`, err);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(`[${new Date().toISOString()}] SIGTERM received, shutting down gracefully`);
    server.close(() => {
        console.log(`[${new Date().toISOString()}] Server closed`);
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log(`[${new Date().toISOString()}] SIGINT received, shutting down gracefully`);
    server.close(() => {
        console.log(`[${new Date().toISOString()}] Server closed`);
        process.exit(0);
    });
});
