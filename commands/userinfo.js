module.exports = {
  name: "userinfo",
  description: "Get info about yourself and chat",
  permissions: "everyone",
  execute: async (ctx) => {
    const user = ctx.from;
    const chat = ctx.chat;

    let chatStatus = "N/A";
    if (chat.type === "group" || chat.type === "supergroup") {
      try {
        const member = await ctx.telegram.getChatMember(chat.id, user.id);
        chatStatus = member.status;
      } catch {}
    }

    const userInfo =
      `*User Info*\n` +
      `• ID: ${user.id}\n` +
      `• Username: ${user.username || "N/A"}\n` +
      `• First Name: ${user.first_name || "N/A"}\n` +
      `• Last Name: ${user.last_name || "N/A"}\n` +
      `• Is Bot: ${user.is_bot ? "Yes" : "No"}\n\n` +
      `*Chat Info*\n` +
      `• Chat ID: ${chat.id}\n` +
      `• Type: ${chat.type}\n` +
      `• Title: ${chat.title || "N/A"}\n` +
      `• Username: ${chat.username || "N/A"}\n` +
      `• Your Role: ${chatStatus}`;

    try {
      const photos = await ctx.telegram.getUserProfilePhotos(user.id, 0, 1);
      if (photos.total_count > 0) {
        const fileId = photos.photos[0][0].file_id;
        await ctx.replyWithPhoto(fileId, { caption: userInfo });
        return;
      }
    } catch {}

    await ctx.reply(userInfo);
  }
};
