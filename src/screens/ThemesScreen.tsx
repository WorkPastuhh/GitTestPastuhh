import React from 'react';
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
import { useUserStore } from '../store/userStore';
import { AppTheme } from '../models/types';

interface ThemesScreenProps {
  navigation: any;
}

export const ThemesScreen: React.FC<ThemesScreenProps> = ({ navigation }) => {
  const currentTheme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = currentTheme;
  const {
    availableThemes,
    currentThemeId,
    setTheme,
    unlockTheme,
    isThemeUnlocked,
  } = useThemeStore();
  const profile = useUserStore((state) => state.profile);

  const handleThemeSelect = (theme: AppTheme) => {
    if (isThemeUnlocked(theme.id)) {
      setTheme(theme.id);
      return;
    }

    if (theme.isPremium) {
      const hasPremium =
        profile?.subscriptionType === 'premium' ||
        profile?.subscriptionType === 'pro';

      if (hasPremium) {
        unlockTheme(theme.id);
        setTheme(theme.id);
      } else {
        Alert.alert(
          'Премиум тема',
          `Тема "${theme.name}" доступна по подписке Premium.\n\nОформите подписку, чтобы получить доступ ко всем темам оформления.`,
          [
            { text: 'Отмена', style: 'cancel' },
            {
              text: 'Подписка',
              onPress: () => navigation.navigate('Subscription'),
            },
          ]
        );
      }
    }
  };

  const renderTheme = ({ item }: { item: AppTheme }) => {
    const unlocked = isThemeUnlocked(item.id);
    const isActive = currentThemeId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.themeCard,
          { backgroundColor: colors.surface },
          isActive && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        onPress={() => handleThemeSelect(item)}
      >
        <View
          style={[styles.themePreview, { backgroundColor: item.preview }]}
        >
          <View style={styles.previewGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.previewCell,
                  { backgroundColor: item.colors.cellBackground },
                ]}
              >
                <Text
                  style={[
                    styles.previewNumber,
                    { color: item.colors.numberFixed },
                  ]}
                >
                  {i + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.themeName, { color: colors.text }]}>
          {item.name}
        </Text>

        {!unlocked && item.isPremium && (
          <View style={[styles.lockBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.lockText}>Premium</Text>
          </View>
        )}

        {isActive && (
          <View
            style={[styles.activeBadge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.activeText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Темы оформления
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Выберите тему, которая вам по душе
      </Text>

      <FlatList
        data={availableThemes}
        renderItem={renderTheme}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
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
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  themePreview: {
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 60,
    height: 60,
    gap: 2,
  },
  previewCell: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  previewNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
