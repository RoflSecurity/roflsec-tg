/*
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: "mp3",
  description: "Download a YouTube video as MP3",
  permissions: "everyone",
  alias: ["m"],
  execute: async (ctx) => {
    const url = ctx.message.text.split(" ")[1];
    if (!url) return ctx.reply("❌ Please provide a YouTube URL.");

    // Output à la racine du projet
    const outputBase = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputBase)) fs.mkdirSync(outputBase, { recursive: true });

    await ctx.reply("⏳ Please wait, your MP3 is being processed...");

    exec(`splitit "${url}"`, { cwd: process.cwd() }, async (error) => {
      if (error) {
        console.error(error);
        return ctx.reply("❌ An error occurred while processing your request.");
      }

      // Récupérer le dernier dossier créé par Splitit
      const folders = fs.readdirSync(outputBase)
        .map(name => ({ name, time: fs.statSync(path.join(outputBase, name)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (!folders.length) return ctx.reply("❌ No MP3 file was generated.");

      const latestFolder = path.join(outputBase, folders[0].name);
      const files = fs.readdirSync(latestFolder).filter(f => f.endsWith(".mp3"));
      if (!files.length) return ctx.reply("❌ No MP3 file was generated.");

      const mp3Path = path.join(latestFolder, files[0]);

      try {
        await ctx.replyWithDocument({ source: mp3Path, filename: files[0] });
      } catch (err) {
        console.error(err);
        await ctx.reply("❌ Failed to send the MP3 file.");
      }

      // Nettoyer le dossier temporaire
      fs.rmSync(latestFolder, { recursive: true, force: true });
    });
  }
};
*/
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

    await ctx.reply("⏳ Please wait, processing your audio with DemIt...");

    exec(`demit "${url}"`, { cwd: baseDir }, async (error) => {
      if (error) {
        console.error(error);
        return ctx.reply("❌ An error occurred while processing your request.");
      }

      if (!fs.existsSync(separatedDir))
        return ctx.reply("❌ No separated tracks found (DemIt output missing).");

      const tracks = fs.readdirSync(separatedDir)
        .map(name => ({ name, time: fs.statSync(path.join(separatedDir, name)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (!tracks.length) return ctx.reply("❌ No MP3 track folder found.");

      const latestTrackDir = path.join(separatedDir, tracks[0].name);
      const mp3Files = fs.readdirSync(latestTrackDir).filter(f => f.endsWith(".mp3"));

      if (!mp3Files.length) return ctx.reply("❌ No separated MP3 files found.");

      await ctx.reply(`🎧 Separation complete for **${tracks[0].name}**! Sending files...`);

      for (const file of mp3Files) {
        const filePath = path.join(latestTrackDir, file);
        try {
          await ctx.replyWithDocument({ source: filePath, filename: file });
        } catch (err) {
          console.error(`Failed to send ${file}:`, err);
        }
      }

      fs.rmSync(latestTrackDir, { recursive: true, force: true });
    });
  }
};
