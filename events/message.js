require("dotenv").config();
const { pool, query } = require("../db/pooling");

module.exports = {
  name: "message",
  execute: async (ctx, bot) => {
    if (!ctx?.message || ctx.from?.is_bot) return; // ignore les bots

    const prefix = "!";
    if (!ctx.message.text?.startsWith(prefix)) return; // ignore tout sauf commandes

    const logsChatId = process.env.BOT_LOGS;

    const args = ctx.message.text.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    let command = bot.commands.get(cmdName) || Array.from(bot.commands.values()).find(c => c.alias?.includes(cmdName));

    if (!command) {
      command = Array.from(bot.commands.values()).find(c => c.alias?.includes(cmdName));
    }
    if (!command) return;

    const chatName = ctx.chat?.title || ctx.chat?.username || ctx.chat?.first_name || "Unknown";
    const chatId = ctx.chat?.id || "Unknown";
    const chatType = ctx.chat?.type || "unknown";
    try {
      if (logsChatId) {
        await bot.telegram.sendMessage(
          logsChatId,
          `[COMMAND] ${cmdName} ${args} \n\n username: ${ctx.from.username || ctx.from.first_name} \n\n chat name: ${chatName} \n\n chat id: ${chatId} \n\n chat type ${chatType}`
        );
      }
    } catch (err) {
      console.error("[message] Error sending log:", err);
    }

    const escapeMarkdownV2 = (text) =>
      text ? text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1") : "";

    const originalReply = ctx.reply.bind(ctx);
    const originalReplyWithPhoto = ctx.replyWithPhoto.bind(ctx);

    ctx.reply = async (text, options = {}) => {
      if (!options.parse_mode) options.parse_mode = "MarkdownV2";
      return originalReply(escapeMarkdownV2(text), options);
    };

    ctx.replyWithPhoto = async (photo, options = {}) => {
      if (!options.parse_mode) options.parse_mode = "MarkdownV2";
      if (options.caption) options.caption = escapeMarkdownV2(options.caption);
      return originalReplyWithPhoto(photo, options);
    };

    try {
      await command.execute(ctx, args, {pool,query});
    } catch (err) {
      console.error("[message] Error executing command:", err);
      ctx.reply("❌ Une erreur est survenue.");
    }
  },
};
