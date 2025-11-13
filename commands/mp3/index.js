const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

const processingUsers = new Set();

module.exports = {
  name: "mp3",
  description: "Download a YouTube video as MP3 and separate vocals with DemIt",
  permissions: "everyone",
  alias: ["m"],
  execute: async (ctx) => {
    const url = ctx.message.text.split(" ")[1];
    if (!url) return ctx.reply("❌ Please provide a YouTube URL.");

    if (processingUsers.has(ctx.from.id)) {
      return ctx.reply("⏳ Your previous audio is still being processed, please wait.");
    }

    processingUsers.add(ctx.from.id);

    const baseDir = process.cwd();
    const outputDir = path.join(baseDir, "output");
    const separatedDir = path.join(baseDir, "separated", "htdemucs");

    // Nettoyer les anciens fichiers
    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
    if (fs.existsSync(separatedDir)) fs.rmSync(separatedDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });

    await ctx.reply("⏳ Downloading and processing your audio...");

    try {
      // === Lancer DemIt et attendre la fin ===
      await execAsync(`demit "${url}"`, { cwd: baseDir });

      // === Attendre brièvement pour être sûr que tous les fichiers sont écrits ===
      await new Promise(r => setTimeout(r, 1000));

      // === Envoi du MP3 original ===
      const mp3Files = fs.readdirSync(outputDir).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!mp3Files.length) return ctx.reply("❌ No MP3 found.");
      const originalMP3 = path.join(outputDir, mp3Files[0]);
      await ctx.reply(`🎵 Here's your original MP3:`);
      await ctx.replyWithDocument({ source: originalMP3, filename: mp3Files[0] });

      // === Envoi des stems séparés ===
      if (!fs.existsSync(separatedDir)) return ctx.reply("❌ No stems found.");
      const stemTracks = fs.readdirSync(separatedDir).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!stemTracks.length) return ctx.reply("❌ No stems found.");

      await ctx.reply(`🎧 Separation complete! Sending stems...`);
      for (const file of stemTracks) {
        const filePath = path.join(separatedDir, file);
        await ctx.replyWithDocument({ source: filePath, filename: file });
      }
    } catch (err) {
      console.error(err);
      return ctx.reply("❌ Error processing the audio.");
    } finally {
      processingUsers.delete(ctx.from.id);
    }
  }
};
