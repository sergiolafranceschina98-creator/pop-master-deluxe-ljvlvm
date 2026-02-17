
import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface UnlockItem {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

interface AllTimeStats {
  totalBubblesPopped: number;
  totalGamesPlayed: number;
  allTimeHighScore: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  
  const bgColor = isDark ? colors.backgroundDark : colors.background;
  const textColor = isDark ? colors.textDark : colors.text;
  const textSecondaryColor = isDark ? colors.textSecondaryDark : colors.textSecondary;

  const quickActions: QuickAction[] = [
    {
      id: 'bubble-pop',
      title: 'Bubble Pop',
      description: 'Classic popping fun',
      icon: 'bubble-chart',
      color: colors.bubblePink,
      route: '/bubble-pop',
    },
    {
      id: 'chain-pop',
      title: 'Chain Pop',
      description: 'Create chain reactions',
      icon: 'grid-on',
      color: colors.bubblePurple,
      route: '/chain-pop',
    },
    {
      id: 'color-flow',
      title: 'Color Flow',
      description: 'Zen color spreading',
      icon: 'palette',
      color: colors.bubbleCyan,
      route: '/color-flow',
    },
    {
      id: 'rush-mode',
      title: 'Rush Mode',
      description: 'Beat the clock!',
      icon: 'timer',
      color: colors.rushMode,
      route: '/rush-mode',
    },
  ];

  const [unlocks, setUnlocks] = useState<UnlockItem[]>([
    {
      id: 'skin-pink',
      name: 'Pink Bubbles',
      description: 'Classic pink bubble skin',
      unlocked: true,
      icon: 'bubble-chart',
    },
    {
      id: 'skin-purple',
      name: 'Purple Bubbles',
      description: 'Mystical purple bubble skin',
      unlocked: true,
      icon: 'bubble-chart',
    },
    {
      id: 'skin-cyan',
      name: 'Cyan Bubbles',
      description: 'Cool cyan bubble skin',
      unlocked: true,
      icon: 'bubble-chart',
    },
    {
      id: 'pattern-rainbow',
      name: 'Rainbow Pattern',
      description: 'Colorful rainbow pattern',
      unlocked: false,
      icon: 'palette',
    },
    {
      id: 'pattern-gradient',
      name: 'Gradient Pattern',
      description: 'Smooth gradient pattern',
      unlocked: false,
      icon: 'gradient',
    },
  ]);

  const [allTimeStats, setAllTimeStats] = useState<AllTimeStats>({
    totalBubblesPopped: 0,
    totalGamesPlayed: 0,
    allTimeHighScore: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      console.log('=== PROFILE: Loading stats from AsyncStorage ===');
      
      const allTimeStatsJson = await AsyncStorage.getItem('allTimeStats');
      
      console.log('PROFILE: Raw allTimeStats JSON:', allTimeStatsJson);
      
      if (allTimeStatsJson) {
        const savedAllTimeStats = JSON.parse(allTimeStatsJson);
        console.log('PROFILE: Parsed all-time stats:', savedAllTimeStats);
        console.log('PROFILE: Setting all-time stats to:', savedAllTimeStats);
        setAllTimeStats(savedAllTimeStats);
      } else {
        console.log('PROFILE: No all-time stats found in storage, initializing');
        const newAllTimeStats = {
          totalBubblesPopped: 0,
          totalGamesPlayed: 0,
          allTimeHighScore: 0,
        };
        setAllTimeStats(newAllTimeStats);
        await AsyncStorage.setItem('allTimeStats', JSON.stringify(newAllTimeStats));
      }
      
      console.log('=== PROFILE: Stats loading complete ===');
    } catch (error) {
      console.error('PROFILE: Error loading stats:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('PROFILE: Screen focused, reloading stats');
      loadStats();
    }, [loadStats])
  );

  const handleQuickAction = (route: string) => {
    console.log('PROFILE: Navigating to:', route);
    router.push(route as any);
  };

  const unlockedCount = unlocks.filter(u => u.unlocked).length;
  const totalCount = unlocks.length;
  const unlockedCountText = unlockedCount.toString();
  const totalCountText = totalCount.toString();
  
  const allTimeBubblesText = allTimeStats.totalBubblesPopped.toString();
  const allTimeGamesText = allTimeStats.totalGamesPlayed.toString();
  const allTimeHighScoreText = allTimeStats.allTimeHighScore.toString();

  console.log('PROFILE: Rendering - All-time:', allTimeStats);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              Progress
            </Text>
            <Text style={[styles.subtitle, { color: textSecondaryColor }]}>
              Your stats and achievements
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Quick Actions
            </Text>
            
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickActionCard,
                      {
                        backgroundColor: isDark ? colors.cardDark : colors.card,
                        borderColor: isDark ? colors.cardBorderDark : colors.cardBorder,
                      },
                    ]}
                    onPress={() => handleQuickAction(action.route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                      <IconSymbol
                        ios_icon_name={action.icon as any}
                        android_material_icon_name={action.icon as any}
                        size={28}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={[styles.quickActionTitle, { color: textColor }]}>
                      {action.title}
                    </Text>
                    <Text style={[styles.quickActionDescription, { color: textSecondaryColor }]}>
                      {action.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              All-Time Stats
            </Text>
            
            <View style={[styles.statsCard, { 
              backgroundColor: isDark ? colors.cardDark : colors.card,
              borderColor: isDark ? colors.cardBorderDark : colors.cardBorder,
            }]}>
              <View style={styles.statsGrid}>
                <View style={styles.statGridItem}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {allTimeBubblesText}
                  </Text>
                  <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
                    Total Bubbles
                  </Text>
                </View>
                
                <View style={styles.statGridItem}>
                  <Text style={[styles.statValue, { color: colors.secondary }]}>
                    {allTimeGamesText}
                  </Text>
                  <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
                    Total Games
                  </Text>
                </View>
                
                <View style={styles.statGridItem}>
                  <Text style={[styles.statValue, { color: colors.rushMode }]}>
                    {allTimeHighScoreText}
                  </Text>
                  <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
                    Best Score
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Skins & Patterns
            </Text>
            
            <View style={[styles.statsCard, { 
              backgroundColor: isDark ? colors.cardDark : colors.card,
              borderColor: isDark ? colors.cardBorderDark : colors.cardBorder,
              marginBottom: 16,
            }]}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {unlockedCountText}
                  </Text>
                  <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
                    Unlocked
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.secondary }]}>
                    {totalCountText}
                  </Text>
                  <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
                    Total Items
                  </Text>
                </View>
              </View>
            </View>
            
            {unlocks.map((unlock, index) => {
              const isUnlocked = unlock.unlocked;
              return (
                <View
                  key={index}
                  style={[
                    styles.unlockCard,
                    {
                      backgroundColor: isDark ? colors.cardDark : colors.card,
                      borderColor: isDark ? colors.cardBorderDark : colors.cardBorder,
                      opacity: isUnlocked ? 1 : 0.5,
                    },
                  ]}
                >
                  <View style={[
                    styles.unlockIcon,
                    { backgroundColor: isUnlocked ? colors.primary : colors.textSecondary }
                  ]}>
                    <IconSymbol
                      ios_icon_name={unlock.icon as any}
                      android_material_icon_name={unlock.icon as any}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.unlockInfo}>
                    <Text style={[styles.unlockName, { color: textColor }]}>
                      {unlock.name}
                    </Text>
                    <Text style={[styles.unlockDescription, { color: textSecondaryColor }]}>
                      {unlock.description}
                    </Text>
                  </View>
                  {isUnlocked && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={24}
                      color={colors.bubbleGreen}
                    />
                  )}
                  {!isUnlocked && (
                    <IconSymbol
                      ios_icon_name="lock.fill"
                      android_material_icon_name="lock"
                      size={24}
                      color={textSecondaryColor}
                    />
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.infoText, { color: textSecondaryColor }]}>
              Keep playing to unlock more skins and patterns!
            </Text>
            <Text style={[styles.infoText, { color: textSecondaryColor }]}>
              All progress is saved locally on your device.
            </Text>
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
    marginTop: Platform.OS === 'android' ? 48 : 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  statsCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statGridItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.cardBorder,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  unlockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  unlockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unlockInfo: {
    flex: 1,
  },
  unlockName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unlockDescription: {
    fontSize: 14,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});
