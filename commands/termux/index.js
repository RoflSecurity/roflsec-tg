const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

module.exports = {
    name: "termux",
    description: "Execute Termux local commands via shell wrappers",
    permission: "owner",
    alias:["t"],
    execute: async (ctx, args) => {
        if (ctx.from.id.toString() !== process.env.BOT_OWNER_ID)
            return ctx.reply("❌ You are not allowed to use this command.");

        const cmdDir = path.join(__dirname, "cmd");

        if (!args.length) {
            // Lire tous les scripts dans cmd/ et les afficher
            const files = fs.readdirSync(cmdDir).filter(f => fs.statSync(path.join(cmdDir, f)).isFile());
            if (!files.length) return ctx.reply("Aucun script Termux disponible.");
            const list = files.map(f => `• ${f}`).join("\n");
            return ctx.reply(`📄 Available Termux commands:\n${list}`);
        }

        const command = args[0];
        const scriptPath = path.join(cmdDir, command);

        if (!fs.existsSync(scriptPath))
            return ctx.reply(`❌ Unknown command: ${command}`);

        const fullCommand = `${scriptPath} ${args.slice(1).join(" ")}`.trim();

        exec(fullCommand, { shell: "/data/data/com.termux/files/usr/bin/sh" }, (error, stdout, stderr) => {
            if (error) return ctx.reply(`❌ Error:\n${stderr || error.message}`);
            ctx.reply(`✅ ${stdout || "Command executed successfully."}`);
        });
    }
};
