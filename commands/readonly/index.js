module.exports = {
  name: "readonly",
  description: "Set a user to read-only mode (mute indefinitely).",
  permissions: "admin",
  alias: ["r", "mute"],

  execute: async (ctx, args) => {
    try {
      let target = null;

      // Case 1: reply
      if (ctx.message.reply_to_message) {
        target = ctx.message.reply_to_message.from;
      }
      // Case 2: @mention
      else if (args[0] && args[0].startsWith("@")) {
        const username = args[0].substring(1).toLowerCase();
        const members = await ctx.telegram.getChatAdministrators(ctx.chat.id);
        const admin = members.find(m => m.user.username?.toLowerCase() === username);

        if (admin) {
          return ctx.reply("⚠️ You cannot restrict an admin.");
        }

        try {
          const user = await ctx.telegram.getChatMember(ctx.chat.id, username);
          target = user.user;
        } catch {
          return ctx.reply(`❌ User @${username} not found in this chat.`);
        }
      } else {
        return ctx.reply("⚠️ Reply to a user or mention them with @nickname.");
      }

      await ctx.telegram.restrictChatMember(ctx.chat.id, target.id, {
        permissions: {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false,
        },
      });

      await ctx.reply(`🔇 ${target.first_name} is now read-only.`);
    } catch (err) {
      console.error("[readonly] Error:", err);
      await ctx.reply("❌ Failed to apply read-only mode.");
    }
  },
};
