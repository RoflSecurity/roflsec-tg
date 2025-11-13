const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

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

    const tempFolder = `demit_${Date.now()}`;
    const tempOutput = path.join(outputDir, tempFolder);
    fs.mkdirSync(tempOutput, { recursive: true });

    try {
      // Lance DemIt uniquement pour ce dossier temporaire
      await execAsync(`demit "${url}" -o "${tempOutput}"`, { cwd: baseDir });

      // === MP3 original ===
      const mp3Files = fs.readdirSync(tempOutput).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!mp3Files.length) return ctx.reply("❌ No MP3 found.");
      const originalMP3 = path.join(tempOutput, mp3Files[0]);
      await ctx.reply("🎵 Here's your original MP3:");
      try {
        await ctx.replyWithDocument({ source: originalMP3, filename: mp3Files[0] });
      } catch (e) {
        console.error("Failed to send original MP3:", e);
      }

      // === Stems séparés ===
      const htdemucsDir = path.join(separatedDir, tempFolder, "htdemucs");
      if (!fs.existsSync(htdemucsDir)) return ctx.reply("❌ No stems found.");

      const stemTracks = fs.readdirSync(htdemucsDir).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!stemTracks.length) return ctx.reply("❌ No stems found.");

      await ctx.reply("🎧 Separation complete! Sending stems...");
      for (const file of stemTracks) {
        const filePath = path.join(htdemucsDir, file);
        try {
          await ctx.replyWithDocument({ source: filePath, filename: file });
        } catch (e) {
          console.error(`Failed to send ${file}:`, e);
        }
      }

    } catch (err) {
      console.error("❌ Error processing audio:", err);
      return ctx.reply("❌ An error occurred while processing your audio.");
    } finally {
      // Nettoyage complet
      fs.rmSync(tempOutput, { recursive: true, force: true });
      fs.rmSync(path.join(separatedDir, tempFolder), { recursive: true, force: true });
    }
  }
};
