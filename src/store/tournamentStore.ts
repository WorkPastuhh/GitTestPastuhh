import { create } from 'zustand';
import {
  Tournament,
  TournamentParticipant,
  TournamentStatus,
} from '../models/types';
import { Difficulty } from '../utils/sudokuGenerator';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface TournamentStore {
  tournaments: Tournament[];
  activeTournament: Tournament | null;

  createTournament: (params: {
    name: string;
    description: string;
    difficulty: Difficulty;
    startTime: number;
    durationMinutes: number;
    maxParticipants: number;
    entryFee: number;
  }) => Tournament;
  joinTournament: (tournamentId: string, userId: string, username: string) => boolean;
  leaveTournament: (tournamentId: string, userId: string) => void;
  submitResult: (
    tournamentId: string,
    userId: string,
    elapsedTime: number,
    score: number
  ) => void;
  updateTournamentStatus: (tournamentId: string, status: TournamentStatus) => void;
  getUpcomingTournaments: () => Tournament[];
  getActiveTournaments: () => Tournament[];
  getCompletedTournaments: () => Tournament[];
  getTournamentLeaderboard: (
    tournamentId: string
  ) => TournamentParticipant[];
  setActiveTournament: (tournament: Tournament | null) => void;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: [],
  activeTournament: null,

  createTournament: (params) => {
    const tournament: Tournament = {
      id: generateId(),
      name: params.name,
      description: params.description,
      difficulty: params.difficulty,
      startTime: params.startTime,
      endTime: params.startTime + params.durationMinutes * 60 * 1000,
      maxParticipants: params.maxParticipants,
      participants: [],
      status: 'upcoming',
      entryFee: params.entryFee,
      prizePool: 0,
    };

    set((state) => ({
      tournaments: [...state.tournaments, tournament],
    }));

    return tournament;
  },

  joinTournament: (tournamentId: string, userId: string, username: string) => {
    const { tournaments } = get();
    const tournament = tournaments.find((t) => t.id === tournamentId);

    if (!tournament) return false;
    if (tournament.participants.length >= tournament.maxParticipants) return false;
    if (tournament.participants.some((p) => p.userId === userId)) return false;
    if (tournament.status !== 'upcoming' && tournament.status !== 'active') {
      return false;
    }

    const participant: TournamentParticipant = {
      userId,
      username,
      joinedAt: Date.now(),
    };

    set((state) => ({
      tournaments: state.tournaments.map((t) =>
        t.id === tournamentId
          ? {
              ...t,
              participants: [...t.participants, participant],
              prizePool: t.prizePool + t.entryFee,
            }
          : t
      ),
    }));

    return true;
  },

  leaveTournament: (tournamentId: string, userId: string) => {
    set((state) => ({
      tournaments: state.tournaments.map((t) =>
        t.id === tournamentId
          ? {
              ...t,
              participants: t.participants.filter(
                (p) => p.userId !== userId
              ),
              prizePool: t.prizePool - t.entryFee,
            }
          : t
      ),
    }));
  },

  submitResult: (
    tournamentId: string,
    userId: string,
    elapsedTime: number,
    score: number
  ) => {
    set((state) => ({
      tournaments: state.tournaments.map((t) => {
        if (t.id !== tournamentId) return t;

        const updatedParticipants = t.participants.map((p) =>
          p.userId === userId
            ? { ...p, completedAt: Date.now(), elapsedTime, score }
            : p
        );

        const ranked = [...updatedParticipants]
          .filter((p) => p.score !== undefined)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .map((p, idx) => ({ ...p, rank: idx + 1 }));

        const finalParticipants = updatedParticipants.map((p) => {
          const rankedP = ranked.find((r) => r.userId === p.userId);
          return rankedP ?? p;
        });

        return { ...t, participants: finalParticipants };
      }),
    }));
  },

  updateTournamentStatus: (tournamentId: string, status: TournamentStatus) => {
    set((state) => ({
      tournaments: state.tournaments.map((t) =>
        t.id === tournamentId ? { ...t, status } : t
      ),
    }));
  },

  getUpcomingTournaments: () => {
    return get().tournaments.filter((t) => t.status === 'upcoming');
  },

  getActiveTournaments: () => {
    return get().tournaments.filter((t) => t.status === 'active');
  },

  getCompletedTournaments: () => {
    return get().tournaments.filter((t) => t.status === 'completed');
  },

  getTournamentLeaderboard: (tournamentId: string) => {
    const tournament = get().tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return [];

    return [...tournament.participants]
      .filter((p) => p.score !== undefined)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  },

  setActiveTournament: (tournament: Tournament | null) => {
    set({ activeTournament: tournament });
  },
}));
