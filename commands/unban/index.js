module.exports = {
  name: "unban",
  description: "Unban a user from the chat (allow them to rejoin).",
  permissions: "admin",
  alias: ["u"],

  execute: async (ctx, args) => {
    try {
      if (!args[0] || !args[0].startsWith("@"))
        return ctx.reply("⚠️ Usage: !unban @nickname");

      const username = args[0].substring(1).toLowerCase();

      // Prevent unbanning admins (useless but consistent)
      const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
      const admin = admins.find(a => a.user.username?.toLowerCase() === username);
      if (admin) return ctx.reply("⚠️ Admins can't be unbanned.");

      // Try to find the user in chat history
      let target;
      try {
        const member = await ctx.telegram.getChatMember(ctx.chat.id, username);
        target = member.user;
      } catch {
        // If user not in chat, create a minimal target for message
        target = { first_name: username, username };
      }

      await ctx.telegram.unbanChatMember(ctx.chat.id, username);
      await ctx.reply(`✅ ${target.first_name ? target.first_name : "User"} has been unbanned.`);
    } catch (err) {
      console.error("[unban] Error:", err);
      await ctx.reply("❌ Failed to unban the user.");
    }
  },
};
