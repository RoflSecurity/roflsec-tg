module.exports = {
  name: "ban",
  description: "Ban a user from the chat (they cannot rejoin).",
  permissions: "admin",
  aliases: ["permban"],

  execute: async (ctx, args) => {
    try {
      if (!args[0] || !args[0].startsWith("@"))
        return ctx.reply("⚠️ Usage: !ban @nickname");

      const username = args[0].substring(1).toLowerCase();

      // Prevent banning admins
      const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
      const admin = admins.find(a => a.user.username?.toLowerCase() === username);
      if (admin) return ctx.reply("⚠️ You cannot ban an admin.");

      // Get target user
      let target;
      try {
        const member = await ctx.telegram.getChatMember(ctx.chat.id, username);
        target = member.user;
      } catch {
        return ctx.reply(`❌ User @${username} not found in this chat.`);
      }

      await ctx.telegram.banChatMember(ctx.chat.id, target.id);
      await ctx.reply(`🚫 ${target.first_name} has been banned from the chat.`);
    } catch (err) {
      console.error("[ban] Error:", err);
      await ctx.reply("❌ Failed to ban the user.");
    }
  },
};
