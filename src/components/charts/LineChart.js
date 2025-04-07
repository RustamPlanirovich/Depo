import React from "react";
import { Line } from "react-chartjs-2";
import { lineChartOptions } from "../../constants/chartOptions";

/**
 * Reusable line chart component
 * @param {Object} props
 * @param {Object} props.data - Chart data object
 * @param {Object} [props.options] - Additional chart options
 * @param {string} [props.className] - Additional CSS classes
 */
const LineChart = ({ data, options = {}, className = "" }) => {
  const mergedOptions = {
    ...lineChartOptions,
    ...options
  };

  return (
    <div className={`chart-container ${className}`}>
      <Line data={data} options={mergedOptions} />
    </div>
  );
};

export default LineChart;
