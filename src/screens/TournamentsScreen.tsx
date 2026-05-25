import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useTournamentStore } from '../store/tournamentStore';
import { useUserStore } from '../store/userStore';
import { Tournament, TournamentStatus } from '../models/types';
import { getDifficultyLabel, formatTime } from '../services/scoreService';

interface TournamentsScreenProps {
  navigation: any;
}

export const TournamentsScreen: React.FC<TournamentsScreenProps> = ({
  navigation,
}) => {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = theme;
  const profile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState<TournamentStatus>('upcoming');

  const {
    getUpcomingTournaments,
    getActiveTournaments,
    getCompletedTournaments,
    joinTournament,
    leaveTournament,
  } = useTournamentStore();

  const getTournaments = (): Tournament[] => {
    switch (activeTab) {
      case 'upcoming':
        return getUpcomingTournaments();
      case 'active':
        return getActiveTournaments();
      case 'completed':
        return getCompletedTournaments();
      default:
        return [];
    }
  };

  const handleJoin = (tournament: Tournament) => {
    if (!profile) {
      Alert.alert('Ошибка', 'Необходимо войти в аккаунт для участия в турнирах.');
      return;
    }

    const success = joinTournament(tournament.id, profile.id, profile.username);
    if (success) {
      Alert.alert('Успешно', `Вы зарегистрированы на турнир "${tournament.name}"`);
    } else {
      Alert.alert('Ошибка', 'Не удалось присоединиться к турниру.');
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTournament = ({ item }: { item: Tournament }) => {
    const isJoined = profile
      ? item.participants.some((p) => p.userId === profile.id)
      : false;

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {item.name}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {getDifficultyLabel(item.difficulty)}
            </Text>
          </View>
        </View>

        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>

        <View style={styles.cardDetails}>
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Начало: {formatDate(item.startTime)}
          </Text>
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Участники: {item.participants.length}/{item.maxParticipants}
          </Text>
          <Text style={[styles.detailText, { color: colors.accent }]}>
            Призовой фонд: {item.prizePool} ₽
          </Text>
        </View>

        {activeTab === 'upcoming' && (
          <TouchableOpacity
            style={[
              styles.joinButton,
              {
                backgroundColor: isJoined ? colors.error : colors.primary,
              },
            ]}
            onPress={() =>
              isJoined
                ? leaveTournament(item.id, profile!.id)
                : handleJoin(item)
            }
          >
            <Text style={styles.joinButtonText}>
              {isJoined ? 'Отменить участие' : 'Участвовать'}
            </Text>
          </TouchableOpacity>
        )}

        {activeTab === 'active' && isJoined && (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: colors.success }]}
            onPress={() =>
              navigation.navigate('Game', {
                difficulty: item.difficulty,
                tournamentId: item.id,
              })
            }
          >
            <Text style={styles.joinButtonText}>Играть</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const tabs: { key: TournamentStatus; label: string }[] = [
    { key: 'upcoming', label: 'Предстоящие' },
    { key: 'active', label: 'Активные' },
    { key: 'completed', label: 'Завершённые' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Турниры</Text>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab.key
                      ? colors.primary
                      : colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getTournaments()}
        renderItem={renderTournament}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Нет турниров в этой категории
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 13,
    marginBottom: 12,
  },
  cardDetails: {
    gap: 4,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
  },
  joinButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});
