
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get('window');

interface RushBubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  scale: Animated.Value;
  opacity: Animated.Value;
}

const BUBBLE_COLORS = [
  colors.bubblePink,
  colors.bubblePurple,
  colors.bubbleCyan,
  colors.bubbleYellow,
  colors.bubbleGreen,
  colors.bubbleOrange,
];

const GAME_DURATION = 30;

export default function RushModeScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  
  const bgColor = isDark ? colors.backgroundDark : colors.background;
  const textColor = isDark ? colors.textDark : colors.text;
  
  const [bubbles, setBubbles] = useState<RushBubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, []);

  const startGame = () => {
    console.log('User started rush mode');
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBubbles([]);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    spawnRef.current = setInterval(() => {
      spawnBubble();
    }, 500);
  };

  const endGame = () => {
    console.log('Rush mode game ended, final score:', score);
    setIsPlaying(false);
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
  };

  const spawnBubble = () => {
    const size = 50 + Math.random() * 30;
    const bubble: RushBubble = {
      id: `bubble-${Date.now()}-${Math.random()}`,
      x: Math.random() * (width - size - 40) + 20,
      y: Math.random() * (height - size - 300) + 150,
      size: size,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
    };
    
    Animated.spring(bubble.scale, {
      toValue: 1,
      tension: 80,
      friction: 5,
      useNativeDriver: true,
    }).start();
    
    setBubbles(prev => [...prev, bubble]);
    
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    }, 2000);
  };

  const popBubble = (bubble: RushBubble) => {
    console.log('User popped bubble in rush mode:', bubble.id);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.parallel([
      Animated.spring(bubble.scale, {
        toValue: 1.5,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(bubble.opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    setScore(prev => prev + 10);
  };

  const timeLeftText = timeLeft.toString();
  const scoreText = score.toString();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Rush Mode',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: bgColor,
          },
          headerTintColor: textColor,
        }}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {!isPlaying && !gameOver && (
          <View style={styles.startContainer}>
            <Text style={[styles.startTitle, { color: textColor }]}>
              Rush Mode
            </Text>
            <Text style={[styles.startSubtitle, { color: textColor }]}>
              Pop as many bubbles as you can in 30 seconds!
            </Text>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.rushMode }]}
              onPress={startGame}
            >
              <Text style={styles.startButtonText}>
                Start Game
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isPlaying && (
          <>
            {/* Stats Header */}
            <View style={styles.statsHeader}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.rushMode }]}>
                  {timeLeftText}
                </Text>
                <Text style={[styles.statLabel, { color: textColor }]}>
                  Seconds
                </Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {scoreText}
                </Text>
                <Text style={[styles.statLabel, { color: textColor }]}>
                  Score
                </Text>
              </View>
            </View>

            {/* Bubble Container */}
            <View style={styles.bubbleContainer}>
              {bubbles.map((bubble) => {
                return (
                  <Animated.View
                    key={bubble.id}
                    style={[
                      styles.bubble,
                      {
                        left: bubble.x,
                        top: bubble.y,
                        width: bubble.size,
                        height: bubble.size,
                        backgroundColor: bubble.color,
                        transform: [{ scale: bubble.scale }],
                        opacity: bubble.opacity,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => popBubble(bubble)}
                      style={styles.bubbleTouchable}
                    />
                  </Animated.View>
                );
              })}
            </View>
          </>
        )}

        {gameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={[styles.gameOverTitle, { color: textColor }]}>
              Time's Up!
            </Text>
            <Text style={[styles.finalScore, { color: colors.primary }]}>
              {scoreText}
            </Text>
            <Text style={[styles.finalScoreLabel, { color: textColor }]}>
              Final Score
            </Text>
            <TouchableOpacity
              style={[styles.playAgainButton, { backgroundColor: colors.rushMode }]}
              onPress={startGame}
            >
              <Text style={styles.playAgainText}>
                Play Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  startTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  startSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
  },
  startButton: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 30,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  bubbleContainer: {
    flex: 1,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 1000,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  bubbleTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  gameOverTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  finalScore: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  finalScoreLabel: {
    fontSize: 20,
    marginTop: 8,
    marginBottom: 40,
    opacity: 0.7,
  },
  playAgainButton: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 30,
  },
  playAgainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
