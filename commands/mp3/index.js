const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function execAsync(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve({ stdout, stderr });
    });
  });
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

    await ctx.reply("⏳ Downloading and processing your audio...");

    const tempFolder = `demit_${Date.now()}`;
    const tempOutput = path.join(outputDir, tempFolder);
    fs.mkdirSync(tempOutput, { recursive: true });

    try {
      // Lancer DemIt pour télécharger et séparer l'audio
      await execAsync(`demit "${url}" -o "${tempOutput}"`, { cwd: baseDir });
    } catch (err) {
      console.error(err);
      return ctx.reply("❌ Error processing audio.");
    }

    // Envoi du MP3 original
    const mp3Files = fs.readdirSync(tempOutput).filter(f => f.endsWith(".mp3"));
    if (!mp3Files.length) return ctx.reply("❌ No MP3 found.");
    const originalMP3 = path.join(tempOutput, mp3Files[0]);
    await ctx.reply(`🎵 Here's your original MP3:`);
    try {
      await ctx.replyWithDocument({ source: originalMP3, filename: mp3Files[0] });
    } catch (e) {
      console.error("Failed to send original MP3:", e);
    }

    // Envoi des stems séparés
    const stemsDir = path.join(separatedDir, tempFolder, "htdemucs");
    if (!fs.existsSync(stemsDir)) return ctx.reply("❌ No stems found.");

    const stems = fs.readdirSync(stemsDir).filter(f => f.endsWith(".mp3"));
    if (!stems.length) return ctx.reply("❌ No stems found.");

    await ctx.reply(`🎧 Separation complete! Sending stems...`);
    for (const stem of stems) {
      const filePath = path.join(stemsDir, stem);
      try {
        await ctx.replyWithDocument({ source: filePath, filename: stem });
      } catch (e) {
        console.error(`Failed to send ${stem}:`, e);
      }
    }

    // Nettoyage des dossiers temporaires
    fs.rmSync(tempOutput, { recursive: true, force: true });
    fs.rmSync(path.join(separatedDir, tempFolder), { recursive: true, force: true });
  }
};
