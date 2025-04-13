export interface SensorData {
    temperature: number;
    humidity: number;
    timestamp: string;
}

export type DataUpdateCallback = (data: SensorData) => void;