
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

interface UnlockItem {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  
  const bgColor = isDark ? colors.backgroundDark : colors.background;
  const textColor = isDark ? colors.textDark : colors.text;
  const textSecondaryColor = isDark ? colors.textSecondaryDark : colors.textSecondary;

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

  const unlockedCount = unlocks.filter(u => u.unlocked).length;
  const totalCount = unlocks.length;
  const unlockedCountText = unlockedCount.toString();
  const totalCountText = totalCount.toString();

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
              Progress
            </Text>
            <Text style={[styles.subtitle, { color: textSecondaryColor }]}>
              Your unlocks and achievements
            </Text>
          </View>

          {/* Stats Card */}
          <View style={[styles.statsCard, { 
            backgroundColor: isDark ? colors.cardDark : colors.card,
            borderColor: isDark ? colors.cardBorderDark : colors.cardBorder,
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

          {/* Unlocks Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Skins & Patterns
            </Text>
            
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
                      ios_icon_name="circle.fill"
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

          {/* Info */}
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
    marginTop: 20,
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
  statsCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
    fontSize: 40,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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
