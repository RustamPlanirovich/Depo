/**
 * Export all chart components
 */
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components (Necessary for Chart.js v3+)
Chart.register(...registerables);

export { default as LineChart } from "./LineChart";
export { default as BarChart } from "./BarChart";
export { default as PieChart } from "./PieChart";
