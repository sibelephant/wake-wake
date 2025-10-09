/**
 * Color constants for alarm customization
 */
export const ALARM_COLORS = [
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#008080', // Teal
] as const;

/**
 * Gradient colors for different screen states
 */
export const GRADIENTS = {
  alarm: ['#FF8C42', '#FF6B35'], // Orange gradient for active alarms
  success: ['#10b981', '#059669'], // Green gradient for completion
  warning: ['#f59e0b', '#f97316'], // Amber/Orange for warnings
} as const;

/**
 * Text and UI colors
 */
export const UI_COLORS = {
  primary: '#6366f1',
  secondary: '#64748b',
  background: '#f8fafc',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    tertiary: '#94a3b8',
  },
  border: {
    light: '#f1f5f9',
    medium: '#e2e8f0',
    dark: '#cbd5e1',
  },
} as const;
