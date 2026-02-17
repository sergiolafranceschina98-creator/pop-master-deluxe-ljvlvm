
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import * as Haptics from "expo-haptics";
import { useStatsTracking } from "@/hooks/useStatsTracking";

const { width, height } = Dimensions.get('window');

interface Bubble {
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

export default function BubblePopScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.dark;
  
  const bgColor = isDark ? colors.backgroundDark : colors.background;
  const textColor = isDark ? colors.textDark : colors.text;
  
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [chainCount, setChainCount] = useState(0);
  const [score, setScore] = useState(0);
  const chainTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { updateStats } = useStatsTracking();

  useEffect(() => {
    generateBubbles();
  }, []);

  const generateBubbles = () => {
    const newBubbles: Bubble[] = [];
    const numBubbles = 20;
    
    for (let i = 0; i < numBubbles; i++) {
      const size = 60 + Math.random() * 40;
      const bubble: Bubble = {
        id: `bubble-${Date.now()}-${i}`,
        x: Math.random() * (width - size - 40) + 20,
        y: Math.random() * (height - size - 200) + 100,
        size: size,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
      };
      
      Animated.spring(bubble.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
      
      newBubbles.push(bubble);
    }
    
    setBubbles(newBubbles);
  };

  const popBubble = async (bubble: Bubble) => {
    console.log('User popped bubble:', bubble.id);
    
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
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
      
      if (bubbles.length <= 5) {
        setTimeout(generateBubbles, 300);
      }
    });
    
    const newPoppedCount = poppedCount + 1;
    setPoppedCount(newPoppedCount);
    
    const pointsEarned = chainCount > 1 ? 5 * chainCount : 5;
    const newScore = score + pointsEarned;
    setScore(newScore);
    
    if (chainTimeoutRef.current) {
      clearTimeout(chainTimeoutRef.current);
    }
    setChainCount(prev => prev + 1);
    
    chainTimeoutRef.current = setTimeout(() => {
      setChainCount(0);
    }, 500);
    
    await updateStats(1, pointsEarned);
    console.log('Updated stats - bubbles: 1, score:', pointsEarned);
  };

  const handleLongPress = async (bubble: Bubble) => {
    console.log('User long-pressed bubble for mega pop:', bubble.id);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    Animated.parallel([
      Animated.spring(bubble.scale, {
        toValue: 2,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(bubble.opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    });
    
    const newPoppedCount = poppedCount + 3;
    setPoppedCount(newPoppedCount);
    
    const pointsEarned = 15;
    const newScore = score + pointsEarned;
    setScore(newScore);
    
    await updateStats(3, pointsEarned);
    console.log('Updated stats - bubbles: 3, score:', pointsEarned);
  };

  const resetGame = () => {
    console.log('User reset bubble pop game');
    setPoppedCount(0);
    setChainCount(0);
    setScore(0);
    setBubbles([]);
    setTimeout(generateBubbles, 100);
  };

  const chainMultiplierText = chainCount > 1 ? `x${chainCount}` : '';
  const scoreText = score.toString();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Bubble Pop',
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
          
          {chainCount > 1 && (
            <View style={[styles.chainBadge, { backgroundColor: colors.bubbleYellow }]}>
              <Text style={styles.chainText}>
                {chainMultiplierText}
              </Text>
              <Text style={styles.chainLabel}>
                CHAIN!
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
                  onLongPress={() => handleLongPress(bubble)}
                  delayLongPress={300}
                  style={styles.bubbleTouchable}
                >
                  <View style={styles.bubbleShine} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.instructions}>
          <Text style={[styles.instructionText, { color: textColor }]}>
            Tap to pop • Long press for mega pop
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
    alignItems: 'center',
  },
  chainText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chainLabel: {
    fontSize: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleShine: {
    position: 'absolute',
    top: '20%',
    left: '30%',
    width: '30%',
    height: '30%',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
