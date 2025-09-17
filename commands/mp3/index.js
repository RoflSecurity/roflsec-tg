const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: "mp3",
  description: "Download a YouTube video as MP3",
  permissions: "everyone",
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
