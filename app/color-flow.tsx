
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get('window');
const GRID_SIZE = 8;
const TILE_SIZE = (width - 60) / GRID_SIZE;

interface FlowTile {
  id: string;
  row: number;
  col: number;
  color: string;
  animatedColor: Animated.Value;
}

const FLOW_COLORS = [
  colors.bubblePink,
  colors.bubblePurple,
  colors.bubbleCyan,
  colors.bubbleYellow,
  colors.bubbleGreen,
  colors.bubbleOrange,
];

export default function ColorFlowScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  
  const bgColor = isDark ? colors.backgroundDark : colors.background;
  const textColor = isDark ? colors.textDark : colors.text;
  
  const [tiles, setTiles] = useState<FlowTile[]>([]);
  const [currentColor, setCurrentColor] = useState(FLOW_COLORS[0]);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    const newTiles: FlowTile[] = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const tile: FlowTile = {
          id: `tile-${row}-${col}`,
          row,
          col,
          color: '#F0F0F0',
          animatedColor: new Animated.Value(0),
        };
        
        newTiles.push(tile);
      }
    }
    
    setTiles(newTiles);
  };

  const spreadColor = (tile: FlowTile) => {
    console.log('User tapped tile for color flow:', tile.id);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setTapCount(prev => prev + 1);
    
    const distance = (t: FlowTile) => {
      return Math.sqrt(Math.pow(t.row - tile.row, 2) + Math.pow(t.col - tile.col, 2));
    };
    
    tiles.forEach(t => {
      const dist = distance(t);
      const delay = dist * 50;
      
      setTimeout(() => {
        setTiles(prev => prev.map(prevTile => 
          prevTile.id === t.id ? { ...prevTile, color: currentColor } : prevTile
        ));
      }, delay);
    });
    
    setTimeout(() => {
      const nextColorIndex = (FLOW_COLORS.indexOf(currentColor) + 1) % FLOW_COLORS.length;
      setCurrentColor(FLOW_COLORS[nextColorIndex]);
    }, 500);
  };

  const resetGrid = () => {
    console.log('User reset color flow');
    setTapCount(0);
    setCurrentColor(FLOW_COLORS[0]);
    setTiles([]);
    setTimeout(generateGrid, 100);
  };

  const tapCountText = tapCount.toString();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Color Flow',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: bgColor,
          },
          headerTintColor: textColor,
        }}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {tapCountText}
            </Text>
            <Text style={[styles.statLabel, { color: textColor }]}>
              Taps
            </Text>
          </View>
          
          <View style={[styles.colorPreview, { backgroundColor: currentColor }]}>
            <Text style={styles.colorLabel}>
              Next
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.resetButton, { backgroundColor: colors.secondary }]}
            onPress={resetGrid}
          >
            <IconSymbol
              android_material_icon_name="refresh"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {tiles.map((tile) => {
              return (
                <View
                  key={tile.id}
                  style={[
                    styles.tile,
                    {
                      width: TILE_SIZE - 4,
                      height: TILE_SIZE - 4,
                      backgroundColor: tile.color,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => spreadColor(tile)}
                    style={styles.tileTouchable}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={[styles.instructionText, { color: textColor }]}>
            Tap anywhere to spread colors
          </Text>
          <Text style={[styles.instructionSubtext, { color: textColor }]}>
            Watch the colors flow and blend
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  colorPreview: {
    width: 80,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width - 40,
    padding: 2,
  },
  tile: {
    margin: 2,
    borderRadius: 4,
  },
  tileTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 12,
    opacity: 0.5,
  },
});
