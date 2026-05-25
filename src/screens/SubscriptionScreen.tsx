import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { SubscriptionType } from '../models/types';

interface SubscriptionScreenProps {
  navigation: any;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  type: SubscriptionType;
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  color: string;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
}) => {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = theme;
  const { profile, updateSubscription } = useUserStore();

  const plans: SubscriptionPlan[] = [
    {
      type: 'free',
      name: 'Бесплатный',
      price: '0 ₽',
      period: '',
      color: colors.textSecondary,
      features: [
        { text: 'Неограниченные игры', included: true },
        { text: '2 темы оформления', included: true },
        { text: '3 подсказки в день', included: true },
        { text: 'Реклама', included: true },
        { text: 'Премиум темы', included: false },
        { text: 'Участие в турнирах', included: false },
        { text: 'Подробная статистика', included: false },
      ],
    },
    {
      type: 'premium',
      name: 'Premium',
      price: '199 ₽',
      period: 'в месяц',
      color: colors.primary,
      features: [
        { text: 'Неограниченные игры', included: true },
        { text: 'Все темы оформления', included: true },
        { text: 'Безлимитные подсказки', included: true },
        { text: 'Без рекламы', included: true },
        { text: 'Участие в турнирах', included: true },
        { text: 'Подробная статистика', included: true },
        { text: 'Приоритетная поддержка', included: false },
      ],
    },
    {
      type: 'pro',
      name: 'Pro',
      price: '399 ₽',
      period: 'в месяц',
      color: colors.accent,
      features: [
        { text: 'Все возможности Premium', included: true },
        { text: 'Создание турниров', included: true },
        { text: 'Эксклюзивные темы', included: true },
        { text: 'Приоритетная поддержка', included: true },
        { text: 'Ранний доступ к обновлениям', included: true },
        { text: 'Бейдж Pro в профиле', included: true },
        { text: 'Бонус рейтинга x1.5', included: true },
      ],
    },
  ];

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!profile) {
      Alert.alert('Ошибка', 'Необходимо войти в аккаунт');
      return;
    }

    if (plan.type === 'free') return;

    Alert.alert(
      `Подписка ${plan.name}`,
      `Оформить подписку за ${plan.price} ${plan.period}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Оформить',
          onPress: () => {
            const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
            updateSubscription(plan.type, expiresAt);
            Alert.alert('Готово', `Подписка ${plan.name} активирована!`);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Подписки</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Выберите план, который подходит вам
        </Text>

        {plans.map((plan) => {
          const isActive = profile?.subscriptionType === plan.type;

          return (
            <View
              key={plan.type}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isActive ? plan.color : 'transparent',
                  borderWidth: isActive ? 2 : 0,
                },
              ]}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: plan.color }]}>
                  {plan.name}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.planPrice, { color: colors.text }]}>
                    {plan.price}
                  </Text>
                  {plan.period && (
                    <Text
                      style={[
                        styles.planPeriod,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {plan.period}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Text
                      style={[
                        styles.featureIcon,
                        {
                          color: feature.included
                            ? colors.success
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {feature.included ? '✓' : '✗'}
                    </Text>
                    <Text
                      style={[
                        styles.featureText,
                        {
                          color: feature.included
                            ? colors.text
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {!isActive && plan.type !== 'free' && (
                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    { backgroundColor: plan.color },
                  ]}
                  onPress={() => handleSubscribe(plan)}
                >
                  <Text style={styles.subscribeButtonText}>Оформить</Text>
                </TouchableOpacity>
              )}

              {isActive && (
                <View
                  style={[
                    styles.activeBadge,
                    { backgroundColor: plan.color + '20' },
                  ]}
                >
                  <Text style={[styles.activeText, { color: plan.color }]}>
                    Активна
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  planCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 12,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureIcon: {
    fontSize: 14,
    width: 20,
    fontWeight: '600',
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  subscribeButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activeBadge: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
