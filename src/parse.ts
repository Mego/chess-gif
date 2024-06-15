import { AtomicBoard, Board } from "./board";
import { parseFEN } from "./fen";
import { alias_to_canonical_map } from "./pieces";
import {
  FullBoardPieces,
  Move,
  ParsedMove,
  PieceAlias,
  Player,
  Rank,
  File,
  PromotionPiece,
  Square,
} from "./types";
import fs from "fs";

const variant_regex = /\[Variant "(?<variant>\w+)"\]/;
const setup_regex = /\[FEN "(?<fen>[^"]+)"\]/;

const algebraic_regex =
  /(?:(?<piece>[KQBNR♔♚♕♛♖♜♗♝♘♞♙♟]?)(?<from_file>[a-h])?(?<from_rank>[1-8])?(?<capture>x)?(?<to_file>[a-h])(?<to_rank>[1-8])(?<promotion>=[BNRQK♕♛♖♜♗♝♘♞♔♚])?(?:(?<check>\+)|(?<mate>#))?)|(?<queenside_castle>O-O-O|0-0-0)|(?<kingside_castle>O-O|0-0)/g;
const variation_regex = /\([^\)]+\)/g;
const annotation_regex = /\{[^\}]+\}/g;

export const parsePGN = (pgn: string): FullBoardPieces[] => {
  const variant_match = pgn.match(variant_regex);
  const setup_match = pgn.match(setup_regex);
  let BoardType: typeof Board;
  if (variant_match) {
    const variant = variant_match.groups!.variant;
    switch (variant) {
      case "Atomic":
      case "Atomic960":
        BoardType = AtomicBoard;
        break;
      case "Chess960":
        if (!setup_match?.groups?.fen) {
          throw new Error("missing FEN for Chess960 game");
        }
      case "Three-check":
      case "Antichess":
        BoardType = Board;
        break;
      default:
        throw new Error(`variant not supported: ${variant}`);
    }
  } else {
    BoardType = Board;
  }
  const board = new BoardType(
    setup_match?.groups?.fen ? parseFEN(setup_match.groups.fen) : undefined
  );
  const start_idx = /^1\./m.exec(pgn)?.index ?? 0;

  let moves_list = pgn.slice(start_idx);
  moves_list = moves_list
    .replaceAll(variation_regex, "")
    .replaceAll(annotation_regex, "");

  const matches = moves_list.matchAll(algebraic_regex);
  const parsed_moves: Record<number, ParsedMove> = {};
  const moves: Move[] = [];

  for (const match of matches) {
    const player = moves.length % 2 === 0 ? Player.White : Player.Black;
    const groups = match.groups!;
    let move: Move;
    if (!groups.kingside_castle && !groups.queenside_castle) {
      const parsed_move: ParsedMove = {
        player,
        piece: alias_to_canonical_map[groups.piece as PieceAlias],
        capture: !!groups.capture,
        to_file: groups.to_file as File,
        to_rank: groups.to_rank as Rank,
        raw: match[0],
      };
      if (groups.from_file) {
        parsed_move.from_file = groups.from_file as File;
      }
      if (groups.from_rank) {
        parsed_move.from_rank = groups.from_rank as Rank;
      }
      if (groups.promotion) {
        parsed_move.promotion = groups.promotion[1] as PromotionPiece;
      }
      parsed_moves[moves.length] = parsed_move;
      const from = board.findPieceForMove(parsed_move);
      if (!from) {
        const new_board = new BoardType(
          setup_match?.groups?.fen
            ? parseFEN(setup_match.groups.fen)
            : undefined
        );
        const positions = [
          { ply: -1, pieces: new_board.toFullBoardPieces() },
        ].concat(
          moves.map((move, ply) => {
            new_board.doMove(move);
            return {
              ply,
              move,
              parsed_move: parsed_moves[ply],
              pieces: new_board.toFullBoardPieces(),
            };
          })
        );
        fs.writeFileSync(
          "error.json",
          JSON.stringify({ positions, pgn }, undefined, 2),
          { flag: "a" }
        );
        throw new TypeError(
          `failed to resolve piece for move ${
            Math.floor(moves.length / 2) + 1
          }.${moves.length % 2 === 1 ? " ..." : ""} ${match[0]}`
        );
      }
      const to: Square = `${parsed_move.to_file}${parsed_move.to_rank}`;
      move = {
        player: parsed_move.player,
        from,
        to,
        raw: match[0],
      };
      if (groups.capture) {
        move.capture = move.to;
      }
      move = board.fixCaptureForEnPassant(move);
      if (parsed_move.promotion) {
        move.promotion = parsed_move.promotion;
      }
    } else {
      move = {
        player,
        from: board.getKingPosition(player),
        to: `${groups.kingside_castle ? "g" : "b"}${
          player === Player.White ? 1 : 8
        }`,
        raw: match[0],
      };
    }
    board.doMove(move);
    moves.push(move);
  }

  const new_board = new BoardType(
    setup_match?.groups?.fen ? parseFEN(setup_match.groups.fen) : undefined
  );
  return [new_board.toFullBoardPieces()].concat(
    moves.map((move) => {
      new_board.doMove(move);
      return new_board.toFullBoardPieces();
    })
  );
};
