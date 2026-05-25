import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { storageService, AppSettings } from '../services/storageService';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = theme;

  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    autoRemoveNotes: true,
    highlightConflicts: true,
    highlightSameNumbers: true,
    timerVisible: true,
    notificationsEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await storageService.getSettings();
    setSettings(saved);
  };

  const updateSetting = async (key: keyof AppSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await storageService.saveSettings(updated);
  };

  const renderSettingRow = (
    label: string,
    description: string,
    key: keyof AppSettings
  ) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.gridLine }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>
          {label}
        </Text>
        <Text
          style={[styles.settingDescription, { color: colors.textSecondary }]}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{ false: colors.gridLine, true: colors.primary + '80' }}
        thumbColor={settings[key] ? colors.primary : '#f4f3f4'}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Настройки</Text>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ИГРОВОЙ ПРОЦЕСС
        </Text>
        {renderSettingRow(
          'Подсветка конфликтов',
          'Выделять ошибочные числа красным',
          'highlightConflicts'
        )}
        {renderSettingRow(
          'Подсветка одинаковых',
          'Выделять клетки с тем же числом',
          'highlightSameNumbers'
        )}
        {renderSettingRow(
          'Авто-удаление заметок',
          'Убирать заметки при вводе числа',
          'autoRemoveNotes'
        )}
        {renderSettingRow(
          'Показывать таймер',
          'Отображать время игры на экране',
          'timerVisible'
        )}

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ЗВУК И ВИБРАЦИЯ
        </Text>
        {renderSettingRow(
          'Звуковые эффекты',
          'Звук при вводе числа и завершении',
          'soundEnabled'
        )}
        {renderSettingRow(
          'Вибрация',
          'Тактильная отдача при нажатиях',
          'vibrationEnabled'
        )}

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          УВЕДОМЛЕНИЯ
        </Text>
        {renderSettingRow(
          'Уведомления',
          'Напоминания о турнирах и ежедневных головоломках',
          'notificationsEnabled'
        )}

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Судоку v1.0.0
          </Text>
        </View>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  versionText: {
    fontSize: 12,
  },
});
