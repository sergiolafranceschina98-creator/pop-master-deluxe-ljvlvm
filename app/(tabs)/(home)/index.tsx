
import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/IconSymbol";

const { width } = Dimensions.get('window');

interface GameMode {
  id: string;
  title: string;
  description: string;
  color: string;
  gradientColors: string[];
  icon: string;
  route: string;
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.dark;
  
  const bgColor = isDark ? colors.backgroundDark : colors.background;
  const textColor = isDark ? colors.textDark : colors.text;
  const textSecondaryColor = isDark ? colors.textSecondaryDark : colors.textSecondary;

  const gameModes: GameMode[] = [
    {
      id: 'bubble-pop',
      title: 'Bubble Pop',
      description: 'Classic satisfying bubble popping',
      color: colors.bubblePink,
      gradientColors: ['#FF6B9D', '#FF8FB3'],
      icon: 'bubble-chart',
      route: '/bubble-pop',
    },
    {
      id: 'chain-pop',
      title: 'Chain Pop',
      description: 'Create explosive chain reactions',
      color: colors.bubblePurple,
      gradientColors: ['#A78BFA', '#C4B5FD'],
      icon: 'link',
      route: '/chain-pop',
    },
    {
      id: 'color-flow',
      title: 'Color Flow',
      description: 'Zen-like color spreading',
      color: colors.bubbleCyan,
      gradientColors: ['#60D5FF', '#93E4FF'],
      icon: 'palette',
      route: '/color-flow',
    },
    {
      id: 'rush-mode',
      title: 'Rush Mode',
      description: 'Pop as many as you can!',
      color: colors.bubbleYellow,
      gradientColors: ['#FFD93D', '#FFE66D'],
      icon: 'flash-on',
      route: '/rush-mode',
    },
  ];

  const handleModePress = (mode: GameMode) => {
    console.log('User tapped game mode:', mode.title);
    router.push(mode.route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              PopMaster
            </Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>
              Deluxe
            </Text>
            <Text style={[styles.tagline, { color: textSecondaryColor }]}>
              Tap, Pop, Enjoy!
            </Text>
          </View>

          {/* Game Modes Grid */}
          <View style={styles.modesContainer}>
            {gameModes.map((mode, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => handleModePress(mode)}
                  style={styles.modeCardWrapper}
                >
                  <LinearGradient
                    colors={mode.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modeCard}
                  >
                    <View style={styles.modeIconContainer}>
                      <IconSymbol
                        android_material_icon_name={mode.icon as any}
                        size={40}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.modeTitle}>
                      {mode.title}
                    </Text>
                    <Text style={styles.modeDescription}>
                      {mode.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Stats */}
          <View style={[styles.statsCard, { 
            backgroundColor: isDark ? colors.cardDark : colors.card,
            borderColor: isDark ? colors.cardBorderDark : colors.cardBorder,
          }]}>
            <Text style={[styles.statsTitle, { color: textColor }]}>
              Today's Stats
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  0
                </Text>
                <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
                  Bubbles Popped
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.secondary }]}>
                  0
                </Text>
                <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
                  Chains Created
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -8,
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
  },
  modesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  modeCardWrapper: {
    width: (width - 60) / 2,
    marginBottom: 20,
  },
  modeCard: {
    borderRadius: 24,
    padding: 20,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIconContainer: {
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
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
});
