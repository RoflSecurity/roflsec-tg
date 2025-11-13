const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

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

    await ctx.reply("⏳ Processing your audio with DemIt...");

    // Nom unique pour ce traitement
    const runId = Date.now().toString();
    const tempOutput = path.join(outputDir, `demit_${runId}`);
    fs.mkdirSync(tempOutput, { recursive: true });

    exec(`demit "${url}"`, { cwd: baseDir }, async (err) => {
      if (err) {
        console.error(err);
        return ctx.reply("❌ Error processing the audio.");
      }

      // Laisse à yt-dlp/ffmpeg le temps d’écrire le fichier
      await new Promise(r => setTimeout(r, 1500));

      // === Récupération du MP3 le plus récent ===
      const allMp3 = fs.readdirSync(outputDir)
        .filter(f => f.endsWith(".mp3"))
        .map(f => ({
          name: f,
          path: path.join(outputDir, f),
          time: fs.statSync(path.join(outputDir, f)).mtimeMs
        }))
        .sort((a, b) => b.time - a.time);

      if (!allMp3.length) {
        console.error("❌ No MP3 found.");
        return ctx.reply("❌ No MP3 found.");
      }

      const newestMP3 = allMp3[0];
      console.log("🎵 Latest MP3:", newestMP3.name);
      await ctx.reply(`🎵 Here's your original MP3:`);
      try {
        await ctx.replyWithDocument({ source: newestMP3.path, filename: newestMP3.name });
      } catch (e) {
        console.error("Failed to send MP3:", e);
      }

      // === Récupération du dossier htdemucs le plus récent ===
      const htdemucsDir = path.join(separatedDir, "htdemucs");
      if (!fs.existsSync(htdemucsDir)) return ctx.reply("❌ No stems found.");

      const subDirs = fs.readdirSync(htdemucsDir)
        .map(f => ({
          name: f,
          path: path.join(htdemucsDir, f),
          time: fs.statSync(path.join(htdemucsDir, f)).mtimeMs
        }))
        .filter(d => fs.statSync(d.path).isDirectory())
        .sort((a, b) => b.time - a.time);

      if (!subDirs.length) return ctx.reply("❌ No stems folder found.");

      const latestStemDir = subDirs[0].path;
      const stems = fs.readdirSync(latestStemDir).filter(f => f.endsWith(".mp3"));
      if (!stems.length) return ctx.reply("❌ No stems found.");

      await ctx.reply("🎧 Separation complete! Sending stems...");
      for (const file of stems) {
        try {
          await ctx.replyWithDocument({ source: path.join(latestStemDir, file), filename: file });
        } catch (e) {
          console.error(`Failed to send ${file}:`, e);
        }
      }
    });
  }
};
