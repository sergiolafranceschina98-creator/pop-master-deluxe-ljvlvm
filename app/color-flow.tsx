
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get('window');

interface FlowTile {
  id: string;
  row: number;
  col: number;
  color: string;
  animatedColor: Animated.Value;
}

const GRID_SIZE = 10;
const TILE_SIZE = (width - 40) / GRID_SIZE;

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
  const [tapsCount, setTapsCount] = useState(0);
  const [score, setScore] = useState(0);

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
          color: '#CCCCCC',
          animatedColor: new Animated.Value(0),
        };
        
        newTiles.push(tile);
      }
    }
    
    setTiles(newTiles);
  };

  const spreadColor = async (tile: FlowTile) => {
    console.log('User tapped tile in color flow mode:', tile.id);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const newColor = FLOW_COLORS[Math.floor(Math.random() * FLOW_COLORS.length)];
    
    const affectedTiles = tiles.filter(t => {
      const distance = Math.abs(t.row - tile.row) + Math.abs(t.col - tile.col);
      return distance <= 2;
    });
    
    const newTapsCount = tapsCount + 1;
    setTapsCount(newTapsCount);
    
    const pointsEarned = affectedTiles.length * 2;
    const newScore = score + pointsEarned;
    setScore(newScore);
    
    console.log('Color flow - tiles colored:', affectedTiles.length, 'score:', pointsEarned);
    
    affectedTiles.forEach((t, index) => {
      setTimeout(() => {
        setTiles(prev => prev.map(prevTile => 
          prevTile.id === t.id ? { ...prevTile, color: newColor } : prevTile
        ));
      }, index * 30);
    });
  };

  const resetGrid = () => {
    console.log('User reset color flow grid');
    setTapsCount(0);
    setScore(0);
    setTiles([]);
    setTimeout(generateGrid, 100);
  };

  const scoreText = score.toString();

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
        <View style={styles.statsHeader}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {scoreText}
            </Text>
            <Text style={[styles.statLabel, { color: textColor }]}>
              Score
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

        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {tiles.map((tile) => {
              return (
                <View
                  key={tile.id}
                  style={[
                    styles.tile,
                    {
                      width: TILE_SIZE,
                      height: TILE_SIZE,
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

        <View style={styles.instructions}>
          <Text style={[styles.instructionText, { color: textColor }]}>
            Tap to spread colors across the grid
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  tile: {
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tileTouchable: {
    width: '100%',
    height: '100%',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
