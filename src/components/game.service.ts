import { CellValue } from "./cellValue.interface";

export async function getBestMoveFromOpenAI(matrix: CellValue[][]): Promise<{ row: number; col: number } | null> {
  const simpleMatrix = matrix.map(row => row.map(cell => cell.value));
  const prompt = `Stai giocando a tris (tic-tac-toe) contro un avversario. 
Le regole sono: la griglia è 3x3, ogni giocatore a turno inserisce il proprio simbolo (X o O) in una cella vuota (valore 0). 
Vince chi allinea tre simboli uguali in orizzontale, verticale o diagonale. 
Io gioco con il valore 1 (le X) e tu con il valore -1 (le O). 
Puoi utilizzare solo le celle con il valore 0 assegnato. 
Questa è la griglia attuale: ${JSON.stringify(simpleMatrix)}. 
Scegli la mossa migliore possibile per non perdere mai e rendi il gioco il più difficile possibile per l'avversario. 
Rispondi solo con {"row": x, "col": y}.`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=IL_TUO_API_KEY",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await response.json();
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = text.match(/\{.*?\}/);
    if (match) return JSON.parse(match[0]);
  } catch {
    return null;
  }
  return null;
}