
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyStats {
  date: string;
  bubblesPopped: number;
  gamesPlayed: number;
  highScore: number;
  totalScore: number;
}

interface AllTimeStats {
  totalBubblesPopped: number;
  totalGamesPlayed: number;
  allTimeHighScore: number;
}

export function useStatsTracking() {
  const updateStats = useCallback(async (bubblesPopped: number, score: number) => {
    try {
      console.log('Updating stats - bubbles:', bubblesPopped, 'score:', score);
      
      const todayStatsJson = await AsyncStorage.getItem('todayStats');
      const allTimeStatsJson = await AsyncStorage.getItem('allTimeStats');
      
      const today = new Date().toDateString();
      
      let todayStats: DailyStats;
      if (todayStatsJson) {
        const savedTodayStats = JSON.parse(todayStatsJson);
        if (savedTodayStats.date === today) {
          todayStats = savedTodayStats;
        } else {
          todayStats = {
            date: today,
            bubblesPopped: 0,
            gamesPlayed: 0,
            highScore: 0,
            totalScore: 0,
          };
        }
      } else {
        todayStats = {
          date: today,
          bubblesPopped: 0,
          gamesPlayed: 0,
          highScore: 0,
          totalScore: 0,
        };
      }
      
      todayStats.bubblesPopped += bubblesPopped;
      todayStats.gamesPlayed += 1;
      todayStats.totalScore += score;
      if (score > todayStats.highScore) {
        todayStats.highScore = score;
      }
      
      await AsyncStorage.setItem('todayStats', JSON.stringify(todayStats));
      console.log('Updated today stats:', todayStats);
      
      let allTimeStats: AllTimeStats;
      if (allTimeStatsJson) {
        allTimeStats = JSON.parse(allTimeStatsJson);
      } else {
        allTimeStats = {
          totalBubblesPopped: 0,
          totalGamesPlayed: 0,
          allTimeHighScore: 0,
        };
      }
      
      allTimeStats.totalBubblesPopped += bubblesPopped;
      allTimeStats.totalGamesPlayed += 1;
      if (score > allTimeStats.allTimeHighScore) {
        allTimeStats.allTimeHighScore = score;
      }
      
      await AsyncStorage.setItem('allTimeStats', JSON.stringify(allTimeStats));
      console.log('Updated all-time stats:', allTimeStats);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, []);

  return { updateStats };
}
