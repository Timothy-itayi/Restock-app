// Color utility functions for restock sessions and emails
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SESSION_COLORS = [
  { primary: '#14B8A6', secondary: '#14B8A620', name: 'Teal' },        // Teal
  { primary: '#84CC16', secondary: '#84CC1620', name: 'Lime' },        // Lime
  { primary: '#F97316', secondary: '#F9731620', name: 'Orange' },      // Orange
  { primary: '#8B5CF6', secondary: '#8B5CF620', name: 'Purple' },      // Purple
  { primary: '#EAB308', secondary: '#EAB30820', name: 'Yellow' },      // Yellow
  { primary: '#EC4899', secondary: '#EC489920', name: 'Pink' },        // Pink
  { primary: '#06B6D4', secondary: '#06B6D420', name: 'Cyan' },        // Cyan
  { primary: '#10B981', secondary: '#10B98120', name: 'Emerald' },     // Emerald
  { primary: '#F59E0B', secondary: '#F59E0B20', name: 'Amber' },       // Amber
  { primary: '#6366F1', secondary: '#6366F120', name: 'Indigo' },      // Indigo
  { primary: '#EF4444', secondary: '#EF444420', name: 'Red' },         // Red
  { primary: '#8B5A2B', secondary: '#8B5A2B20', name: 'Brown' },       // Brown
];

export interface SessionColor {
  primary: string;
  secondary: string;
  name: string;
}

// Storage key for session colors
const SESSION_COLORS_KEY = 'sessionColors';

// Get color for a session ID (async version)
export const getSessionColor = async (sessionId: string, index?: number): Promise<SessionColor> => {
  // Try to get stored color first
  const storedColors = await getStoredSessionColors();
  if (storedColors[sessionId]) {
    return storedColors[sessionId];
  }

  // Generate new color based on session ID hash or index
  const colorIndex = sessionId 
    ? hashStringToIndex(sessionId, SESSION_COLORS.length)
    : (index || 0) % SESSION_COLORS.length;
  
  const color = SESSION_COLORS[colorIndex];
  
  // Store the color for this session
  await storeSessionColor(sessionId, color);
  
  return color;
};

// Synchronous version for immediate use (doesn't store)
export const getSessionColorSync = (sessionId: string, index?: number): SessionColor => {
  const colorIndex = sessionId 
    ? hashStringToIndex(sessionId, SESSION_COLORS.length)
    : (index || 0) % SESSION_COLORS.length;
  
  return SESSION_COLORS[colorIndex];
};

// Hash string to get consistent index
const hashStringToIndex = (str: string, maxIndex: number): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % maxIndex;
};

// Get stored session colors
const getStoredSessionColors = async (): Promise<{ [sessionId: string]: SessionColor }> => {
  try {
    const stored = await AsyncStorage.getItem(SESSION_COLORS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Store session color
const storeSessionColor = async (sessionId: string, color: SessionColor): Promise<void> => {
  try {
    const storedColors = await getStoredSessionColors();
    storedColors[sessionId] = color;
    await AsyncStorage.setItem(SESSION_COLORS_KEY, JSON.stringify(storedColors));
  } catch {
    // Ignore storage errors
  }
};

// Get color for supplier breakdown (legacy function)
export const getSupplierColor = (index: number): string => {
  return SESSION_COLORS[index % SESSION_COLORS.length].primary;
};

// Clear all stored colors (useful for testing/cleanup)
export const clearStoredColors = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_COLORS_KEY);
  } catch {
    // Ignore errors
  }
};

// Get color theme for a session (includes multiple shades) - sync version
export const getSessionColorTheme = (sessionId: string, index?: number) => {
  const baseColor = getSessionColorSync(sessionId, index);
  
  return {
    ...baseColor,
    light: baseColor.primary + '10',
    medium: baseColor.primary + '40',
    dark: baseColor.primary + 'CC',
  };
};