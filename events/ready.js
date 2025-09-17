module.exports = {
  name: "ready",
  execute: async (bot) => {
    const logsChatId = process.env.BOT_LOGS;
    try {
      await bot.telegram.sendMessage(logsChatId, "[SIGUP] bot up and ready!");
      console.log("[ready] Message 'bot ready!' envoyé dans Logs");
    } catch (err) {
      console.error("[ready] Impossible d'envoyer le message dans Logs:", err);
    }
  },
};
