module.exports = {
  name: "message",
  execute: async (ctx, bot) => {
    if (!ctx?.message?.text || ctx.from?.is_bot) return;

    const prefix = "!";
    if (!ctx.message.text.startsWith(prefix)) return;

    const args = ctx.message.text.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command = bot.commands.get(cmdName);
    if (!command) return;

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
      await command.execute(ctx, args);
    } catch (err) {
      console.error("[message] Error executing command:", err);
      ctx.reply("❌ Une erreur est survenue.");
    }
  },
};
