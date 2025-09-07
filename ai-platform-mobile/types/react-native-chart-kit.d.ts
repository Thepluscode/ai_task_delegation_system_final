declare module 'react-native-chart-kit' {
  import React from 'react';
  import { ViewStyle } from 'react-native';

  export interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    decimalPlaces?: number;
    color?: (opacity?: number) => string;
    labelColor?: (opacity?: number) => string;
    style?: ViewStyle;
    propsForDots?: any;
    barPercentage?: number;
  }

  export interface AbstractChartProps {
    width: number;
    height: number;
    chartConfig: ChartConfig;
    style?: ViewStyle;
    withHorizontalLabels?: boolean;
    withVerticalLabels?: boolean;
  }

  export interface BarChartProps extends AbstractChartProps {
    data: {
      labels: string[];
      datasets: {
        data: number[];
        colors?: ((opacity: number) => string)[];
      }[];
    };
    showValuesOnTopOfBars?: boolean;
  }

  export interface LineChartProps extends AbstractChartProps {
    data: {
      labels: string[];
      datasets: {
        data: number[];
        color?: (opacity: number) => string;
        strokeWidth?: number;
      }[];
    };
    bezier?: boolean;
  }

  export interface PieChartProps extends AbstractChartProps {
    data: Array<{
      name: string;
      population: number;
      color: string;
      legendFontColor: string;
      legendFontSize: number;
    }>;
    accessor: string;
    backgroundColor?: string;
    paddingLeft?: string;
    absolute?: boolean;
  }

  export class BarChart extends React.Component<BarChartProps> {}
  export class LineChart extends React.Component<LineChartProps> {}
  export class PieChart extends React.Component<PieChartProps> {}
}