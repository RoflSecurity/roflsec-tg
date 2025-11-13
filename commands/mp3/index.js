const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

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

    // Spawn demit as a child process
    const demitProcess = spawn("demit", [url], { cwd: baseDir, stdio: "inherit" });

    demitProcess.on("error", (err) => {
      console.error("Failed to start DemIt:", err);
      ctx.reply("❌ Could not start DemIt.");
    });

    demitProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("DemIt exited with code", code);
        return ctx.reply("❌ DemIt failed to process the audio.");
      }

      // At this point, all files should be fully generated
      const mp3Files = fs.readdirSync(outputDir).filter(f => f.endsWith(".mp3"));
      if (!mp3Files.length) return ctx.reply("❌ No MP3 file found in output.");

      const latestMP3 = path.join(outputDir, mp3Files[mp3Files.length - 1]);
      await ctx.reply(`🎵 Here's your original MP3:`);
      try {
        await ctx.replyWithDocument({ source: latestMP3, filename: path.basename(latestMP3) });
      } catch (err) {
        console.error("Failed to send original MP3:", err);
      }

      if (!fs.existsSync(separatedDir)) return ctx.reply("❌ No separated tracks found (DemIt output missing).");

      const tracks = fs.readdirSync(separatedDir)
        .map(name => ({ name, time: fs.statSync(path.join(separatedDir, name)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (!tracks.length) return ctx.reply("❌ No separated track folder found.");

      const latestTrackDir = path.join(separatedDir, tracks[0].name);
      const separatedMP3s = fs.readdirSync(latestTrackDir).filter(f => f.endsWith(".mp3"));

      if (!separatedMP3s.length) return ctx.reply("❌ No separated MP3 files found.");

      await ctx.reply(`🎧 Separation complete for **${tracks[0].name}**! Sending stems...`);

      for (const file of separatedMP3s) {
        const filePath = path.join(latestTrackDir, file);
        try {
          await ctx.replyWithDocument({ source: filePath, filename: file });
        } catch (err) {
          console.error(`Failed to send ${file}:`, err);
        }
      }

      // Clean up
      fs.rmSync(latestTrackDir, { recursive: true, force: true });
    });
  }
};
