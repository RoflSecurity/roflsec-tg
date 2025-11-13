const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function sanitizeFilename(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  name: "mp3",
  description: "Download a YouTube video as MP3 and separate vocals with DemIt",
  permissions: "everyone",
  alias: ["m"],
  execute: async (ctx) => {
    const url = ctx.message.text.split(" ")[1];
    if (!url) return ctx.reply("❌ Please provide a YouTube URL.");

    const baseDir = process.cwd();
    const outputDir = path.join(baseDir, "output");
    const separatedDir = path.join(baseDir, "separated");

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    if (!fs.existsSync(separatedDir)) fs.mkdirSync(separatedDir, { recursive: true });

    await ctx.reply("⏳ Downloading and processing your audio...");

    const tempFolderName = `demit_${Date.now()}`;
    const tempOutput = path.join(outputDir, tempFolderName);
    const tempSeparated = path.join(separatedDir, tempFolderName);
    fs.mkdirSync(tempOutput, { recursive: true });
    fs.mkdirSync(tempSeparated, { recursive: true });

    // Télécharger le MP3
    exec(`yt-dlp -x --audio-format mp3 "${url}" -o "${tempOutput}/%(title)s.%(ext)s"`, async (err) => {
      if (err) {
        console.error(err);
        return ctx.reply("❌ Error downloading the MP3.");
      }

      let mp3Files = fs.readdirSync(tempOutput).filter(f => f.endsWith(".mp3"));
      if (!mp3Files.length) return ctx.reply("❌ No MP3 found after download.");

      const safeName = sanitizeFilename(mp3Files[0]);
      const originalMP3 = path.join(tempOutput, safeName);
      fs.renameSync(path.join(tempOutput, mp3Files[0]), originalMP3);

      // Envoyer le MP3 original immédiatement
      await ctx.reply(`🎵 Here's your original MP3:`);
      try {
        await ctx.replyWithDocument({ source: originalMP3, filename: safeName });
      } catch (e) {
        console.error("Failed to send original MP3:", e);
      }

      // Séparer les stems en arrière-plan
      const demucsCmd = `~/demucs-venv/bin/demucs --two-stems vocals -d cpu --mp3 -o "${tempSeparated}" "${originalMP3}"`;
      exec(demucsCmd, async (err) => {
        if (err) {
          console.error(err);
          return ctx.reply("❌ Error separating stems.");
        }

        const htdemucsDir = path.join(tempSeparated, "htdemucs");
        if (!fs.existsSync(htdemucsDir)) return ctx.reply("❌ No stems found.");

        const stemTracks = fs.readdirSync(htdemucsDir).filter(f => f.endsWith(".mp3"));
        if (!stemTracks.length) return ctx.reply("❌ No stems found.");

        await ctx.reply(`🎧 Separation complete! Sending stems...`);
        for (const file of stemTracks) {
          const filePath = path.join(htdemucsDir, file);
          try {
            await ctx.replyWithDocument({ source: filePath, filename: file });
          } catch (e) {
            console.error(`Failed to send ${file}:`, e);
          }
        }

        // Nettoyage
        fs.rmSync(tempOutput, { recursive: true, force: true });
        fs.rmSync(tempSeparated, { recursive: true, force: true });
      });
    });
  }
};
