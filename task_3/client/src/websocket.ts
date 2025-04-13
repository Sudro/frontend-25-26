import { SensorData, DataUpdateCallback } from './interfaces';

export class WebSocketClient {
    private socket: WebSocket | null = null;
    private listeners: DataUpdateCallback[] = [];
    private reconnectAttempts: number = 0;

    constructor(private readonly url: string) {
        this.connect();
    }

    private connect(): void {
        this.socket = new WebSocket(this.url);

        this.socket.onmessage = (event) => {
            try {
                const data: SensorData = JSON.parse(event.data);
                this.listeners.forEach(callback => callback(data));
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.socket.onclose = () => {
            setTimeout(() => {
                if (this.reconnectAttempts < 5) {
                    this.reconnectAttempts++;
                    this.connect();
                }
            }, 3000);
        };
    }

    public addListener(callback: DataUpdateCallback): void {
        this.listeners.push(callback);
    }

    public disconnect(): void {
        this.socket?.close();
        this.reconnectAttempts = 5;
    }

    public reconnect(): void {
        this.reconnectAttempts = 0;
        this.connect();
    }

    public get isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}