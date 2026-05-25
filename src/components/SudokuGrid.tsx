import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Grid, CellValue, GRID_SIZE, BOX_SIZE } from '../utils/sudokuGenerator';
import { CellNotes, ThemeColors } from '../models/types';

interface SudokuGridProps {
  puzzle: Grid;
  currentGrid: Grid;
  solution: Grid;
  notes: CellNotes[][];
  selectedCell: { row: number; col: number } | null;
  onCellPress: (row: number, col: number) => void;
  theme: ThemeColors;
  highlightConflicts?: boolean;
  highlightSameNumbers?: boolean;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({
  puzzle,
  currentGrid,
  solution,
  notes,
  selectedCell,
  onCellPress,
  theme,
  highlightConflicts = true,
  highlightSameNumbers = true,
}) => {
  const selectedValue = selectedCell
    ? currentGrid[selectedCell.row][selectedCell.col]
    : null;

  const getCellStyle = (row: number, col: number) => {
    const isSelected =
      selectedCell?.row === row && selectedCell?.col === col;
    const isFixed = puzzle[row][col] !== null;
    const value = currentGrid[row][col];
    const isError =
      value !== null && value !== solution[row][col] && highlightConflicts;

    const isSameRow = selectedCell?.row === row;
    const isSameCol = selectedCell?.col === col;
    const isSameBox =
      selectedCell &&
      Math.floor(selectedCell.row / BOX_SIZE) === Math.floor(row / BOX_SIZE) &&
      Math.floor(selectedCell.col / BOX_SIZE) === Math.floor(col / BOX_SIZE);

    const isSameNumber =
      highlightSameNumbers &&
      selectedValue !== null &&
      value === selectedValue &&
      !isSelected;

    let backgroundColor = theme.cellBackground;

    if (isSelected) {
      backgroundColor = theme.cellSelected;
    } else if (isError) {
      backgroundColor = theme.cellConflict;
    } else if (isSameNumber) {
      backgroundColor = theme.cellSelected;
    } else if (isSameRow || isSameCol || isSameBox) {
      backgroundColor = theme.cellHighlight;
    } else if (isFixed) {
      backgroundColor = theme.cellFixed;
    }

    return { backgroundColor };
  };

  const getNumberColor = (row: number, col: number) => {
    const isFixed = puzzle[row][col] !== null;
    const value = currentGrid[row][col];
    const isError = value !== null && value !== solution[row][col];

    if (isError) return theme.numberError;
    if (isFixed) return theme.numberFixed;
    return theme.numberUser;
  };

  const getBorderStyle = (row: number, col: number) => {
    return {
      borderRightWidth: (col + 1) % BOX_SIZE === 0 && col < GRID_SIZE - 1 ? 2 : 0.5,
      borderBottomWidth: (row + 1) % BOX_SIZE === 0 && row < GRID_SIZE - 1 ? 2 : 0.5,
      borderRightColor:
        (col + 1) % BOX_SIZE === 0 ? theme.gridLineThick : theme.gridLine,
      borderBottomColor:
        (row + 1) % BOX_SIZE === 0 ? theme.gridLineThick : theme.gridLine,
    };
  };

  const renderCell = (row: number, col: number) => {
    const value = currentGrid[row][col];
    const cellNotes = notes[row][col];
    const cellStyle = getCellStyle(row, col);
    const borderStyle = getBorderStyle(row, col);

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[styles.cell, cellStyle, borderStyle]}
        onPress={() => onCellPress(row, col)}
        activeOpacity={0.7}
      >
        {value !== null ? (
          <Text
            style={[styles.cellNumber, { color: getNumberColor(row, col) }]}
          >
            {value}
          </Text>
        ) : cellNotes.values.size > 0 ? (
          <View style={styles.notesContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Text
                key={num}
                style={[
                  styles.noteNumber,
                  { color: theme.noteText },
                  !cellNotes.values.has(num) && styles.noteHidden,
                ]}
              >
                {cellNotes.values.has(num) ? num : ' '}
              </Text>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.grid, { borderColor: theme.gridLineThick }]}>
      {Array.from({ length: GRID_SIZE }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: GRID_SIZE }, (_, col) => renderCell(row, col))}
        </View>
      ))}
    </View>
  );
};

const CELL_SIZE = 38;

const styles = StyleSheet.create({
  grid: {
    borderWidth: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellNumber: {
    fontSize: 20,
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    padding: 1,
  },
  noteNumber: {
    fontSize: 9,
    width: (CELL_SIZE - 6) / 3,
    height: (CELL_SIZE - 6) / 3,
    textAlign: 'center',
    lineHeight: (CELL_SIZE - 6) / 3,
  },
  noteHidden: {
    opacity: 0,
  },
});
