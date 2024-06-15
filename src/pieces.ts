import { PieceAlias, Piece } from "./types";

const unicode_aliases = {
  K: ["♔", "♚"],
  Q: ["♕", "♛"],
  R: ["♖", "♜"],
  B: ["♗", "♝"],
  N: ["♘", "♞"],
  "": ["♙", "♟"],
};

export const alias_to_canonical_map = Object.entries(unicode_aliases)
  .flatMap(([ascii, unicode]) => [
    { [unicode[0]]: ascii },
    { [unicode[1]]: ascii },
    { [ascii]: ascii },
  ])
  .reduce((o, x) => ({ ...o, ...x }), {}) as Record<PieceAlias, Piece>;
