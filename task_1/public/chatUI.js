export default class ChatUI {
  constructor(wsClient) {
    this.ws = wsClient;
    this.clientId = null;
    this.initializeDOM();
    this.setupEventListeners();
    this.bindWebSocketEvents();

    this.ws.onStatusChange((status) => {
      if (status === 'connected') {
      } else if (status === 'disconnected') {
        this.updateStatusIndicatorOffline();
      }
    });
  }

  initializeDOM() {
    this.elements = {
      form: document.getElementById('chat-form'),
      input: document.getElementById('message-input'),
      history: document.getElementById('message-history'),
      status: document.getElementById('status-indicator')
    };
  }

  setupEventListeners() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = this.elements.input.value.trim();
      if (message) {
        this.ws.send(JSON.stringify({
          type: 'message',
          content: message
        }));
        this.elements.input.value = '';
      }
    });
  }

  bindWebSocketEvents() {
    this.ws.onMessage(async (data) => {
      const message = JSON.parse(data);
      
      switch(message.type) {
        case 'init':
          this.clientId = message.clientId;
          break;
          
        case 'message':
          this.addMessage({
            ...message,
            isOwn: message.clientId === this.clientId
          });
          break;
        
        case 'history':
          this.loadHistory(message.messages);
          break;

        case 'users':
          this.updateStatusIndicatorUsers(message.users, message.count);
          break;
      }
    });
  }

  updateStatusIndicatorUsers(users, count) {
    this.elements.status.textContent = `Пользователи онлайн (${count}): ${users.join(', ')}`;
  }

  updateStatusIndicatorOffline() {
    this.elements.status.textContent = '🔴 Offline';
  }

  loadHistory(messages) {
    messages.forEach(msg => {
      this.addMessage({
        ...msg,
        isOwn: msg.clientId === this.clientId
      });
    });
  }

  addMessage(message) {
    const element = document.createElement('div');
    element.className = `message ${message.isOwn ? 'own' : 'other'}`;
    element.innerHTML = `
      <div class="content">${message.content}</div>
      <div class="meta">
        <div class="time">${new Date(message.timestamp).toLocaleTimeString()}</div>
        <div class="sender">${message.username || 'User'}</div>
      </div>
    `;
    this.elements.history.appendChild(element);
    this.elements.history.scrollTop = this.elements.history.scrollHeight;
  }
}
