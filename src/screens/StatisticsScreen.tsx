import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { formatTime, getDifficultyLabel } from '../services/scoreService';
import { Difficulty } from '../utils/sudokuGenerator';

interface StatisticsScreenProps {
  navigation: any;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = () => {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = theme;
  const { statistics, profile } = useUserStore();

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Статистика</Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {statistics.totalGamesPlayed}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Игр сыграно
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {statistics.totalGamesWon}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Побед
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.accent }]}>
                {Math.round(statistics.winRate * 100)}%
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Процент побед
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.streakCard, { backgroundColor: colors.surface }]}>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={[styles.streakValue, { color: colors.primary }]}>
                {statistics.currentStreak}
              </Text>
              <Text
                style={[styles.streakLabel, { color: colors.textSecondary }]}
              >
                Текущая серия
              </Text>
            </View>

            <View style={styles.streakItem}>
              <Text style={[styles.streakValue, { color: colors.accent }]}>
                {statistics.longestStreak}
              </Text>
              <Text
                style={[styles.streakLabel, { color: colors.textSecondary }]}
              >
                Лучшая серия
              </Text>
            </View>

            <View style={styles.streakItem}>
              <Text style={[styles.streakValue, { color: colors.secondary }]}>
                {formatTime(statistics.totalPlayTime)}
              </Text>
              <Text
                style={[styles.streakLabel, { color: colors.textSecondary }]}
              >
                Общее время
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Лучшее время
        </Text>

        {difficulties.map((diff) => (
          <View
            key={diff}
            style={[styles.timeCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.timeDifficulty, { color: colors.text }]}>
              {getDifficultyLabel(diff)}
            </Text>
            <Text style={[styles.timeValue, { color: colors.primary }]}>
              {statistics.bestTime[diff] !== null
                ? formatTime(statistics.bestTime[diff]!)
                : '—'}
            </Text>
          </View>
        ))}

        {profile && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Рейтинг
            </Text>
            <View
              style={[styles.ratingCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.ratingValue, { color: colors.primary }]}>
                {profile.rating}
              </Text>
              <Text
                style={[styles.ratingLabel, { color: colors.textSecondary }]}
              >
                Ваш рейтинг ELO
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  streakCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  streakLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  timeDifficulty: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  ratingCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  ratingValue: {
    fontSize: 42,
    fontWeight: '800',
  },
  ratingLabel: {
    fontSize: 14,
    marginTop: 4,
  },
});
