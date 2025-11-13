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
    const separatedDir = path.join(baseDir, "separated", "htdemucs");
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(separatedDir, { recursive: true });

    await ctx.reply("⏳ Downloading and processing your audio...");

    try {
      // Lancer DemIt et attendre que ce soit fini
      await execAsync(`demit "${url}"`, { cwd: baseDir });

      // --- Envoi du MP3 original ---
      const mp3Files = fs.readdirSync(outputDir).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!mp3Files.length) return ctx.reply("❌ No MP3 found in output/.");
      const originalMP3 = path.join(outputDir, mp3Files[0]);
      await ctx.reply("🎵 Here's your original MP3:");
      await ctx.replyWithDocument({ source: originalMP3, filename: mp3Files[0] });

      // --- Envoi des stems ---
      const stemFiles = fs.readdirSync(separatedDir).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!stemFiles.length) return ctx.reply("❌ No stems found in separated/htdemucs/.");
      await ctx.reply("🎧 Separation complete! Sending stems...");
      for (const file of stemFiles) {
        await ctx.replyWithDocument({ source: path.join(separatedDir, file), filename: file });
      }
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Error processing the audio.");
    }
  }
};
