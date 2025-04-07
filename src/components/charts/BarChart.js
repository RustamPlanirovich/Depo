import React from "react";
import { Bar } from "react-chartjs-2";
import { barChartOptions } from "../../constants/chartOptions";

/**
 * Reusable bar chart component
 * @param {Object} props
 * @param {Object} props.data - Chart data object
 * @param {Object} [props.options] - Additional chart options
 * @param {string} [props.className] - Additional CSS classes
 */
const BarChart = ({ data, options = {}, className = "" }) => {
  const mergedOptions = {
    ...barChartOptions,
    ...options
  };

  return (
    <div className={`chart-container ${className}`}>
      <Bar data={data} options={mergedOptions} />
    </div>
  );
};

export default BarChart;
