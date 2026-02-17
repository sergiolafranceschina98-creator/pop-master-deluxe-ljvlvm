
import { StyleSheet } from 'react-native';

// PopMaster Deluxe Color Palette - Vibrant and Playful
export const colors = {
  // Main colors
  background: '#FFF5F7',
  backgroundDark: '#1A0E13',
  
  text: '#2D1B2E',
  textDark: '#F5E6F0',
  textSecondary: '#8B6B8F',
  textSecondaryDark: '#B89CB8',
  
  // Vibrant accent colors for bubbles and effects
  primary: '#FF6B9D',      // Hot pink
  secondary: '#A78BFA',    // Purple
  accent: '#60D5FF',       // Cyan
  highlight: '#FFD93D',    // Yellow
  
  // Bubble colors
  bubblePink: '#FF6B9D',
  bubblePurple: '#A78BFA',
  bubbleCyan: '#60D5FF',
  bubbleYellow: '#FFD93D',
  bubbleGreen: '#6EE7B7',
  bubbleOrange: '#FB923C',
  
  // UI elements
  card: '#FFFFFF',
  cardDark: '#2D1B2E',
  cardBorder: '#FFE0EC',
  cardBorderDark: '#4A2F4D',
  
  // Game mode colors
  bubblePopMode: '#FF6B9D',
  chainPopMode: '#A78BFA',
  colorFlowMode: '#60D5FF',
  rushMode: '#FFD93D',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
});
