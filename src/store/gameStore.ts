import { create } from 'zustand';
import {
  generateSudoku,
  Grid,
  Difficulty,
  getConflicts,
  getHint,
  isGridComplete,
} from '../utils/sudokuGenerator';
import { GameState, CellNotes } from '../models/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function createEmptyNotes(): CellNotes[][] {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ values: new Set<number>() }))
  );
}

interface GameStore {
  game: GameState | null;
  history: Grid[];
  historyIndex: number;

  startNewGame: (difficulty: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  placeNumber: (num: number) => void;
  toggleNote: (num: number) => void;
  eraseCell: () => void;
  useHint: () => void;
  undo: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  updateTimer: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  history: [],
  historyIndex: -1,

  startNewGame: (difficulty: Difficulty) => {
    const { puzzle, solution } = generateSudoku(difficulty);

    const newGame: GameState = {
      id: generateId(),
      puzzle,
      solution,
      currentGrid: puzzle.map((row) => [...row]),
      notes: createEmptyNotes(),
      difficulty,
      startedAt: Date.now(),
      elapsedTime: 0,
      isPaused: false,
      isCompleted: false,
      hintsUsed: 0,
      errorsCount: 0,
      maxErrors: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 4 : 3,
      selectedCell: null,
    };

    set({
      game: newGame,
      history: [puzzle.map((row) => [...row])],
      historyIndex: 0,
    });
  },

  selectCell: (row: number, col: number) => {
    const { game } = get();
    if (!game || game.isCompleted || game.isPaused) return;

    set({
      game: { ...game, selectedCell: { row, col } },
    });
  },

  placeNumber: (num: number) => {
    const { game, history, historyIndex } = get();
    if (!game || !game.selectedCell || game.isCompleted || game.isPaused) return;

    const { row, col } = game.selectedCell;

    if (game.puzzle[row][col] !== null) return;

    const newGrid = game.currentGrid.map((r) => [...r]);
    newGrid[row][col] = num;

    const isCorrect = game.solution[row][col] === num;
    const newErrorsCount = isCorrect ? game.errorsCount : game.errorsCount + 1;
    const isComplete = isGridComplete(newGrid);

    const newNotes = game.notes.map((r) =>
      r.map((c) => ({ values: new Set(c.values) }))
    );
    newNotes[row][col].values.clear();

    if (isCorrect) {
      for (let i = 0; i < 9; i++) {
        newNotes[row][i].values.delete(num);
        newNotes[i][col].values.delete(num);
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let i = boxRow; i < boxRow + 3; i++) {
        for (let j = boxCol; j < boxCol + 3; j++) {
          newNotes[i][j].values.delete(num);
        }
      }
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid.map((r) => [...r]));

    set({
      game: {
        ...game,
        currentGrid: newGrid,
        notes: newNotes,
        errorsCount: newErrorsCount,
        isCompleted: isComplete && isCorrect,
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  toggleNote: (num: number) => {
    const { game } = get();
    if (!game || !game.selectedCell || game.isCompleted || game.isPaused) return;

    const { row, col } = game.selectedCell;

    if (game.puzzle[row][col] !== null || game.currentGrid[row][col] !== null) {
      return;
    }

    const newNotes = game.notes.map((r) =>
      r.map((c) => ({ values: new Set(c.values) }))
    );

    if (newNotes[row][col].values.has(num)) {
      newNotes[row][col].values.delete(num);
    } else {
      newNotes[row][col].values.add(num);
    }

    set({
      game: { ...game, notes: newNotes },
    });
  },

  eraseCell: () => {
    const { game, history, historyIndex } = get();
    if (!game || !game.selectedCell || game.isCompleted || game.isPaused) return;

    const { row, col } = game.selectedCell;

    if (game.puzzle[row][col] !== null) return;

    const newGrid = game.currentGrid.map((r) => [...r]);
    newGrid[row][col] = null;

    const newNotes = game.notes.map((r) =>
      r.map((c) => ({ values: new Set(c.values) }))
    );
    newNotes[row][col].values.clear();

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid.map((r) => [...r]));

    set({
      game: { ...game, currentGrid: newGrid, notes: newNotes },
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  useHint: () => {
    const { game, history, historyIndex } = get();
    if (!game || game.isCompleted || game.isPaused) return;

    const hint = getHint(game.currentGrid, game.solution);
    if (!hint) return;

    const newGrid = game.currentGrid.map((r) => [...r]);
    newGrid[hint.row][hint.col] = hint.value;

    const isComplete = isGridComplete(newGrid);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid.map((r) => [...r]));

    set({
      game: {
        ...game,
        currentGrid: newGrid,
        hintsUsed: game.hintsUsed + 1,
        isCompleted: isComplete,
        selectedCell: { row: hint.row, col: hint.col },
      },
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { game, history, historyIndex } = get();
    if (!game || historyIndex <= 0 || game.isCompleted || game.isPaused) return;

    const previousGrid = history[historyIndex - 1].map((r) => [...r]);

    set({
      game: { ...game, currentGrid: previousGrid },
      historyIndex: historyIndex - 1,
    });
  },

  pauseGame: () => {
    const { game } = get();
    if (!game || game.isCompleted) return;

    set({ game: { ...game, isPaused: true } });
  },

  resumeGame: () => {
    const { game } = get();
    if (!game || game.isCompleted) return;

    set({ game: { ...game, isPaused: false } });
  },

  updateTimer: () => {
    const { game } = get();
    if (!game || game.isPaused || game.isCompleted) return;

    set({ game: { ...game, elapsedTime: game.elapsedTime + 1 } });
  },

  resetGame: () => {
    const { game } = get();
    if (!game) return;

    const resetGrid = game.puzzle.map((row) => [...row]);

    set({
      game: {
        ...game,
        currentGrid: resetGrid,
        notes: createEmptyNotes(),
        elapsedTime: 0,
        errorsCount: 0,
        hintsUsed: 0,
        isCompleted: false,
        selectedCell: null,
      },
      history: [resetGrid.map((r) => [...r])],
      historyIndex: 0,
    });
  },
}));
