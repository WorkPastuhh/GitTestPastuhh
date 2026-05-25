/**
 * Сервис работы с локальной базой данных SQLite.
 * Хранит результаты игр, данные пользователя и статистику турниров.
 * SQLite выбран как надёжное встраиваемое решение, не требующее сервера.
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'sudoku.db';

export interface GameResultRecord {
  id: number;
  difficulty: string;
  elapsed_time: number;
  hints_used: number;
  errors_count: number;
  score: number;
  is_won: number;
  is_tournament: number;
  tournament_id: string | null;
  completed_at: string;
}

export interface TournamentRecord {
  id: string;
  name: string;
  difficulty: string;
  start_time: string;
  end_time: string;
  status: string;
  max_participants: number;
  entry_fee: number;
  prize_pool: number;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync(DB_NAME);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS game_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        difficulty TEXT NOT NULL,
        elapsed_time INTEGER NOT NULL,
        hints_used INTEGER DEFAULT 0,
        errors_count INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        is_won INTEGER DEFAULT 0,
        is_tournament INTEGER DEFAULT 0,
        tournament_id TEXT,
        completed_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT DEFAULT 'upcoming',
        max_participants INTEGER DEFAULT 50,
        entry_fee INTEGER DEFAULT 0,
        prize_pool INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_results_difficulty 
        ON game_results(difficulty);
      CREATE INDEX IF NOT EXISTS idx_results_completed 
        ON game_results(completed_at);
      CREATE INDEX IF NOT EXISTS idx_tournaments_status 
        ON tournaments(status);
    `);
  }

  async saveGameResult(result: Omit<GameResultRecord, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = await this.db.prepareAsync(
      `INSERT INTO game_results 
        (difficulty, elapsed_time, hints_used, errors_count, score, is_won, is_tournament, tournament_id, completed_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      const result2 = await stmt.executeAsync(
        result.difficulty,
        result.elapsed_time,
        result.hints_used,
        result.errors_count,
        result.score,
        result.is_won,
        result.is_tournament,
        result.tournament_id,
        result.completed_at
      );
      return result2.lastInsertRowId;
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async getGameResults(limit: number = 50): Promise<GameResultRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAllAsync<GameResultRecord>(
      'SELECT * FROM game_results ORDER BY completed_at DESC LIMIT ?',
      limit
    );
  }

  async getStatsByDifficulty(difficulty: string): Promise<{
    total: number;
    won: number;
    avgTime: number;
    bestTime: number | null;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const stats = await this.db.getFirstAsync<{
      total: number;
      won: number;
      avg_time: number;
      best_time: number | null;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(is_won) as won,
        AVG(CASE WHEN is_won = 1 THEN elapsed_time END) as avg_time,
        MIN(CASE WHEN is_won = 1 THEN elapsed_time END) as best_time
      FROM game_results 
      WHERE difficulty = ?`,
      difficulty
    );

    return {
      total: stats?.total ?? 0,
      won: stats?.won ?? 0,
      avgTime: stats?.avg_time ?? 0,
      bestTime: stats?.best_time ?? null,
    };
  }

  async saveTournament(tournament: TournamentRecord): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = await this.db.prepareAsync(
      `INSERT OR REPLACE INTO tournaments 
        (id, name, difficulty, start_time, end_time, status, max_participants, entry_fee, prize_pool) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      await stmt.executeAsync(
        tournament.id,
        tournament.name,
        tournament.difficulty,
        tournament.start_time,
        tournament.end_time,
        tournament.status,
        tournament.max_participants,
        tournament.entry_fee,
        tournament.prize_pool
      );
    } finally {
      await stmt.finalizeAsync();
    }
  }

  async getTournaments(status?: string): Promise<TournamentRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    if (status) {
      return await this.db.getAllAsync<TournamentRecord>(
        'SELECT * FROM tournaments WHERE status = ? ORDER BY start_time DESC',
        status
      );
    }

    return await this.db.getAllAsync<TournamentRecord>(
      'SELECT * FROM tournaments ORDER BY start_time DESC'
    );
  }

  async setSetting(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
      key,
      value
    );
  }

  async getSetting(key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM user_settings WHERE key = ?',
      key
    );

    return row?.value ?? null;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
