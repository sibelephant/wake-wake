/**
 * App-wide theme configuration
 */

export const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#64748b',
    background: '#f8fafc',
    white: '#ffffff',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      tertiary: '#94a3b8',
      light: '#cbd5e1',
    },
    border: {
      light: '#f1f5f9',
      medium: '#e2e8f0',
      dark: '#cbd5e1',
    },
    overlay: 'rgba(0,0,0,0.5)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 30,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      huge: 32,
      display: 48,
      giant: 56,
    },
    fontWeight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;
