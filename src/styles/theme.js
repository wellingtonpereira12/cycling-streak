export const lightTheme = {
  colors: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceLight: '#F0F0F0',
    primary: '#FF5722', // Deep Orange
    primaryVariant: '#E64A19',
    secondary: '#4CAF50', // Green
    error: '#B00020',
    text: '#000000',
    textSecondary: '#757575',
    fire: '#FFC107', // Amber for fire icon
    disabled: '#E0E0E0',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold', color: '#000000' },
    h2: { fontSize: 24, fontWeight: 'bold', color: '#000000' },
    subtitle: { fontSize: 18, color: '#757575' },
    body: { fontSize: 16, color: '#000000' },
    caption: { fontSize: 14, color: '#888888' },
  }
};

export const darkTheme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceLight: '#2C2C2C',
    primary: '#FF5722', // Deep Orange
    primaryVariant: '#E64A19',
    secondary: '#4CAF50', // Green
    error: '#CF6679',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    fire: '#FFC107', // Amber for fire icon
    disabled: '#3E3E3E',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
    h2: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    subtitle: { fontSize: 18, color: '#B0B0B0' },
    body: { fontSize: 16, color: '#FFFFFF' },
    caption: { fontSize: 14, color: '#888888' },
  }
};

// For backward compatibility during migration
export const theme = darkTheme;
