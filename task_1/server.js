import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const messageHistory = [];
const clients = new Map();

app.use(express.static('public'));

function broadcastUsers() {
  const users = [];
  clients.forEach(clientInfo => {
    if (clientInfo.username) {
      users.push(clientInfo.username);
    }
  });
  const count = users.length;
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({
        type: 'users',
        users,
        count
      }));
    }
  });
}

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(ws, { clientId, username: null });
  
  ws.send(JSON.stringify({
    type: 'init',
    clientId: clientId
  }));

  ws.send(JSON.stringify({
    type: 'history',
    messages: messageHistory.map(m => ({
      content: m.content,
      timestamp: m.timestamp,
      clientId: m.clientId,
      username: m.username
    }))
  }));

  ws.on('message', (data) => {
    let messageObj;
    try {
      messageObj = JSON.parse(data);
    } catch (e) {
      return;
    }

    if (messageObj.type === 'register') {
      const clientInfo = clients.get(ws) || { clientId, username: null };
      clientInfo.username = messageObj.username;
      clients.set(ws, clientInfo);
      broadcastUsers();
    } else if (messageObj.type === 'message') {
      const clientInfo = clients.get(ws);
      const newMessage = {
        content: messageObj.content,
        timestamp: Date.now(),
        clientId: clientInfo.clientId,
        username: clientInfo.username || 'User'
      };
      
      messageHistory.push(newMessage);

      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            type: 'message',
            ...newMessage,
            isOwn: client === ws
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcastUsers();
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
