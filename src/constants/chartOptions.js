/**
 * Common chart options and configurations
 */

import { CHART_HEIGHT, CHART_ANIMATION_DURATION, TOOLTIP_DELAY } from "./index";

// Common options for all charts
export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: CHART_ANIMATION_DURATION
  },
  plugins: {
    tooltip: {
      delay: TOOLTIP_DELAY
    },
    legend: {
      position: "top",
      labels: {
        color: "rgba(255, 255, 255, 0.9)"
      }
    }
  }
};

// Line chart specific options
export const lineChartOptions = {
  ...commonChartOptions,
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        color: "rgba(255, 255, 255, 0.7)"
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)"
      }
    },
    x: {
      ticks: {
        color: "rgba(255, 255, 255, 0.7)"
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)"
      }
    }
  }
};

// Bar chart specific options
export const barChartOptions = {
  ...commonChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: "rgba(255, 255, 255, 0.7)"
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)"
      }
    },
    x: {
      ticks: {
        color: "rgba(255, 255, 255, 0.7)"
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)"
      }
    }
  }
};

// Pie chart specific options
export const pieChartOptions = {
  ...commonChartOptions,
  plugins: {
    ...commonChartOptions.plugins,
    legend: {
      position: "right",
      labels: {
        color: "rgba(255, 255, 255, 0.9)"
      }
    }
  }
};
