/**
 * Генерация и валидация игрового поля Судоку.
 * Алгоритм основан на заполнении диагональных блоков 3x3 с последующим
 * решением полной сетки методом backtracking, после чего удаляются клетки
 * в зависимости от выбранного уровня сложности.
 */

export type CellValue = number | null;
export type Grid = CellValue[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const GRID_SIZE = 9;
const BOX_SIZE = 3;

const CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 30,
  medium: 40,
  hard: 50,
  expert: 58,
};

function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isValidPlacement(
  grid: Grid,
  row: number,
  col: number,
  num: number
): boolean {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let i = boxRow; i < boxRow + BOX_SIZE; i++) {
    for (let j = boxCol; j < boxCol + BOX_SIZE; j++) {
      if (grid[i][j] === num) return false;
    }
  }

  return true;
}

function solveSudoku(grid: Grid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === null) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;

            if (solveSudoku(grid)) {
              return true;
            }

            grid[row][col] = null;
          }
        }

        return false;
      }
    }
  }
  return true;
}

function countSolutions(grid: Grid, limit: number = 2): number {
  let count = 0;

  function solve(): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(grid, row, col, num)) {
              grid[row][col] = num;

              if (solve()) {
                if (count >= limit) return true;
              }

              grid[row][col] = null;
            }
          }
          return false;
        }
      }
    }

    count++;
    return count >= limit;
  }

  solve();
  return count;
}

function fillDiagonalBoxes(grid: Grid): void {
  for (let box = 0; box < GRID_SIZE; box += BOX_SIZE) {
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;

    for (let row = box; row < box + BOX_SIZE; row++) {
      for (let col = box; col < box + BOX_SIZE; col++) {
        grid[row][col] = numbers[idx++];
      }
    }
  }
}

export function generateSudoku(difficulty: Difficulty): {
  puzzle: Grid;
  solution: Grid;
} {
  const grid = createEmptyGrid();

  fillDiagonalBoxes(grid);
  solveSudoku(grid);

  const solution: Grid = grid.map((row) => [...row]);
  const puzzle: Grid = grid.map((row) => [...row]);

  const cellsToRemove = CELLS_TO_REMOVE[difficulty];
  const positions = shuffleArray(
    Array.from({ length: 81 }, (_, i) => i)
  );

  let removed = 0;

  for (const pos of positions) {
    if (removed >= cellsToRemove) break;

    const row = Math.floor(pos / GRID_SIZE);
    const col = pos % GRID_SIZE;
    const backup = puzzle[row][col];

    puzzle[row][col] = null;

    const testGrid = puzzle.map((r) => [...r]);
    const solutions = countSolutions(testGrid);

    if (solutions === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}

export function validateGrid(grid: Grid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = grid[row][col];
      if (value === null) return false;

      grid[row][col] = null;
      const valid = isValidPlacement(grid, row, col, value);
      grid[row][col] = value;

      if (!valid) return false;
    }
  }
  return true;
}

export function isGridComplete(grid: Grid): boolean {
  return grid.every((row) => row.every((cell) => cell !== null));
}

export function getConflicts(
  grid: Grid,
  row: number,
  col: number,
  value: number
): { row: number; col: number }[] {
  const conflicts: { row: number; col: number }[] = [];

  for (let i = 0; i < GRID_SIZE; i++) {
    if (i !== col && grid[row][i] === value) {
      conflicts.push({ row, col: i });
    }
    if (i !== row && grid[i][col] === value) {
      conflicts.push({ row: i, col });
    }
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let i = boxRow; i < boxRow + BOX_SIZE; i++) {
    for (let j = boxCol; j < boxCol + BOX_SIZE; j++) {
      if (i !== row && j !== col && grid[i][j] === value) {
        if (!conflicts.find((c) => c.row === i && c.col === j)) {
          conflicts.push({ row: i, col: j });
        }
      }
    }
  }

  return conflicts;
}

export function getHint(
  puzzle: Grid,
  solution: Grid
): { row: number; col: number; value: number } | null {
  const emptyCells: { row: number; col: number }[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (puzzle[row][col] === null) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) return null;

  const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  return {
    row: cell.row,
    col: cell.col,
    value: solution[cell.row][cell.col]!,
  };
}

export { GRID_SIZE, BOX_SIZE, isValidPlacement, createEmptyGrid };
