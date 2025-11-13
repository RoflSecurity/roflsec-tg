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
    const separatedDir = path.join(baseDir, "separated", "htdemucs");

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    await ctx.reply("⏳ Processing your audio with DemIt...");

    exec(`demit "${url}"`, { cwd: baseDir }, async (error) => {
      if (error) {
        console.error(error);
        return ctx.reply("❌ An error occurred while processing your request.");
      }

      // --- récupérer le MP3 original généré ---
      const mp3Files = fs.readdirSync(outputDir).filter(f => f.endsWith(".mp3"));
      if (!mp3Files.length) return ctx.reply("❌ No MP3 file found in output.");
      
      // On prend le dernier MP3 modifié (le plus récent)
      const latestMP3 = mp3Files
        .map(name => ({ name, time: fs.statSync(path.join(outputDir, name)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time)[0];
      const originalMP3Path = path.join(outputDir, latestMP3.name);

      await ctx.reply("🎵 Here's your original MP3:");
      try {
        await ctx.replyWithDocument({ source: originalMP3Path, filename: latestMP3.name });
      } catch (err) {
        console.error("Failed to send original MP3:", err);
      }

      // --- récupérer le dossier séparé le plus récent ---
      if (!fs.existsSync(separatedDir))
        return ctx.reply("❌ No separated tracks found (DemIt output missing).");

      const trackDirs = fs.readdirSync(separatedDir)
        .map(name => ({ name, time: fs.statSync(path.join(separatedDir, name)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (!trackDirs.length) return ctx.reply("❌ No separated track folder found.");

      const latestTrackDir = path.join(separatedDir, trackDirs[0].name);
      const separatedMP3s = fs.readdirSync(latestTrackDir).filter(f => f.endsWith(".mp3"));
      if (!separatedMP3s.length) return ctx.reply("❌ No separated MP3 files found.");

      await ctx.reply(`🎧 Separation complete for **${trackDirs[0].name}**! Sending stems...`);

      for (const file of separatedMP3s) {
        const filePath = path.join(latestTrackDir, file);
        try {
          await ctx.replyWithDocument({ source: filePath, filename: file });
        } catch (err) {
          console.error(`Failed to send ${file}:`, err);
        }
      }

      // --- nettoyage ---
      fs.rmSync(latestTrackDir, { recursive: true, force: true });
    });
  }
};
