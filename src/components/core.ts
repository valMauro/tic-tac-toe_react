import { useState, useMemo, useCallback, useEffect } from "react";
import { CellValue } from "./cellValue.interface";

const Values = {
  EMPTY: "",
  X: "X",
  O: "O",
};

const WinConditions = [
  // rows
  [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
  ],
  [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ],
  [
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ],
  // cols
  [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
  ],
  [
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 2 },
    { row: 2, col: 2 },
  ],
  // diagonals
  [
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 1 },
    { row: 2, col: 0 },
  ],
];
const DEFAULT_EMPTY_VALUE: CellValue = { text: Values.EMPTY, value: 0 };
const DEFAULT_X_VALUE: CellValue = { text: Values.X, value: 1 };
const DEFAULT_O_VALUE: CellValue = { text: Values.O, value: -1 };

const DEFAULT_MATRIX = [
  [DEFAULT_EMPTY_VALUE, DEFAULT_EMPTY_VALUE, DEFAULT_EMPTY_VALUE],
  [DEFAULT_EMPTY_VALUE, DEFAULT_EMPTY_VALUE, DEFAULT_EMPTY_VALUE],
  [DEFAULT_EMPTY_VALUE, DEFAULT_EMPTY_VALUE, DEFAULT_EMPTY_VALUE],
];

export function coreService() {
  const [matrix, setMatrix] = useState<CellValue[][]>(DEFAULT_MATRIX);

  const [winnerValue, setWinnerValue] = useState<number>(0);

  const [winnerCondition, setWinnerCondition] = useState<
    { row: number; col: number }[]
  >([]);

  const [currentValue, setCurrentValue] = useState<CellValue>(DEFAULT_X_VALUE);

  const winner = useMemo(() => {
    switch (winnerValue) {
      case 3:
        return Values.X;
      case -3:
        return Values.O;
      default:
        return Values.EMPTY;
    }
  }, [winnerValue]);

  const parita = useMemo(() => {
    let matrixFull = 0;
    matrix.forEach((row) => {
      row.forEach((cell) => {
        if (cell.value !== 0) {
          matrixFull += 1;
        }
      });
    });
    return matrixFull === 9 && !winnerValue;
  }, [winnerValue, matrix]);

  const isHighlight = useCallback(
    (row: number, col: number): boolean => {
      return winnerCondition.some(
        (condition) => row === condition.row && col === condition.col
      );
    },
    [winnerCondition]
  );

  const reset = useCallback(() => {
    setMatrix((prevMatrix) => {
      let _matrix = [...prevMatrix];
      _matrix = _matrix.map((row) => {
        return row.map((cell) => {
          if (JSON.stringify(cell) !== JSON.stringify(DEFAULT_EMPTY_VALUE)) {
            return DEFAULT_EMPTY_VALUE;
          } else {
            return cell;
          }
        });
      });
      return _matrix;
    });
    setCurrentValue(() => DEFAULT_X_VALUE);
    setWinnerValue(() => 0);
    setWinnerCondition(() => []);
  }, []);

  const handleCellClick = (row: number, cell: number): void => {
    if (winnerValue !== 0) {
      return;
    }

    setMatrix((prevMatrix) => {
      const newMatrix = [...prevMatrix];
      if (
        JSON.stringify(newMatrix[row][cell]) ===
        JSON.stringify(DEFAULT_EMPTY_VALUE)
      ) {
        newMatrix[row][cell] = currentValue;
        setCurrentValue((prevValue) =>
          JSON.stringify(prevValue) === JSON.stringify(DEFAULT_X_VALUE)
            ? DEFAULT_O_VALUE
            : DEFAULT_X_VALUE
        );
      }
      return newMatrix;
    });
  };

  useEffect(() => {
    WinConditions.forEach((cond) => {
      let totalSum = 0;
      cond.forEach(({ row, col }) => {
        totalSum += matrix[row][col].value;
      });
      if (totalSum === 3 || totalSum === -3) {
        setWinnerValue(totalSum);
        setWinnerCondition(cond);
      }
    });
  }, [matrix]);
}
