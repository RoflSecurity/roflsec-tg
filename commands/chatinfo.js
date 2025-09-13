module.exports = {
  name: "chatinfo",
  description: "Show basic chat info",
  permissions: "everyone",
  execute: async (ctx) => {
    const chat = ctx.chat;

    const msg =
      `*Chat Info*\n` +
      `• Chat ID: ${chat.id}\n` +
      `• Type: ${chat.type}\n` +
      `• Title: ${chat.title || "N/A"}\n` +
      `• Username: ${chat.username || "N/A"}`;

    await ctx.reply(msg);
  }
};
