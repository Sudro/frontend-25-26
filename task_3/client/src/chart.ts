import { SensorData } from './interfaces';
import { Chart, ChartConfiguration } from 'chart.js/auto';

export class ChartRenderer {
    private temperatureChart: Chart;
    private humidityChart: Chart;
    private data: SensorData[] = [];
    
    constructor(
        private temperatureCanvas: HTMLCanvasElement,
        private humidityCanvas: HTMLCanvasElement,
        private maxDataPoints = 15
    ) {
        this.temperatureChart = this.initChart(temperatureCanvas, 'Температура (°C)');
        this.humidityChart = this.initChart(humidityCanvas, 'Влажность (%)');
    }

    private initChart(canvas: HTMLCanvasElement, label: string): Chart {
        const config: ChartConfiguration = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            }
        };
        return new Chart(canvas, config);
    }

    public updateCharts(newData: SensorData) {
        this.data.push(newData);
        if (this.data.length > this.maxDataPoints) {
            this.data.shift();
        }
        
        const labels = this.data.map(d => 
            new Date(d.timestamp).toLocaleTimeString()
        );
        
        this.updateChart(this.temperatureChart, labels, this.data.map(d => d.temperature));
        this.updateChart(this.humidityChart, labels, this.data.map(d => d.humidity));
    }

    private updateChart(chart: Chart, labels: string[], data: number[]) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    }
}