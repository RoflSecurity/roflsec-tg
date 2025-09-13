module.exports = {
  name: "ping",
  description: "Ping the bot and get response time",
  permissions: "everyone",
  execute: async (ctx) => {
    const start = Date.now();
    const msg = await ctx.reply("🏓 Pinging...");
    const end = Date.now();
    const pingTime = end - start;
    await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `🏓 Pong! Response time: ${pingTime}ms`);
    console.log(`[PING] Response time: ${pingTime}ms`);
  }
};
