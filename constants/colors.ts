export default {
  primary: '#8B7FD6',
  primaryDark: '#6B5FB6',
  primaryLight: '#ABA0E6',
  
  secondary: '#FF6B6B',
  secondaryDark: '#E85555',
  
  success: '#4CAF50',
  successLight: '#81C784',
  
  warning: '#FFA726',
  warningLight: '#FFB74D',
  
  error: '#F44336',
  errorDark: '#D32F2F',
  errorLight: '#FFEBEE',
  
  info: '#42A5F5',
  infoLight: '#64B5F6',
  
  background: '#F8F7FC',
  backgroundLight: '#FFFFFF',
  
  surface: '#FFFFFF',
  surfaceElevated: '#FEFEFE',
  
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  disabled: '#BDBDBD',
  disabledBackground: '#F5F5F5',
  
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  gradientPurple: ['#8B7FD6', '#ABA0E6'],
  gradientRed: ['#FF6B6B', '#FF8E8E'],
  gradientBlue: ['#42A5F5', '#64B5F6'],
  gradientGreen: ['#4CAF50', '#81C784'],
  gradientYellow: ['#FFA726', '#FFB74D'],
  gradientOrange: ['#FF9800', '#FFB74D'],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  small: 18,
  body: 20,
  large: 24,
  title: 28,
  heading: 34,
  display: 42,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const touchTarget = {
  minimum: 44,
  comfortable: 60,
  large: 80,
} as const;
