import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    const interval = setInterval(() => {
        const data = {
            temperature: 20 + Math.random() * 10,
            humidity: 40 + Math.random() * 20,
            timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(data));
    }, 2000);

    ws.on('close', () => clearInterval(interval));
});

wss.on('headers', (headers) => {
    headers.push('Access-Control-Allow-Origin: *');
});

console.log('WebSocket server running on port 8080');