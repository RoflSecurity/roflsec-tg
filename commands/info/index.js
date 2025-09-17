const { Markup } = require("telegraf");
const callbacks = require("./callbacks");

const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("User Info", "info_user")],
  [Markup.button.callback("Chat Info", "info_chat")],
  [Markup.button.callback("Bot Info", "info_bot")]
]);

module.exports = {
  name: "info",
  description: "Display info",
  execute: async (ctx) => {
    console.log("========== [INFO COMMAND EXECUTE] ==========");
    console.log("[CTX FROM USER]", { id: ctx.from.id, username: ctx.from.username });

    try {
      await ctx.reply("Sélectionnez le type d'info à afficher :", {
        parse_mode: "MarkdownV2",
        reply_markup: mainKeyboard.reply_markup,
      });
      console.log("[INFO MESSAGE SENT]");
    } catch (err) {
      console.error("[ERROR SENDING INFO MAIN]", err);
      await ctx.reply("❌ Impossible d'afficher le menu info.");
    }

    console.log("========== [INFO COMMAND END] ==========");
  },
  callbacks, // pour être utilisé par callback_queries.js
};
