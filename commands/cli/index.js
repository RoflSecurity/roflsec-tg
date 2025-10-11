// commands/cli.js (safe runner)
require("dotenv").config();
const { spawn } = require("child_process");

const OWNER_ID = parseInt(process.env.BOT_OWNER_ID, 10);
const MAX_LINES = 100;
const TIMEOUT_MS = 5000; // safety timeout

module.exports = {
  name: "cli",
  description: "Run system commands",
  permissions: "owner",
  alias:["c"],
  execute: async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ You are not allowed to use this command.");

    const cmd = ctx.message.text.split(" ").slice(1).join(" ");
    if (!cmd) return ctx.reply("❌ Please provide a command to run.");

    // run the command through sh so pipes/redirections work
    const child = spawn("sh", ["-c", cmd], { stdio: ["ignore", "pipe", "pipe"] });

    let lines = [];
    let killed = false;
    const killChild = (reason) => {
      if (!killed) {
        killed = true;
        child.kill("SIGKILL");
        console.log("[CLI] killed child:", reason);
      }
    };

    // safety timeout
    const to = setTimeout(() => killChild("timeout"), TIMEOUT_MS);

    const handleData = (chunk) => {
      const text = chunk.toString();
      const split = text.split(/\r?\n/);
      for (let i = 0; i < split.length; i++) {
        if (split[i].length === 0) continue;
        lines.push(split[i]);
        if (lines.length >= MAX_LINES) {
          killChild("max_lines_reached");
          break;
        }
      }
    };

    child.stdout.on("data", handleData);
    child.stderr.on("data", handleData);

    child.on("close", async (code, signal) => {
      clearTimeout(to);
      const output = lines.join("\n") || `(no output, exit ${code} sig:${signal})`;
      // Telegram message length safe-guard
      const reply = output.length > 4000 ? output.slice(0, 4000) + "\n…(truncated)" : output;
      try { await ctx.reply(`✅ Output (first ${MAX_LINES} lines):\n\`\`\`\n${reply}\n\`\`\``); }
      catch (e) { console.error("[CLI] reply error", e); }
    });

    child.on("error", async (err) => {
      clearTimeout(to);
      killChild("error");
      await ctx.reply(`⚠️ Execution error:\n${err.message}`);
    });
  }
};
