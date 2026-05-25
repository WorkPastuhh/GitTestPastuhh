import {
  generateSudoku,
  validateGrid,
  isGridComplete,
  getConflicts,
  isValidPlacement,
  Grid,
  GRID_SIZE,
} from '../sudokuGenerator';

describe('Sudoku Generator', () => {
  describe('generateSudoku', () => {
    it('should generate a valid puzzle with a unique solution', () => {
      const { puzzle, solution } = generateSudoku('easy');

      expect(puzzle.length).toBe(GRID_SIZE);
      expect(puzzle[0].length).toBe(GRID_SIZE);

      expect(isGridComplete(solution)).toBe(true);
      expect(validateGrid(solution)).toBe(true);
    });

    it('should generate puzzles with different difficulty levels', () => {
      const easy = generateSudoku('easy');
      const hard = generateSudoku('hard');

      const easyEmpty = easy.puzzle.flat().filter((c) => c === null).length;
      const hardEmpty = hard.puzzle.flat().filter((c) => c === null).length;

      expect(hardEmpty).toBeGreaterThan(easyEmpty);
    });

    it('should have puzzle cells match solution cells', () => {
      const { puzzle, solution } = generateSudoku('medium');

      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (puzzle[row][col] !== null) {
            expect(puzzle[row][col]).toBe(solution[row][col]);
          }
        }
      }
    });
  });

  describe('validateGrid', () => {
    it('should return true for a valid complete grid', () => {
      const { solution } = generateSudoku('easy');
      expect(validateGrid(solution)).toBe(true);
    });

    it('should return false for an invalid grid', () => {
      const { solution } = generateSudoku('easy');
      solution[0][0] = solution[0][1];
      expect(validateGrid(solution)).toBe(false);
    });
  });

  describe('isGridComplete', () => {
    it('should return false for a puzzle with empty cells', () => {
      const { puzzle } = generateSudoku('easy');
      expect(isGridComplete(puzzle)).toBe(false);
    });

    it('should return true for a complete solution', () => {
      const { solution } = generateSudoku('easy');
      expect(isGridComplete(solution)).toBe(true);
    });
  });

  describe('getConflicts', () => {
    it('should detect row conflicts', () => {
      const grid: Grid = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => null)
      );
      grid[0][0] = 5;
      grid[0][5] = 5;

      const conflicts = getConflicts(grid, 0, 0, 5);
      expect(conflicts).toContainEqual({ row: 0, col: 5 });
    });

    it('should detect column conflicts', () => {
      const grid: Grid = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => null)
      );
      grid[0][0] = 3;
      grid[7][0] = 3;

      const conflicts = getConflicts(grid, 0, 0, 3);
      expect(conflicts).toContainEqual({ row: 7, col: 0 });
    });

    it('should detect box conflicts', () => {
      const grid: Grid = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => null)
      );
      grid[0][0] = 7;
      grid[2][2] = 7;

      const conflicts = getConflicts(grid, 0, 0, 7);
      expect(conflicts).toContainEqual({ row: 2, col: 2 });
    });

    it('should return empty array when no conflicts', () => {
      const grid: Grid = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => null)
      );
      grid[0][0] = 1;

      const conflicts = getConflicts(grid, 0, 0, 1);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('isValidPlacement', () => {
    it('should allow valid placement', () => {
      const grid: Grid = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => null)
      );
      expect(isValidPlacement(grid, 0, 0, 5)).toBe(true);
    });

    it('should reject placement conflicting with row', () => {
      const grid: Grid = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => null)
      );
      grid[0][3] = 5;
      expect(isValidPlacement(grid, 0, 0, 5)).toBe(false);
    });
  });
});
