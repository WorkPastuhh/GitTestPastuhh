/**
 * Расчёт игрового счёта.
 * Формула учитывает сложность, время прохождения, количество ошибок
 * и использованных подсказок.
 */

import { Difficulty } from '../utils/sudokuGenerator';

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.5,
  expert: 4.0,
};

const BASE_SCORE = 1000;
const TIME_PENALTY_PER_SECOND = 2;
const HINT_PENALTY = 50;
const ERROR_PENALTY = 30;
const STREAK_BONUS_PER_GAME = 10;

export function calculateScore(params: {
  difficulty: Difficulty;
  elapsedTimeSeconds: number;
  hintsUsed: number;
  errorsCount: number;
  streakLength: number;
}): number {
  const { difficulty, elapsedTimeSeconds, hintsUsed, errorsCount, streakLength } =
    params;

  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const timePenalty = elapsedTimeSeconds * TIME_PENALTY_PER_SECOND;
  const hintPenalty = hintsUsed * HINT_PENALTY;
  const errorPenalty = errorsCount * ERROR_PENALTY;
  const streakBonus = streakLength * STREAK_BONUS_PER_GAME;

  const rawScore =
    BASE_SCORE * multiplier - timePenalty - hintPenalty - errorPenalty + streakBonus;

  return Math.max(0, Math.round(rawScore));
}

export function calculateRatingChange(params: {
  playerRating: number;
  opponentRating: number;
  won: boolean;
  kFactor?: number;
}): number {
  const { playerRating, opponentRating, won, kFactor = 32 } = params;

  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));

  const actualScore = won ? 1 : 0;

  return Math.round(kFactor * (actualScore - expectedScore));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getDifficultyLabel(difficulty: Difficulty): string {
  const labels: Record<Difficulty, string> = {
    easy: 'Лёгкий',
    medium: 'Средний',
    hard: 'Сложный',
    expert: 'Эксперт',
  };
  return labels[difficulty];
}
