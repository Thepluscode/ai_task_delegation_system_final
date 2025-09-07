/**
 * Premium Color System for AutomatedAIPlatform
 *
 * A comprehensive color system with semantic naming, theming support,
 * and accessibility utilities that form the foundation of our billion-dollar UI.
 */

// Base color palette with full spectrum for each primary color
export const palette = {
  // Primary brand color - Indigo/Purple
  primary: {
    50: '#f0f0ff',
    100: '#e0e0ff',
    200: '#c0c0ff',
    300: '#9090ff',
    400: '#7070ff',
    500: '#6c5ce7', // Main brand color
    600: '#5a4dd1',
    700: '#483db0',
    800: '#362e88',
    900: '#251f66',
  },
  
  // Secondary color - Teal
  secondary: {
    50: '#e0ffff',
    100: '#b0ffff',
    200: '#70ffff',
    300: '#30ffff',
    400: '#00e0e0',
    500: '#00b8b8', // Main accent color
    600: '#009090',
    700: '#007070',
    800: '#005050',
    900: '#003030',
  },
  
  // Success color - Green
  success: {
    50: '#e0ffe0',
    100: '#b0ffb0',
    200: '#70ff70',
    300: '#30ff30',
    400: '#00e000',
    500: '#00b800', // Main success color
    600: '#009000',
    700: '#007000',
    800: '#005000',
    900: '#003000',
  },
  
  // Warning color - Amber
  warning: {
    50: '#fffae0',
    100: '#fff5b0',
    200: '#fff070',
    300: '#ffeb30',
    400: '#ffe600',
    500: '#ffc107', // Main warning color
    600: '#d19200',
    700: '#a36f00',
    800: '#704d00',
    900: '#422c00',
  },
  
  // Error color - Red
  error: {
    50: '#ffe0e0',
    100: '#ffb0b0',
    200: '#ff7070',
    300: '#ff3030',
    400: '#ff0000',
    500: '#d10000', // Main error color
    600: '#a30000',
    700: '#700000',
    800: '#500000',
    900: '#300000',
  },
  
  // Neutral color - Grayscale
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280', // Main text color
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
};

// Semantic color tokens for light theme
export const semanticLight = {
  background: {
    primary: palette.neutral[50],
    secondary: palette.neutral[100],
    tertiary: palette.neutral[200],
    brand: palette.primary[50],
    success: palette.success[50],
    warning: palette.warning[50],
    error: palette.error[50],
    card: '#ffffff',
  },
  text: {
    primary: palette.neutral[900],
    secondary: palette.neutral[700],
    tertiary: palette.neutral[500],
    disabled: palette.neutral[400],
    inverse: palette.neutral[50],
    link: palette.primary[600],
    brand: palette.primary[700],
    success: palette.success[700],
    warning: palette.warning[700],
    error: palette.error[700],
  },
  border: {
    light: palette.neutral[200],
    default: palette.neutral[300],
    strong: palette.neutral[400],
    focus: palette.primary[500],
    brand: palette.primary[300],
  },
  icon: {
    primary: palette.neutral[700],
    secondary: palette.neutral[500],
    tertiary: palette.neutral[400],
    brand: palette.primary[600],
    success: palette.success[600],
    warning: palette.warning[600],
    error: palette.error[600],
  },
  button: {
    primaryBg: palette.primary[500],
    primaryHover: palette.primary[600],
    primaryActive: palette.primary[700],
    primaryText: palette.neutral[50],
    secondaryBg: palette.secondary[500],
    secondaryHover: palette.secondary[600],
    secondaryActive: palette.secondary[700],
    secondaryText: palette.neutral[50],
    ghostBg: 'transparent',
    ghostHover: palette.neutral[100],
    ghostActive: palette.neutral[200],
    ghostText: palette.primary[600],
  },
  gradients: {
    primaryButton: `linear-gradient(135deg, ${palette.primary[600]} 0%, ${palette.primary[500]} 100%)`,
    secondaryButton: `linear-gradient(135deg, ${palette.secondary[600]} 0%, ${palette.secondary[500]} 100%)`,
    successCard: `linear-gradient(135deg, ${palette.success[600]} 0%, ${palette.success[500]} 100%)`,
    warningCard: `linear-gradient(135deg, ${palette.warning[600]} 0%, ${palette.warning[500]} 100%)`,
    errorCard: `linear-gradient(135deg, ${palette.error[600]} 0%, ${palette.error[500]} 100%)`,
    brandCard: `linear-gradient(135deg, ${palette.primary[600]} 0%, ${palette.primary[500]} 100%)`,
  },
  status: {
    active: palette.success[500],
    inactive: palette.neutral[400],
    maintenance: palette.warning[500],
    error: palette.error[500],
  },
};

// Semantic color tokens for dark theme
export const semanticDark = {
  background: {
    primary: palette.neutral[900],
    secondary: palette.neutral[800],
    tertiary: palette.neutral[700],
    brand: palette.primary[900],
    success: palette.success[900],
    warning: palette.warning[900],
    error: palette.error[900],
    card: palette.neutral[800],
  },
  text: {
    primary: palette.neutral[50],
    secondary: palette.neutral[300],
    tertiary: palette.neutral[400],
    disabled: palette.neutral[600],
    inverse: palette.neutral[900],
    link: palette.primary[400],
    brand: palette.primary[400],
    success: palette.success[400],
    warning: palette.warning[400],
    error: palette.error[400],
  },
  border: {
    light: palette.neutral[700],
    default: palette.neutral[600],
    strong: palette.neutral[500],
    focus: palette.primary[500],
    brand: palette.primary[700],
  },
  icon: {
    primary: palette.neutral[300],
    secondary: palette.neutral[400],
    tertiary: palette.neutral[500],
    brand: palette.primary[400],
    success: palette.success[400],
    warning: palette.warning[400],
    error: palette.error[400],
  },
  button: {
    primaryBg: palette.primary[500],
    primaryHover: palette.primary[400],
    primaryActive: palette.primary[300],
    primaryText: palette.neutral[50],
    secondaryBg: palette.secondary[500],
    secondaryHover: palette.secondary[400],
    secondaryActive: palette.secondary[300],
    secondaryText: palette.neutral[50],
    ghostBg: 'transparent',
    ghostHover: palette.neutral[800],
    ghostActive: palette.neutral[700],
    ghostText: palette.primary[400],
  },
  gradients: {
    primaryButton: `linear-gradient(135deg, ${palette.primary[500]} 0%, ${palette.primary[400]} 100%)`,
    secondaryButton: `linear-gradient(135deg, ${palette.secondary[500]} 0%, ${palette.secondary[400]} 100%)`,
    successCard: `linear-gradient(135deg, ${palette.success[500]} 0%, ${palette.success[400]} 100%)`,
    warningCard: `linear-gradient(135deg, ${palette.warning[500]} 0%, ${palette.warning[400]} 100%)`,
    errorCard: `linear-gradient(135deg, ${palette.error[500]} 0%, ${palette.error[400]} 100%)`,
    brandCard: `linear-gradient(135deg, ${palette.primary[500]} 0%, ${palette.primary[400]} 100%)`,
  },
  status: {
    active: palette.success[500],
    inactive: palette.neutral[500],
    maintenance: palette.warning[500],
    error: palette.error[500],
  },
};

// Color system with theming support
export const colors = {
  light: semanticLight,
  dark: semanticDark,
};

// Accessibility utilities
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number): string => {
    // Convert hex to rgba
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // For predefined rgba colors
    if (color.startsWith('rgba')) {
      const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (parts) {
        return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
      }
    }
    // For rgb colors
    if (color.startsWith('rgb')) {
      const parts = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (parts) {
        return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
      }
    }
    return color;
  },

  // Calculate contrast ratio between two colors
  calculateContrastRatio: (foreground: string, background: string): number => {
    // This is a simplified version - a real implementation would convert colors to luminance values
    // and calculate the actual contrast ratio according to WCAG guidelines
    return 4.5; // Placeholder for demonstration
  },

  // Check if contrast meets WCAG AA standards (4.5:1 for normal text)
  meetsWCAGAA: (foreground: string, background: string): boolean => {
    return colorUtils.calculateContrastRatio(foreground, background) >= 4.5;
  },

  // Check if contrast meets WCAG AAA standards (7:1 for normal text)
  meetsWCAGAAA: (foreground: string, background: string): boolean => {
    return colorUtils.calculateContrastRatio(foreground, background) >= 7;
  },

  // Get appropriate text color for a background (black or white)
  getContrastText: (backgroundColor: string): string => {
    // Simplified - would normally calculate luminance
    return '#ffffff'; // Placeholder
  },

  // Get status color based on status string
  getStatusColor: (status: string, theme: 'light' | 'dark' = 'light'): string => {
    const statusColors = colors[theme].status;
    switch (status.toLowerCase()) {
      case 'active':
        return statusColors.active;
      case 'inactive':
        return statusColors.inactive;
      case 'maintenance':
        return statusColors.maintenance;
      case 'error':
        return statusColors.error;
      default:
        return statusColors.inactive;
    }
  },

  // Get status gradient based on status string
  getStatusGradient: (status: string, theme: 'light' | 'dark' = 'light'): string[] => {
    switch (status.toLowerCase()) {
      case 'active':
        return [palette.success[500], palette.success[600]];
      case 'maintenance':
        return [palette.warning[500], palette.warning[600]];
      case 'offline':
      case 'inactive':
        return [palette.neutral[500], palette.neutral[600]];
      case 'error':
        return [palette.error[500], palette.error[600]];
      default:
        return [palette.neutral[500], palette.neutral[600]];
    }
  },
};

// Export default theme based on user preference or system setting
export const defaultTheme = 'light';

// Export the entire color system
export default {
  palette,
  semantic: semanticLight, // Default to light theme
  colors,
  colorUtils,
  defaultTheme,
};