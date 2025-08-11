// Centralized color palette for the Restock app with light & dark mode

const light = {
  brand: {
    primary: '#6d9f72',
    secondary: '#a3a695',
    accent: '#e2ad5d',
  },
  neutral: {
    lightest: '#ffffff',
    lighter: '#f0eee4',
    light: '#e1e8ed',
    medium: '#a0a38f',
    dark: '#4a4c38',
    darkest: '#1c2011',
  },
  status: {
    success: '#6d9f72',
    warning: '#e2ad5d',
    error: '#c94c4c',
    info: '#5a8ca1',
  },
  state: {
    disabled: '#c5c8b6',
    overlay: 'rgba(0,0,0,0.5)',
  },
  pagination: {
    active: '#6d9f72',
    inactive: '#DEE2E6',
  },
} as const;

const dark = {
  brand: {
    primary: '#8fcca0',
    secondary: '#b6c2a1',
    accent: '#f2c46d',
  },
  neutral: {
    lightest: '#1a1a1a',
    lighter: '#222522',
    light: '#2f332e',
    medium: '#a0a38f',
    dark: '#dce0d4',
    darkest: '#f5f6f0',
  },
  status: {
    success: '#8fcca0',
    warning: '#f2c46d',
    error: '#e57373',
    info: '#7ab3c4',
  },
  state: {
    disabled: '#555a52',
    overlay: 'rgba(255,255,255,0.1)',
  },
  pagination: {
    active: '#8fcca0',
    inactive: '#555a52',
  },
} as const;

// Backward-compatible default export that exposes light at the top-level
// and also provides nested light/dark palettes for consumers who need them.
const colors = Object.assign({}, light, { light, dark });

export type AppColors = typeof light;
export type ThemeModes = { light: typeof light; dark: typeof dark };
export { light, dark };
export default colors;


