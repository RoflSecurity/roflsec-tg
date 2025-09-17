module.exports = {
  name: "inline_query",
  execute: async (ctx, bot) => {
    if (!ctx.inlineQuery) return;

    try {
      bot.commands.forEach((cmd) => {
        if (cmd.inline?.handle) cmd.inline.handle(ctx);
      });
    } catch (err) {
      console.error("[inline_query] Error:", err);
    }
  },
};
