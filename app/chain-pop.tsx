
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get('window');
const GRID_SIZE = 6;
const TILE_SIZE = (width - 60) / GRID_SIZE;

interface Tile {
  id: string;
  row: number;
  col: number;
  color: string;
  scale: Animated.Value;
  opacity: Animated.Value;
  isPopped: boolean;
}

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
  const [chainLength, setChainLength] = useState(0);

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
          delay: (row * GRID_SIZE + col) * 20,
          useNativeDriver: true,
        }).start();
        
        newTiles.push(tile);
      }
    }
    
    setTiles(newTiles);
  };

  const findConnectedTiles = (startTile: Tile, targetColor: string, visited: Set<string> = new Set()): Tile[] => {
    if (visited.has(startTile.id) || startTile.isPopped || startTile.color !== targetColor) {
      return [];
    }
    
    visited.add(startTile.id);
    const connected = [startTile];
    
    const neighbors = [
      tiles.find(t => t.row === startTile.row - 1 && t.col === startTile.col),
      tiles.find(t => t.row === startTile.row + 1 && t.col === startTile.col),
      tiles.find(t => t.row === startTile.row && t.col === startTile.col - 1),
      tiles.find(t => t.row === startTile.row && t.col === startTile.col + 1),
    ];
    
    neighbors.forEach(neighbor => {
      if (neighbor) {
        connected.push(...findConnectedTiles(neighbor, targetColor, visited));
      }
    });
    
    return connected;
  };

  const popTile = (tile: Tile) => {
    if (tile.isPopped) return;
    
    console.log('User tapped tile:', tile.id);
    
    const connectedTiles = findConnectedTiles(tile, tile.color);
    const chainLengthValue = connectedTiles.length;
    
    if (chainLengthValue === 1) {
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        chainLengthValue > 5 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    
    setChainLength(chainLengthValue);
    setScore(prev => prev + chainLengthValue * 10);
    
    connectedTiles.forEach((t, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(t.scale, {
            toValue: 1.3,
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
    setTiles(prev => {
      const newTiles = prev.map(tile => {
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
      });
      
      return newTiles;
    });
  };

  const resetGame = () => {
    console.log('User reset chain pop game');
    setScore(0);
    setChainLength(0);
    setTiles([]);
    setTimeout(generateGrid, 100);
  };

  const scoreText = score.toString();
  const chainText = chainLength > 1 ? `${chainLength} Chain!` : '';

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
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>
              {scoreText}
            </Text>
            <Text style={[styles.statLabel, { color: textColor }]}>
              Score
            </Text>
          </View>
          
          {chainLength > 1 && (
            <View style={[styles.chainBadge, { backgroundColor: colors.bubbleYellow }]}>
              <Text style={styles.chainText}>
                {chainText}
              </Text>
            </View>
          )}
          
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

        {/* Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {tiles.map((tile) => {
              return (
                <Animated.View
                  key={tile.id}
                  style={[
                    styles.tile,
                    {
                      width: TILE_SIZE - 8,
                      height: TILE_SIZE - 8,
                      backgroundColor: tile.color,
                      transform: [{ scale: tile.scale }],
                      opacity: tile.opacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => popTile(tile)}
                    style={styles.tileTouchable}
                  />
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={[styles.instructionText, { color: textColor }]}>
            Tap tiles to create chain reactions
          </Text>
          <Text style={[styles.instructionSubtext, { color: textColor }]}>
            Match 2+ adjacent tiles of the same color
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
  chainBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chainText: {
    fontSize: 18,
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
    padding: 4,
  },
  tile: {
    margin: 4,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  tileTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
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
