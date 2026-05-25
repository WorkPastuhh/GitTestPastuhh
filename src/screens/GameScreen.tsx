import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { SudokuGrid } from '../components/SudokuGrid';
import { NumberPad } from '../components/NumberPad';
import { GameHeader } from '../components/GameHeader';
import { useGameStore } from '../store/gameStore';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { Difficulty } from '../utils/sudokuGenerator';
import { calculateScore } from '../services/scoreService';

interface GameScreenProps {
  navigation: any;
  route: { params: { difficulty: Difficulty } };
}

export const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { difficulty } = route.params;
  const [isNoteMode, setIsNoteMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const theme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = theme;

  const {
    game,
    startNewGame,
    selectCell,
    placeNumber,
    toggleNote,
    eraseCell,
    useHint,
    undo,
    pauseGame,
    resumeGame,
    updateTimer,
  } = useGameStore();

  const { recordGameResult, statistics } = useUserStore();

  useEffect(() => {
    startNewGame(difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (game && !game.isPaused && !game.isCompleted) {
      timerRef.current = setInterval(() => {
        updateTimer();
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [game?.isPaused, game?.isCompleted]);

  useEffect(() => {
    if (game?.isCompleted) {
      const score = calculateScore({
        difficulty: game.difficulty,
        elapsedTimeSeconds: game.elapsedTime,
        hintsUsed: game.hintsUsed,
        errorsCount: game.errorsCount,
        streakLength: statistics.currentStreak,
      });

      recordGameResult(game.difficulty, game.elapsedTime, true);

      Alert.alert(
        'Поздравляем! 🎉',
        `Вы решили головоломку!\n\nВремя: ${formatTimeDisplay(game.elapsedTime)}\nОчки: ${score}\nОшибки: ${game.errorsCount}\nПодсказки: ${game.hintsUsed}`,
        [
          { text: 'На главную', onPress: () => navigation.goBack() },
          { text: 'Новая игра', onPress: () => startNewGame(difficulty) },
        ]
      );
    }
  }, [game?.isCompleted]);

  useEffect(() => {
    if (game && game.errorsCount >= game.maxErrors) {
      recordGameResult(game.difficulty, game.elapsedTime, false);

      Alert.alert(
        'Игра окончена',
        'Вы допустили слишком много ошибок.',
        [
          { text: 'На главную', onPress: () => navigation.goBack() },
          { text: 'Начать заново', onPress: () => startNewGame(difficulty) },
        ]
      );
    }
  }, [game?.errorsCount]);

  const handleNumberPress = (num: number) => {
    if (isNoteMode) {
      toggleNote(num);
    } else {
      placeNumber(num);
    }
  };

  const handlePause = () => {
    if (game?.isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  if (!game) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Генерация головоломки...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <GameHeader
        difficulty={game.difficulty}
        elapsedTime={game.elapsedTime}
        errorsCount={game.errorsCount}
        maxErrors={game.maxErrors}
        isPaused={game.isPaused}
        onPause={handlePause}
        onBack={() => navigation.goBack()}
        theme={colors}
      />

      {game.isPaused ? (
        <View style={styles.pauseOverlay}>
          <Text style={[styles.pauseText, { color: colors.text }]}>
            Пауза
          </Text>
          <Text style={[styles.pauseHint, { color: colors.textSecondary }]}>
            Нажмите ▶ чтобы продолжить
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.gridContainer}>
            <SudokuGrid
              puzzle={game.puzzle}
              currentGrid={game.currentGrid}
              solution={game.solution}
              notes={game.notes}
              selectedCell={game.selectedCell}
              onCellPress={selectCell}
              theme={colors}
            />
          </View>

          <NumberPad
            onNumberPress={handleNumberPress}
            onErasePress={eraseCell}
            onHintPress={useHint}
            onUndoPress={undo}
            onNoteModeToggle={() => setIsNoteMode(!isNoteMode)}
            isNoteMode={isNoteMode}
            currentGrid={game.currentGrid}
            theme={colors}
          />
        </>
      )}
    </SafeAreaView>
  );
};

function formatTimeDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  pauseOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    fontSize: 32,
    fontWeight: '700',
  },
  pauseHint: {
    fontSize: 14,
    marginTop: 8,
  },
});
