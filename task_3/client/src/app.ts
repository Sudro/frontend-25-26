import { WebSocketClient } from './websocket';
import { ChartRenderer } from './chart';

class DashboardApp {
    private wsClient: WebSocketClient;
    private chartRenderer: ChartRenderer;
    private connectButton: HTMLButtonElement;

    constructor() {
        this.connectButton = this.getConnectButton();
        this.chartRenderer = this.initializeCharts();
        this.wsClient = new WebSocketClient('ws://localhost:8080');
        this.setupListeners();
    }

    private getConnectButton(): HTMLButtonElement {
        const button = document.getElementById('connectButton');
        if (!button) throw new Error('Connect button not found');
        return button as HTMLButtonElement;
    }

    private initializeCharts(): ChartRenderer {
        const tempCanvas = document.getElementById('temperatureChart');
        const humCanvas = document.getElementById('humidityChart');
        
        if (!tempCanvas || !humCanvas) {
            throw new Error('Canvas elements not found');
        }

        return new ChartRenderer(
            tempCanvas as HTMLCanvasElement,
            humCanvas as HTMLCanvasElement
        );
    }

    private setupListeners(): void {
        this.wsClient.addListener((data) => 
            this.chartRenderer.updateCharts(data)
        );

        this.connectButton.addEventListener('click', () => {
            if (this.wsClient.isConnected) {
                this.wsClient.disconnect();
                this.connectButton.textContent = 'Подключиться';
            } else {
                this.wsClient.reconnect();
                this.connectButton.textContent = 'Отключиться';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardApp();
});