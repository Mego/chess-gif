import { PartialRecord, Square, File } from "./types";

export const filter_map = <K extends string | number | symbol, V>(
  map: PartialRecord<K, V>,
  pred: (k: K, v: V) => boolean
): PartialRecord<K, V> =>
  (Object.entries(map) as [K, V][])
    .filter(([k, v]) => pred(k, v))
    .reduce((o, [k, v]) => ({ ...o, [k]: v }), {} as Record<K, V>);

export const map_length = <K extends string | number | symbol, V>(
  map: PartialRecord<K, V>
) => Object.keys(map).length;

export const xor = (a: boolean, b: boolean) => a !== b;

export const addFile = (file: File, dist: number): File => {
  const dst = file.charCodeAt(0) + dist;
  if (dst < "a".charCodeAt(0) || dst > "h".charCodeAt(0)) {
    throw new RangeError(`destination out of bounds: ${file} ${dist}`);
  }
  return String.fromCharCode(dst) as File;
};

export const boardDistance = (
  from: Square,
  to: Square
): { x: number; y: number } => {
  const from_file = from.charCodeAt(0) - "a".charCodeAt(0);
  const from_rank = +from[1];
  const to_file = to.charCodeAt(0) - "a".charCodeAt(0);
  const to_rank = +to[1];
  return {
    x: Math.abs(to_file - from_file),
    y: Math.abs(to_rank - from_rank),
  };
};

export const isKnightMove = (from: Square, to: Square): boolean => {
  const dist = boardDistance(from, to);
  return (dist.x === 1 && dist.y === 2) || (dist.x === 2 && dist.y === 1);
};

export const isBishopMove = (from: Square, to: Square): boolean => {
  const dist = boardDistance(from, to);
  return dist.x === dist.y && dist.x > 0;
};

export const isRookMove = (from: Square, to: Square): boolean => {
  const dist = boardDistance(from, to);
  return xor(dist.x === 0, dist.y === 0);
};

export const isKingMove = (from: Square, to: Square): boolean => {
  const dist = boardDistance(from, to);
  return (
    Math.max(dist.x, dist.y) === 1 ||
    ((dist.x === 2 || dist.x === 3) && dist.y === 0)
  );
};

export const squaresBetween = (from: Square, to: Square): Square[] => {
  if (!isBishopMove(from, to) && !isRookMove(from, to)) {
    return [];
  }
  const dist = boardDistance(from, to);

  const direction = {
    x: Math.sign(to[0].localeCompare(from[0])),
    y: Math.sign(to[1].localeCompare(from[1])),
  };
  let next_square = `${addFile(from[0] as File, direction.x)}${
    +from[1] + direction.y
  }` as Square;
  const between_squares: Square[] = [];
  while (next_square !== to) {
    between_squares.push(next_square);
    next_square = `${addFile(next_square[0] as File, direction.x)}${
      +next_square[1] + direction.y
    }` as Square;
  }
  return between_squares;
};

export const adjacentSquares = (square: Square): Square[] => {
  let result: Square[] = [];
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      if (+square[1] + dy < 1 || +square[1] + dy > 8) {
        continue;
      }
      try {
        result.push(
          `${addFile(square[0] as File, dx)}${+square[1] + dy}` as Square
        );
      } catch {}
    }
  }
  return result;
};
