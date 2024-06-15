import { addFile } from "./util";
import { FullBoardPieces, Piece, Square } from "./types";

export const parseFEN = (fen: string): FullBoardPieces => {
  const pieces: FullBoardPieces = { white: {}, black: {} };
  const setup_string = fen.split(" ")[0].split("/");
  let rank = 8;

  for (const piece of setup_string) {
    let file = 0;
    for (const c of piece) {
      const square = `${addFile("a", file)}${rank}` as Square;
      switch (c) {
        case "r":
          pieces.black[square] = Piece.Rook;
          break;
        case "n":
          pieces.black[square] = Piece.Knight;
          break;
        case "b":
          pieces.black[square] = Piece.Bishop;
          break;
        case "q":
          pieces.black[square] = Piece.Queen;
          break;
        case "k":
          pieces.black[square] = Piece.King;
          break;
        case "p":
          pieces.black[square] = Piece.Pawn;
          break;
        case "R":
          pieces.white[square] = Piece.Rook;
          break;
        case "N":
          pieces.white[square] = Piece.Knight;
          break;
        case "B":
          pieces.white[square] = Piece.Bishop;
          break;
        case "Q":
          pieces.white[square] = Piece.Queen;
          break;
        case "K":
          pieces.white[square] = Piece.King;
          break;
        case "P":
          pieces.white[square] = Piece.Pawn;
          break;
        default:
          const skips = +c;
          if (!Number.isNaN(skips)) {
            file += skips - 1;
          } else {
            throw new Error(`invalid character in FEN string: ${c} (${fen})`);
          }
      }
      file += 1;
    }
    rank -= 1;
  }

  return pieces;
};
