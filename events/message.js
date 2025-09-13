// events/message.js
module.exports = {
  name: "message",
  execute: async (ctx, bot) => {
    try {
      if (!ctx.message || !ctx.message.text) return;
      if (ctx.from.is_bot) return;

      const prefix = "!";
      if (!ctx.message.text.startsWith(prefix)) return;

      const args = ctx.message.text.slice(prefix.length).trim().split(/ +/);
      const cmdName = args.shift().toLowerCase();

      const command = bot.commands.get(cmdName);
      if (!command) return;

      // Fonction d'escape pour MarkdownV2
      const escapeMarkdownV2 = (text) => {
        if (!text) return "";
        return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
      };

      // On surcharge ctx.reply et ctx.replyWithPhoto pour MarkdownV2
      const originalReply = ctx.reply.bind(ctx);
      const originalReplyWithPhoto = ctx.replyWithPhoto.bind(ctx);

      ctx.reply = async (text, options = {}) => {
        if (!options.parse_mode) options.parse_mode = "MarkdownV2";
        text = escapeMarkdownV2(text);
        return originalReply(text, options);
      };

      ctx.replyWithPhoto = async (photo, options = {}) => {
        if (options.caption) options.caption = escapeMarkdownV2(options.caption);
        if (!options.parse_mode) options.parse_mode = "MarkdownV2";
        return originalReplyWithPhoto(photo, options);
      };

      // Exécution de la commande
      await command.execute(ctx, args);
    } catch (err) {
      console.error(`[message] Error executing command:`, err);
      ctx.reply("❌ Une erreur est survenue.");
    }
  }
};
