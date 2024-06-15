import { Canvas } from "canvas";
import { FullBoardPieces, Piece, Square } from "./types";

const squareToPixels = (square: Square): { x: number; y: number } => ({
  x: (square.charCodeAt(0) - "a".charCodeAt(0)) * 50,
  y: (8 - +square[1]) * 50,
});

const white_pieces = { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙" };
const black_pieces = { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" };

export const renderPositionToPNG = (
  position: FullBoardPieces,
  flip?: boolean
): Buffer => {
  const patternCanvas = new Canvas(100, 100, "image");
  const patternContext = patternCanvas.getContext("2d");
  patternContext.fillStyle = "#ffce9e";
  patternContext.fillRect(0, 0, 50, 50);
  patternContext.fillRect(50, 50, 50, 50);
  patternContext.fillStyle = "#d18b47";
  patternContext.fillRect(0, 50, 50, 50);
  patternContext.fillRect(50, 0, 50, 50);

  const canvas = new Canvas(400, 400, "image");
  const ctx = canvas.getContext("2d");
  const pattern = ctx.createPattern(patternCanvas, "repeat");
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = "black";
  ctx.textBaseline = "top";
  ctx.font = "50px FreeSerif";

  (Object.entries(position.white) as [Square, Piece][])
    .filter(([_, p]) => p !== undefined)
    .forEach(([square, piece]) => {
      const pos = squareToPixels(square);
      if (flip) {
        pos.x = 350 - pos.x;
        pos.y = 350 - pos.y;
      }
      const glyph = white_pieces[piece || "P"];
      ctx.fillText(glyph, pos.x + 5, pos.y);
    });
  (Object.entries(position.black) as [Square, Piece][])
    .filter(([_, p]) => p !== undefined)
    .forEach(([square, piece]) => {
      const pos = squareToPixels(square);
      if (flip) {
        pos.x = 350 - pos.x;
        pos.y = 350 - pos.y;
      }
      const glyph = black_pieces[piece || "P"];
      ctx.fillText(glyph, pos.x + 5, pos.y);
    });

  return canvas.toBuffer("image/png", {
    palette: new Uint8ClampedArray([
      0xff, 0xce, 0x9e, 0x00, 0xd1, 0x8b, 0x47, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]),
  });
};

export const renderPositionToSVG = (position: FullBoardPieces): string => {
  return `
  <svg version="1.1" width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: FreeSerif; }
  </style>
  <defs>
    <pattern id="board_bg" x="0" y="0" width=".25" height=".25">
      <rect x="0" y="0" width="100" height="100" fill="#ffce9e"/>
      <rect x="100" y="0" width="100" height="100" fill="#d18b47"/>
      <rect x="0" y="100" width="100" height="100" fill="#d18b47"/>
      <rect x="100" y="100" width="100" height="100" fill="#ffce9e"/>
    </pattern>
    <text id="wk" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♔</text>
    <text id="bk" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♚</text>
    <text id="wq" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♕</text>
    <text id="bq" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♛</text>
    <text id="wr" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♖</text>
    <text id="br" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♜</text>
    <text id="wb" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♗</text>
    <text id="bb" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♝</text>
    <text id="wn" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♘</text>
    <text id="bn" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♞</text>
    <text id="wp" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♙</text>
    <text id="bp" width="100" height="100" x="0.25%" y="2%" transform="scale(5)">♟</text>
  </defs>

  <rect fill="url(#board_bg)" width="800" height="800"/>
  ${(Object.entries(position.white) as [Square, Piece][])
    .filter(([s, p]) => p !== undefined)
    .map(([square, piece]) => {
      const pos = squareToPixels(square);
      return `<use href="#w${piece.toLocaleLowerCase() || "p"}" x="${
        pos.x
      }" y="${pos.y}" />`;
    })
    .join("\n")}
  ${(Object.entries(position.black) as [Square, Piece][])
    .filter(([s, p]) => p !== undefined)
    .map(([square, piece]) => {
      const pos = squareToPixels(square);
      return `<use href="#b${piece.toLocaleLowerCase() || "p"}" x="${
        pos.x
      }" y="${pos.y}" />`;
    })
    .join("\n")}
</svg>

`;
};
