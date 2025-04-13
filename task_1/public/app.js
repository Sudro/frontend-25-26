import WSClient from './wsClient.js';
import ChatUI from './chatUI.js';

const wsClient = new WSClient(`ws://${window.location.host}`);
wsClient.connect();

wsClient.onStatusChange((status) => {
  if (status === 'connected') {
    let username = prompt('Введите ваше имя:');
    if (!username || username.trim() === '') {
      username = "Гость";
    }
    wsClient.send(JSON.stringify({
      type: 'register',
      username: username
    }));
  }
});

new ChatUI(wsClient);
