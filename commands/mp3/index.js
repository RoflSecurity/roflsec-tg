/*
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
    if (!fs.existsSync(separatedDir)) fs.mkdirSync(separatedDir, { recursive: true });

    await ctx.reply("⏳ Downloading and processing your audio with DemIt...");

    exec(`demit "${url}"`, { cwd: baseDir }, async (err, stdout, stderr) => {
      if (err) {
        console.error("DemIt error:", err);
        return ctx.reply("❌ Error processing the audio.");
      }

      // === Envoi du MP3 original ===
      const mp3Files = fs.readdirSync(outputDir).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!mp3Files.length) return ctx.reply("❌ No MP3 found.");
      const originalMP3 = path.join(outputDir, mp3Files[0]);
      await ctx.reply(`🎵 Here's your original MP3:`);
      try {
        await ctx.replyWithDocument({ source: originalMP3, filename: mp3Files[0] });
      } catch (e) {
        console.error("Failed to send original MP3:", e);
      }

      // === Envoi des stems séparés ===
      const stemFolders = fs.readdirSync(separatedDir).filter(f =>
        fs.statSync(path.join(separatedDir, f)).isDirectory()
      );
      if (!stemFolders.length) return ctx.reply("❌ No stems found.");

      // On prend uniquement le premier dossier (dernier traitement)
      const stemFolderPath = path.join(separatedDir, stemFolders[0]);
      const stemFiles = fs.readdirSync(stemFolderPath).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!stemFiles.length) return ctx.reply("❌ No stems found.");

      await ctx.reply("🎧 Separation complete! Sending stems...");
      for (const file of stemFiles) {
        const filePath = path.join(stemFolderPath, file);
        try {
          await ctx.replyWithDocument({ source: filePath, filename: file });
        } catch (e) {
          console.error(`Failed to send ${file}:`, e);
        }
      }

      // === Nettoyage ===
      try {
        fs.rmSync(path.join(outputDir, mp3Files[0]), { force: true });
        // On ne supprime pas les stems au cas où tu veux garder un historique
		fs.rmSync(path.join(separatedDir), { recursive: true, force: true });

      } catch (e) {
        console.error("Failed to clean output:", e);
      }
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
    if (!fs.existsSync(separatedDir)) fs.mkdirSync(separatedDir, { recursive: true });

    await ctx.reply("⏳ Downloading and processing your audio with DemIt...");

    // Dossier temporaire unique pour ce traitement
    const tempFolderName = `demit_${Date.now()}`;
    const tempSeparated = path.join(separatedDir, tempFolderName);
    fs.mkdirSync(tempSeparated, { recursive: true });

    exec(`demit "${url}"`, { cwd: baseDir }, async (err, stdout, stderr) => {
      if (err) {
        console.error("DemIt error:", err);
        return ctx.reply("❌ Error processing the audio.");
      }

      // === Envoi du MP3 original ===
      const mp3Files = fs.readdirSync(outputDir).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!mp3Files.length) return ctx.reply("❌ No MP3 found.");
      const originalMP3 = path.join(outputDir, mp3Files[0]);
      await ctx.reply(`🎵 Here's your original MP3:`);
      try {
        await ctx.replyWithDocument({ source: originalMP3, filename: mp3Files[0] });
      } catch (e) {
        console.error("Failed to send original MP3:", e);
      }

      // === Envoi des stems séparés ===
      const stemFolders = fs.readdirSync(separatedDir)
        .filter(f => fs.statSync(path.join(separatedDir, f)).isDirectory());

      // On prend uniquement le dossier de ce traitement
      const stemFolderPath = path.join(separatedDir, stemFolders[stemFolders.length - 1]);
      const stemFiles = fs.readdirSync(stemFolderPath).filter(f => f.toLowerCase().endsWith(".mp3"));
      if (!stemFiles.length) return ctx.reply("❌ No stems found.");

      await ctx.reply("🎧 Separation complete! Sending stems...");
      for (const file of stemFiles) {
        const filePath = path.join(stemFolderPath, file);
        try {
          await ctx.replyWithDocument({ source: filePath, filename: file });
        } catch (e) {
          console.error(`Failed to send ${file}:`, e);
        }
      }

      // === Nettoyage ===
      try {
        fs.rmSync(originalMP3, { force: true });
        fs.rmSync(stemFolderPath, { recursive: true, force: true });
      } catch (e) {
        console.error("Failed to clean output:", e);
      }
    });
  }
};
