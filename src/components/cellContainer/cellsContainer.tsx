import "./cellContainer.css";
import Cell from "../cell/cell";
import { CellValue } from "../cellValue.interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBestMoveFromOpenAI } from "../game.service";

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
function CellContainer() {
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
      _matrix = _matrix.map((row) => row.map(() => DEFAULT_EMPTY_VALUE));
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

  function getWinner(matrix: CellValue[][]): number {
    for (const cond of WinConditions) {
      let totalSum = 0;
      cond.forEach(({ row, col }) => {
        totalSum += matrix[row][col].value;
      });
      if (totalSum === 3 || totalSum === -3) {
        return totalSum;
      }
    }
    return 0;
  }

  useEffect(() => {
    setWinnerValue(getWinner(matrix));
    WinConditions.forEach((cond) => {
      let totalSum = 0;
      cond.forEach(({ row, col }) => {
        totalSum += matrix[row][col].value;
      });
      if (totalSum === 3 || totalSum === -3) {
        setWinnerValue(getWinner(matrix));
        setWinnerCondition(cond);
      }
    });
  }, [matrix]);

  useEffect(() => {
    setTimeout(() => {
      if (getWinner(matrix) !== 0 || parita) return;
      else if (currentValue.value === -1) {
        getBestMoveFromOpenAI(matrix).then((move) => {
          if (move) {
            setMatrix((prevMatrix) => {
              const newMatrix = prevMatrix.map((row) => row.slice());
              newMatrix[move.row][move.col] = DEFAULT_O_VALUE;
              return newMatrix;
            });
            setCurrentValue(DEFAULT_X_VALUE);
          }
        });
      }
    }, 100);
  }, [currentValue, winnerValue, parita]);

  return (
    <>
      {winner
        ? "Click reset button to start new play"
        : parita
        ? ""
        : currentValue.text + "'s Turn"}
      <br></br>
      {winner ? "Winner is " + winner : ""}
      {parita ? "Patta" : ""}
      <div className="cellContainer">
        {matrix.map((row, rowIndex) => (
          <div className="containerRow" key={rowIndex}>
            {row.map((value, colIndex) => (
              <Cell
                highlight={isHighlight(rowIndex, colIndex)}
                key={colIndex}
                value={value}
                onClickCallback={() => handleCellClick(rowIndex, colIndex)}
                cell={colIndex}
                row={rowIndex}
              />
            ))}
          </div>
        ))}
      </div>
      <button onClick={() => reset()}>reset</button>
    </>
  );
}

export default CellContainer;
