// Default values and configuration constants
// Deposit related constants
export const DEFAULT_INITIAL_DEPOSIT = 1000;
export const DEFAULT_LEVERAGE = 1;
export const DEFAULT_DAILY_TARGET = 1;

// Risk management constants
export const MAX_DAILY_LOSS_PERCENTAGE = 2;
export const MAX_TOTAL_LOSS_PERCENTAGE = 5;
export const RISK_WARNING_THRESHOLD = 1.5;

// UI constants
export const CHART_HEIGHT = 300;
export const CHART_ANIMATION_DURATION = 1000;
export const TOOLTIP_DELAY = 200;

// Time range options
export const TIME_RANGES = {
  ALL: "all",
  WEEK: "7d",
  MONTH: "30d",
  QUARTER: "90d",
  YEAR: "1y"
};

// Theme constants
export const THEME = {
  LIGHT: "light",
  DARK: "dark"
};

// Local storage keys
export const STORAGE_KEYS = {
  DEPOSIT: "deposit",
  DAYS: "days",
  GOALS: "goals",
  ARCHIVED_DAYS: "archivedDays",
  THEME: "theme"
};
