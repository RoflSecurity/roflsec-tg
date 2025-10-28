const { Markup } = require("telegraf");

module.exports = {
  name: "help",
  description: "Shows all commands and features",
  permissions: "everyone",
  alias: ["h"],
  execute: async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("Everyone", "help_everyone")],
      [Markup.button.callback("Admin", "help_admin")],
      [Markup.button.callback("Owner", "help_owner")]
    ]);
    try {
      await ctx.reply("Select a category to see commands:", keyboard);
    } catch (err) {
      console.error("[ERROR] Failed to send help message:", err);
      await ctx.reply("❌ Failed to display help.").catch(e => console.error("[ERROR] fallback reply failed:", e));
    }
  }
};
