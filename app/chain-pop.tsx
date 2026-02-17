
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";
import { useStatsTracking } from "@/hooks/useStatsTracking";

const { width } = Dimensions.get('window');

interface Tile {
  id: string;
  row: number;
  col: number;
  color: string;
  scale: Animated.Value;
  opacity: Animated.Value;
  isPopped: boolean;
}

const GRID_SIZE = 8;
const TILE_SIZE = (width - 40) / GRID_SIZE;

const TILE_COLORS = [
  colors.bubblePink,
  colors.bubblePurple,
  colors.bubbleCyan,
  colors.bubbleYellow,
  colors.bubbleGreen,
];

export default function ChainPopScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  
  const bgColor = isDark ? colors.backgroundDark : colors.background;
  const textColor = isDark ? colors.textDark : colors.text;
  
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bubblesPopped, setBubblesPopped] = useState(0);
  
  const { updateStats } = useStatsTracking();

  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    const newTiles: Tile[] = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const tile: Tile = {
          id: `tile-${row}-${col}`,
          row,
          col,
          color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)],
          scale: new Animated.Value(0),
          opacity: new Animated.Value(1),
          isPopped: false,
        };
        
        Animated.spring(tile.scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: (row * GRID_SIZE + col) * 10,
          useNativeDriver: true,
        }).start();
        
        newTiles.push(tile);
      }
    }
    
    setTiles(newTiles);
  };

  const findConnectedTiles = (startTile: Tile, targetColor: string, visited: Set<string>): Tile[] => {
    if (visited.has(startTile.id) || startTile.isPopped || startTile.color !== targetColor) {
      return [];
    }
    
    visited.add(startTile.id);
    let connected = [startTile];
    
    const neighbors = [
      tiles.find(t => t.row === startTile.row - 1 && t.col === startTile.col),
      tiles.find(t => t.row === startTile.row + 1 && t.col === startTile.col),
      tiles.find(t => t.row === startTile.row && t.col === startTile.col - 1),
      tiles.find(t => t.row === startTile.row && t.col === startTile.col + 1),
    ];
    
    for (const neighbor of neighbors) {
      if (neighbor) {
        connected = connected.concat(findConnectedTiles(neighbor, targetColor, visited));
      }
    }
    
    return connected;
  };

  const popTile = async (tile: Tile) => {
    if (tile.isPopped) return;
    
    console.log('User tapped tile in chain pop mode:', tile.id);
    
    const connectedTiles = findConnectedTiles(tile, tile.color, new Set());
    
    if (connectedTiles.length < 2) {
      console.log('No chain found, single tile pop');
      return;
    }
    
    console.log('Chain found with', connectedTiles.length, 'tiles');
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const pointsEarned = connectedTiles.length * 10;
    const newScore = score + pointsEarned;
    setScore(newScore);
    
    const newBubblesPopped = bubblesPopped + connectedTiles.length;
    setBubblesPopped(newBubblesPopped);
    
    await updateStats(connectedTiles.length, pointsEarned);
    console.log('Updated stats - bubbles:', connectedTiles.length, 'score:', pointsEarned);
    
    connectedTiles.forEach((t, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(t.scale, {
            toValue: 1.5,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(t.opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        
        setTiles(prev => prev.map(tile => 
          tile.id === t.id ? { ...tile, isPopped: true } : tile
        ));
      }, index * 50);
    });
    
    setTimeout(() => {
      refillGrid();
    }, connectedTiles.length * 50 + 300);
  };

  const refillGrid = () => {
    console.log('Refilling grid with new tiles');
    
    setTiles(prev => prev.map(tile => {
      if (tile.isPopped) {
        const newTile = {
          ...tile,
          color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)],
          scale: new Animated.Value(0),
          opacity: new Animated.Value(1),
          isPopped: false,
        };
        
        Animated.spring(newTile.scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
        
        return newTile;
      }
      return tile;
    }));
  };

  const resetGame = () => {
    console.log('User reset chain pop game');
    setScore(0);
    setBubblesPopped(0);
    setTiles([]);
    setTimeout(generateGrid, 100);
  };

  const scoreText = score.toString();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Chain Pop',
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
            onPress={resetGame}
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
                <Animated.View
                  key={tile.id}
                  style={[
                    styles.tile,
                    {
                      width: TILE_SIZE,
                      height: TILE_SIZE,
                      backgroundColor: tile.color,
                      transform: [{ scale: tile.scale }],
                      opacity: tile.opacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => popTile(tile)}
                    style={styles.tileTouchable}
                  />
                </Animated.View>
              );
            })}
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={[styles.instructionText, { color: textColor }]}>
            Tap tiles to create chain reactions
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
