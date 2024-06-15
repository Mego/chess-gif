export type PartialRecord<K extends number | string | symbol, V> = {
  [k in K]?: V;
};

export const enum Piece {
  King = "K",
  Queen = "Q",
  Rook = "R",
  Bishop = "B",
  Knight = "N",
  Pawn = "",
}

export const enum PieceAlias {
  King = "K",
  Queen = "Q",
  Rook = "R",
  Bishop = "B",
  Knight = "N",
  Pawn = "",
  WKing = "♔",
  BKing = "♚",
  WQueen = "♕",
  BQueen = "♛",
  WRook = "♖",
  BRook = "♜",
  WBishop = "♗",
  BBishop = "♝",
  WKnight = "♘",
  BKnight = "♞",
  WPawn = "♙",
  BPawn = "♟",
}

export const enum Player {
  White,
  Black,
}

export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

export type Square = `${File}${Rank}`;

export type PromotionPiece = Exclude<Piece, Piece.Pawn>;

export type Move = {
  player: Player;
  from: Square;
  to: Square;
  capture?: Square;
  promotion?: PromotionPiece;
  // for the purpose of rendering a gif, checks and mate do not matter
  raw: string;
};

export type ParsedMove = {
  player: Player;
  piece: Piece;
  from_file?: File;
  from_rank?: Rank;
  capture: boolean;
  to_file: File;
  to_rank: Rank;
  promotion?: PromotionPiece;
  raw: string;
};

export type BoardPieces = PartialRecord<Square, Piece>;

export type FullBoardPieces = {
  white: BoardPieces;
  black: BoardPieces;
};
