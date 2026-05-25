import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeColors } from '../models/types';
import { Grid } from '../utils/sudokuGenerator';

interface NumberPadProps {
  onNumberPress: (num: number) => void;
  onErasePress: () => void;
  onHintPress: () => void;
  onUndoPress: () => void;
  onNoteModeToggle: () => void;
  isNoteMode: boolean;
  currentGrid: Grid;
  theme: ThemeColors;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onNumberPress,
  onErasePress,
  onHintPress,
  onUndoPress,
  onNoteModeToggle,
  isNoteMode,
  currentGrid,
  theme,
}) => {
  const getNumberCount = (num: number): number => {
    let count = 0;
    for (const row of currentGrid) {
      for (const cell of row) {
        if (cell === num) count++;
      }
    }
    return count;
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surface }]}
          onPress={onUndoPress}
        >
          <Text style={[styles.actionIcon, { color: theme.text }]}>↩</Text>
          <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>
            Отмена
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surface }]}
          onPress={onErasePress}
        >
          <Text style={[styles.actionIcon, { color: theme.text }]}>⌫</Text>
          <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>
            Стереть
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isNoteMode ? theme.primary : theme.surface,
            },
          ]}
          onPress={onNoteModeToggle}
        >
          <Text
            style={[
              styles.actionIcon,
              { color: isNoteMode ? '#FFFFFF' : theme.text },
            ]}
          >
            ✏
          </Text>
          <Text
            style={[
              styles.actionLabel,
              { color: isNoteMode ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            Заметки
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surface }]}
          onPress={onHintPress}
        >
          <Text style={[styles.actionIcon, { color: theme.accent }]}>💡</Text>
          <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>
            Подсказка
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numbersRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const count = getNumberCount(num);
          const isDisabled = count >= 9;

          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.numberButton,
                {
                  backgroundColor: isDisabled
                    ? theme.cellFixed
                    : theme.surface,
                },
              ]}
              onPress={() => !isDisabled && onNumberPress(num)}
              disabled={isDisabled}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.numberText,
                  {
                    color: isDisabled ? theme.textSecondary : theme.primary,
                  },
                ]}
              >
                {num}
              </Text>
              {count > 0 && (
                <Text
                  style={[styles.countText, { color: theme.textSecondary }]}
                >
                  {9 - count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 64,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: 11,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numberButton: {
    width: 36,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  numberText: {
    fontSize: 22,
    fontWeight: '700',
  },
  countText: {
    fontSize: 10,
    marginTop: 2,
  },
});
