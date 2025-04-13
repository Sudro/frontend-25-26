export default class WSClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.messageHandlers = [];
    this.statusHandlers = [];
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      this.notifyStatus('connected');
    });

    this.socket.addEventListener('message', (event) => {
      this.messageHandlers.forEach(handler => handler(event.data));
    });

    this.socket.addEventListener('close', () => {
      this.notifyStatus('disconnected');
    });
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  onStatusChange(handler) {
    this.statusHandlers.push(handler);
  }

  notifyStatus(status) {
    this.statusHandlers.forEach(handler => handler(status));
  }

  send(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }
}
