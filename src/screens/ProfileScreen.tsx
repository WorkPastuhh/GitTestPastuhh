import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = theme;
  const { profile, isAuthenticated, login, logout } = useUserStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return;
    }

    login(username.trim(), email.trim());
    setUsername('');
    setEmail('');
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', onPress: logout, style: 'destructive' },
    ]);
  };

  if (!isAuthenticated || !profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.authContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Войти в аккаунт
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Создайте профиль для участия в турнирах и сохранения прогресса
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.gridLine,
              },
            ]}
            placeholder="Имя пользователя"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.gridLine,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Создать профиль</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.profileContainer}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {profile.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={[styles.profileName, { color: colors.text }]}>
          {profile.username}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
          {profile.email}
        </Text>

        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {profile.rating}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Рейтинг
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {profile.gamesWon}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Побед
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {profile.gamesPlayed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Игр
            </Text>
          </View>
        </View>

        <View style={[styles.subscriptionCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
            Подписка
          </Text>
          <Text
            style={[styles.subscriptionType, { color: colors.primary }]}
          >
            {profile.subscriptionType === 'free'
              ? 'Бесплатная'
              : profile.subscriptionType === 'premium'
                ? 'Premium'
                : 'Pro'}
          </Text>
          {profile.subscriptionType === 'free' && (
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: colors.accent },
              ]}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.upgradeButtonText}>Улучшить</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Выйти из аккаунта
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 15,
  },
  loginButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  subscriptionCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  subscriptionType: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  upgradeButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
