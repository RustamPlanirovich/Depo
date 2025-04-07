import React from "react";
import { Pie } from "react-chartjs-2";
import { pieChartOptions } from "../../constants/chartOptions";

/**
 * Reusable pie chart component
 * @param {Object} props
 * @param {Object} props.data - Chart data object
 * @param {Object} [props.options] - Additional chart options
 * @param {string} [props.className] - Additional CSS classes
 */
const PieChart = ({ data, options = {}, className = "" }) => {
  const mergedOptions = {
    ...pieChartOptions,
    ...options
  };

  return (
    <div className={`chart-container ${className}`}>
      <Pie data={data} options={mergedOptions} />
    </div>
  );
};

export default PieChart;
