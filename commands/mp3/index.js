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

		const tempFolderName = `demit_${Date.now()}`;
		const tempOutput = path.join(outputDir, tempFolderName);
		fs.mkdirSync(tempOutput, { recursive: true });
		exec(`demit "${url}" -o "${tempOutput}"`, { cwd: baseDir }, async (err) => {
			if (err) {
				console.error(err);
				return ctx.reply("❌ Error processing the audio.");
			}

			await new Promise(r => setTimeout(r, 1500));

			// Chercher le MP3 dans tous les sous-dossiers possibles
			const allDirs = [tempOutput, outputDir];
			let mp3Files = [];
			for (const dir of allDirs) {
				if (fs.existsSync(dir)) {
					const found = fs.readdirSync(dir).filter(f => f.endsWith(".mp3"));
					if (found.length) {
						mp3Files = found.map(f => path.join(dir, f));
						break;
					}
				}
			}

			if (!mp3Files.length) {
				console.error("❌ No MP3 found in any output directory.");
				console.error("🪶 Checked:", allDirs);
				console.error("🪶 Files in output:", fs.readdirSync(outputDir));
				return ctx.reply("❌ No MP3 found.");
			}

			const originalMP3 = mp3Files[0];
			await ctx.reply("🎵 Here's your original MP3:");
			try {
				await ctx.replyWithDocument({ source: originalMP3, filename: path.basename(originalMP3) });
			} catch (e) {
				console.error("Failed to send original MP3:", e);
			}

			// === Recherche automatique des stems ===
			const demucsBase = path.join(separatedDir, "htdemucs");
			if (!fs.existsSync(demucsBase)) return ctx.reply("❌ No stems found.");

			const folders = fs.readdirSync(demucsBase).filter(f => fs.statSync(path.join(demucsBase, f)).isDirectory());
			if (!folders.length) return ctx.reply("❌ No stems folder found.");

			const lastFolder = path.join(demucsBase, folders.sort((a, b) => fs.statSync(path.join(demucsBase, b)).mtimeMs - fs.statSync(path.join(demucsBase, a)).mtimeMs)[0]);
			const stems = fs.readdirSync(lastFolder).filter(f => f.endsWith(".mp3"));
			if (!stems.length) return ctx.reply("❌ No stems found in last Demucs output.");

			await ctx.reply("🎧 Separation complete! Sending stems...");
			for (const file of stems) {
				try {
					await ctx.replyWithDocument({ source: path.join(lastFolder, file), filename: file });
				} catch (e) {
					console.error(`Failed to send ${file}:`, e);
				}
			}
		});

	}
};
