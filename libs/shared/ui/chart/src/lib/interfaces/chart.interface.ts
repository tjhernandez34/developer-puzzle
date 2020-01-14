import { ChartDataPoint } from './chart-data-point.interface';

export interface Chart {
  title: string;
  type: string;
  data: ChartDataPoint[];
  columnNames: string[];
  options: {
    title: string;
    width: string;
    height: string;
  };
}
