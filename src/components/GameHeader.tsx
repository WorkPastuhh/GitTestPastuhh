import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeColors } from '../models/types';
import { Difficulty } from '../utils/sudokuGenerator';
import { formatTime, getDifficultyLabel } from '../services/scoreService';

interface GameHeaderProps {
  difficulty: Difficulty;
  elapsedTime: number;
  errorsCount: number;
  maxErrors: number;
  isPaused: boolean;
  onPause: () => void;
  onBack: () => void;
  theme: ThemeColors;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  difficulty,
  elapsedTime,
  errorsCount,
  maxErrors,
  isPaused,
  onPause,
  onBack,
  theme,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={[styles.difficulty, { color: theme.primary }]}>
          {getDifficultyLabel(difficulty)}
        </Text>

        <View style={styles.statsRow}>
          <Text style={[styles.timer, { color: theme.text }]}>
            {formatTime(elapsedTime)}
          </Text>

          <Text style={[styles.errors, { color: theme.error }]}>
            Ошибки: {errorsCount}/{maxErrors}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
        <Text style={[styles.pauseIcon, { color: theme.text }]}>
          {isPaused ? '▶' : '⏸'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  difficulty: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timer: {
    fontSize: 16,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  errors: {
    fontSize: 13,
  },
  pauseButton: {
    padding: 8,
  },
  pauseIcon: {
    fontSize: 20,
  },
});
