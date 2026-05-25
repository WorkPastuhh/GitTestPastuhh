import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { Difficulty } from '../utils/sudokuGenerator';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const profile = useUserStore((state) => state.profile);
  const { colors } = theme;

  const startGame = (difficulty: Difficulty) => {
    navigation.navigate('Game', { difficulty });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Судоку</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Тренируй логику каждый день
        </Text>
      </View>

      {profile && (
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {profile.username}
          </Text>
          <Text style={[styles.profileStats, { color: colors.textSecondary }]}>
            Рейтинг: {profile.rating} • Побед: {profile.gamesWon}
          </Text>
        </View>
      )}

      <View style={styles.difficultySection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Новая игра
        </Text>

        <TouchableOpacity
          style={[styles.difficultyButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => startGame('easy')}
        >
          <Text style={styles.difficultyText}>Лёгкий</Text>
          <Text style={styles.difficultyDesc}>30 пустых клеток</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyButton, { backgroundColor: '#2196F3' }]}
          onPress={() => startGame('medium')}
        >
          <Text style={styles.difficultyText}>Средний</Text>
          <Text style={styles.difficultyDesc}>40 пустых клеток</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyButton, { backgroundColor: '#FF9800' }]}
          onPress={() => startGame('hard')}
        >
          <Text style={styles.difficultyText}>Сложный</Text>
          <Text style={styles.difficultyDesc}>50 пустых клеток</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyButton, { backgroundColor: '#F44336' }]}
          onPress={() => startGame('expert')}
        >
          <Text style={styles.difficultyText}>Эксперт</Text>
          <Text style={styles.difficultyDesc}>58 пустых клеток</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Tournaments')}
        >
          <Text style={[styles.menuIcon]}>🏆</Text>
          <Text style={[styles.menuText, { color: colors.text }]}>Турниры</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Themes')}
        >
          <Text style={[styles.menuIcon]}>🎨</Text>
          <Text style={[styles.menuText, { color: colors.text }]}>Темы</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={[styles.menuIcon]}>📊</Text>
          <Text style={[styles.menuText, { color: colors.text }]}>
            Статистика
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  profileCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileStats: {
    fontSize: 13,
    marginTop: 4,
  },
  difficultySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  difficultyButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  difficultyDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  menuSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
