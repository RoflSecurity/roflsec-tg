const { Markup } = require("telegraf");

module.exports = {
  name: "help",
  description: "Shows all commands grouped by permission",
  permissions: "everyone",
  execute: async (ctx) => {
    console.log("========== [HELP COMMAND EXECUTE] ==========");
    console.log("[CTX FROM USER]", ctx.from ? { id: ctx.from.id, username: ctx.from.username } : null);

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("Everyone", "help_everyone")],
      [Markup.button.callback("Admin", "help_admin")],
      [Markup.button.callback("Owner", "help_owner")]
    ]);

    try {
      console.log("[SENDING HELP MAIN MESSAGE]");
      const msg = await ctx.reply("Select a category to see commands:", keyboard);
      console.log("[HELP MESSAGE SENT] Message ID:", msg.message_id);
    } catch (err) {
      console.error("[ERROR] Failed to send help message:", err);
      await ctx.reply("❌ Failed to display help.").catch(e => console.error("[ERROR] fallback reply failed:", e));
    }

    console.log("========== [HELP COMMAND END] ==========\n");
  }
};
