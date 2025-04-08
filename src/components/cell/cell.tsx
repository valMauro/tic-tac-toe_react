import { CellValue } from "../cellValue.interface";
import "./cell.css";

interface CellProps {
  value: CellValue;
  row: number;
  cell: number;
  highlight: boolean;
  onClickCallback: (row: number, cell: number) => void;
}

function Cell({
  value,
  row,
  cell,
  highlight,
  onClickCallback,
}: Readonly<CellProps>) {
  return (
    <div
      role="presentation"
      className={"cell " + (highlight ? "highlight" : "")}
      onClick={() => onClickCallback(row, cell)}
    >
      {value.text}
    </div>
  );
}

export default Cell;
