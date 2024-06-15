import {
  BoardPieces,
  FullBoardPieces,
  Move,
  ParsedMove,
  Piece,
  Player,
  Square,
} from "./types";
import {
  addFile,
  adjacentSquares,
  filter_map,
  isBishopMove,
  isKingMove,
  isKnightMove,
  isRookMove,
  map_length,
  squaresBetween,
} from "./util";

const default_positions: FullBoardPieces = {
  white: {
    a1: Piece.Rook,
    b1: Piece.Knight,
    c1: Piece.Bishop,
    d1: Piece.Queen,
    e1: Piece.King,
    f1: Piece.Bishop,
    g1: Piece.Knight,
    h1: Piece.Rook,
    a2: Piece.Pawn,
    b2: Piece.Pawn,
    c2: Piece.Pawn,
    d2: Piece.Pawn,
    e2: Piece.Pawn,
    f2: Piece.Pawn,
    g2: Piece.Pawn,
    h2: Piece.Pawn,
  },
  black: {
    a8: Piece.Rook,
    b8: Piece.Knight,
    c8: Piece.Bishop,
    d8: Piece.Queen,
    e8: Piece.King,
    f8: Piece.Bishop,
    g8: Piece.Knight,
    h8: Piece.Rook,
    a7: Piece.Pawn,
    b7: Piece.Pawn,
    c7: Piece.Pawn,
    d7: Piece.Pawn,
    e7: Piece.Pawn,
    f7: Piece.Pawn,
    g7: Piece.Pawn,
    h7: Piece.Pawn,
  },
};

export class Board {
  white_piece_locations: BoardPieces;
  black_piece_locations: BoardPieces;

  constructor(setup: FullBoardPieces = default_positions) {
    this.white_piece_locations = { ...setup.white };
    this.black_piece_locations = { ...setup.black };
  }

  findPieceForMove(move: ParsedMove): Square | null {
    let potential_pieces =
      move.player === Player.White
        ? this.white_piece_locations
        : this.black_piece_locations;
    potential_pieces = filter_map(potential_pieces, (_, p) => p === move.piece);
    if (move.from_file) {
      potential_pieces = filter_map(
        potential_pieces,
        (sq, _) => sq[0] === move.from_file
      );
    }
    if (move.from_rank) {
      potential_pieces = filter_map(
        potential_pieces,
        (sq, _) => sq[1] === move.from_rank
      );
    }
    switch (move.piece) {
      case Piece.Pawn: {
        if (!move.from_file) {
          const src_squares = [
            `${move.to_file}${
              +move.to_rank + (move.player === Player.White ? -1 : 1)
            }` as Square,
            `${move.to_file}${
              +move.to_rank + (move.player === Player.White ? -2 : 2)
            }` as Square,
          ];
          if (potential_pieces[src_squares[0]] === Piece.Pawn) {
            return src_squares[0];
          }
          if (potential_pieces[src_squares[1]] === Piece.Pawn) {
            return src_squares[1];
          }
        } else if (move.capture) {
          const src_squares: Square[] = [];
          try {
            src_squares.push(
              `${addFile(move.to_file, 1)}${
                +move.to_rank + (move.player === Player.White ? -1 : 1)
              }` as Square
            );
          } catch {}
          try {
            src_squares.push(
              `${addFile(move.to_file, -1)}${
                +move.to_rank + (move.player === Player.White ? -1 : 1)
              }` as Square
            );
          } catch {}

          if (potential_pieces[src_squares[0]] === Piece.Pawn) {
            return src_squares[0];
          }
          if (potential_pieces[src_squares[1]] === Piece.Pawn) {
            return src_squares[1];
          }
        }
        break;
      }
      case Piece.Knight: {
        potential_pieces = filter_map(potential_pieces, (sq, _) =>
          isKnightMove(sq, `${move.to_file}${move.to_rank}`)
        );
        break;
      }
      case Piece.Bishop: {
        potential_pieces = filter_map(
          potential_pieces,
          (sq, _) =>
            isBishopMove(sq, `${move.to_file}${move.to_rank}`) &&
            squaresBetween(sq, `${move.to_file}${move.to_rank}`).every(
              (square) =>
                this.black_piece_locations[square] === undefined &&
                this.white_piece_locations[square] === undefined
            )
        );
        break;
      }
      case Piece.Rook: {
        potential_pieces = filter_map(
          potential_pieces,
          (sq, _) =>
            isRookMove(sq, `${move.to_file}${move.to_rank}`) &&
            squaresBetween(sq, `${move.to_file}${move.to_rank}`).every(
              (square) =>
                this.black_piece_locations[square] === undefined &&
                this.white_piece_locations[square] === undefined
            )
        );
        break;
      }
      case Piece.Queen: {
        potential_pieces = filter_map(
          potential_pieces,
          (sq, _) =>
            (isRookMove(sq, `${move.to_file}${move.to_rank}`) ||
              isBishopMove(sq, `${move.to_file}${move.to_rank}`)) &&
            squaresBetween(sq, `${move.to_file}${move.to_rank}`).every(
              (square) =>
                this.black_piece_locations[square] === undefined &&
                this.white_piece_locations[square] === undefined
            )
        );
        break;
      }
      case Piece.King: {
        potential_pieces = filter_map(potential_pieces, (sq, _) =>
          isKingMove(sq, `${move.to_file}${move.to_rank}`)
        );
        break;
      }
    }
    if (map_length(potential_pieces) === 1) {
      return Object.entries(potential_pieces)[0][0] as Square;
    }
    return null;
  }

  doMove(move: Move) {
    if (["O-O", "O-O-O", "0-0", "0-0-0"].includes(move.raw)) {
      this.doCastle(move.raw.length === 3, move.player);
      return;
    }
    const own_pieces =
      move.player === Player.White
        ? this.white_piece_locations
        : this.black_piece_locations;

    const piece = own_pieces[move.from];
    delete own_pieces[move.from];
    own_pieces[move.to] = move.promotion ?? piece;
    if (move.capture) {
      this.doCapture(move as Move & { capture: Square });
    }
  }

  doCastle(kingside: boolean, player: Player) {
    const own_pieces =
      player === Player.White
        ? this.white_piece_locations
        : this.black_piece_locations;
    const rook_positions = (Object.keys(own_pieces) as Square[])
      .filter((sq) => own_pieces[sq] === Piece.Rook)
      .sort();
    const rank = player === Player.White ? "1" : "8";
    const king_position = this.getKingPosition(player);
    if (kingside) {
      delete own_pieces[king_position];
      own_pieces[`g${rank}`] = Piece.King;
      delete own_pieces[rook_positions[1]];
      own_pieces[`f${rank}`] = Piece.Rook;
    } else {
      delete own_pieces[king_position];
      own_pieces[`c${rank}`] = Piece.King;
      delete own_pieces[rook_positions[0]];
      own_pieces[`d${rank}`] = Piece.Rook;
    }
  }

  doCapture(move: Move & { capture: Square }) {
    const opponent_pieces =
      move.player === Player.White
        ? this.black_piece_locations
        : this.white_piece_locations;
    delete opponent_pieces[move.capture];
  }

  getKingPosition(player: Player): Square {
    const pieces =
      player === Player.White
        ? this.white_piece_locations
        : this.black_piece_locations;
    return (Object.keys(pieces) as Square[]).find(
      (sq) => pieces[sq] === Piece.King
    )!;
  }

  toFullBoardPieces(): FullBoardPieces {
    return {
      white: { ...this.white_piece_locations },
      black: { ...this.black_piece_locations },
    };
  }

  fixCaptureForEnPassant(move: Move): Move {
    const own_pieces =
      move.player === Player.White
        ? this.white_piece_locations
        : this.black_piece_locations;
    const opponent_pieces =
      move.player === Player.White
        ? this.black_piece_locations
        : this.white_piece_locations;
    if (
      move.capture &&
      own_pieces[move.from] === Piece.Pawn &&
      opponent_pieces[move.capture] === undefined
    ) {
      const [rank, file] = move.capture;
      move.capture = `${rank}${
        move.player === Player.White ? +file - 1 : +file + 1
      }` as Square;
    }
    return move;
  }
}

export class AtomicBoard extends Board {
  doCapture(move: Move & { capture: Square }): void {
    const own_pieces =
      move.player === Player.White
        ? this.white_piece_locations
        : this.black_piece_locations;
    const opponent_pieces =
      move.player === Player.White
        ? this.black_piece_locations
        : this.white_piece_locations;

    let capture_square = move.capture;
    if (own_pieces[move.to] === Piece.Pawn && move.to !== move.capture) {
      // in atomic, explosions from en passant are centered on the destination square
      // remove the captured pawn, then do explosion logic centered on the destination square
      delete opponent_pieces[capture_square];
      capture_square = move.to;
    }
    for (const square of adjacentSquares(capture_square)) {
      if (square === capture_square || own_pieces[square] !== Piece.Pawn) {
        delete own_pieces[square];
      }
      if (square === capture_square || opponent_pieces[square] !== Piece.Pawn) {
        delete opponent_pieces[square];
      }
    }
  }
}
