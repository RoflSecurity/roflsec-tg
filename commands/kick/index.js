module.exports = {
  name: "kick",
  description: "Kick a user from the chat",
  permissions: "admin",
  alias: ["k"],

  execute: async (ctx, args) => {
    try {
      if (!args[0] || !args[0].startsWith("@"))
        return ctx.reply("⚠️ Usage: !kick @nickname");

      const username = args[0].substring(1).toLowerCase();

      // Get chat admins to prevent kicking one
      const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
      const admin = admins.find(a => a.user.username?.toLowerCase() === username);
      if (admin) return ctx.reply("⚠️ You cannot kick an admin.");

      // Try to get user info
      let target;
      try {
        const member = await ctx.telegram.getChatMember(ctx.chat.id, username);
        target = member.user;
      } catch {
        return ctx.reply(`❌ User @${username} not found in this chat.`);
      }

      await ctx.telegram.banChatMember(ctx.chat.id, target.id);
      await ctx.telegram.unbanChatMember(ctx.chat.id, target.id);

      await ctx.reply(`👢 ${target.first_name} has been kicked.`);
    } catch (err) {
      console.error("[kick] Error:", err);
      await ctx.reply("❌ Failed to kick the user.");
    }
  },
};
