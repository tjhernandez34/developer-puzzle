export interface ChartDataPoint {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  uOpen: number;
  uClose: number;
  uHigh: number;
  uLow: number;
  uVolume: number;
  change: number;
  changePercent: number;
  label: string;
  changeOverTime: number;
}
