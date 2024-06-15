import { parsePGN } from "./src/parse";
import { renderPositionToPNG } from "./src/render";
import fs from "fs/promises";
import crypto from "crypto";
import { promisify } from "util";
import { exec } from "child_process";

const exec_promise = promisify(exec);

export const renderPGNToGif = async (pgn: string, flip?: boolean) => {
  const hash = crypto.createHash("md5").update(pgn).digest().toString("hex");
  const dirname = `render-${hash}`;
  try {
    await fs.rmdir(dirname, { recursive: true });
  } catch {}
  await fs.mkdir(dirname, { recursive: true });
  const positions = parsePGN(pgn);
  for (const [idx, position] of positions.entries()) {
    console.log(`rendering frame ${idx + 1}/${positions.length}`);
    const png = renderPositionToPNG(position, flip);
    const filename = `frame${idx.toString().padStart(3, "0")}`;
    await fs.writeFile(`${dirname}/${filename}.png`, png);
  }
  await exec_promise(
    `ffmpeg -y -framerate 2 -pattern_type glob -i '${dirname}/*.png' -filter_complex "fps=15,split[v1][v2]; [v1]palettegen=stats_mode=full [palette]; [v2][palette]paletteuse=dither=sierra2_4a" -final_delay 200 ${dirname}/game.gif`
  );
  return dirname;
};
