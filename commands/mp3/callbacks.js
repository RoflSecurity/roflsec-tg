module.exports = {
  mp3_retry: async (ctx) => {
    console.log("========== [MP3 CALLBACK EXECUTE] ==========");
    console.log("[CTX FROM USER]", { id: ctx.from.id, username: ctx.from.username });
    await ctx.answerCbQuery("Please resend the command with the URL");
    console.log("========== [MP3 CALLBACK END] ==========\n");
  }
};
