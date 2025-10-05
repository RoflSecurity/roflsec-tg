module.exports = {
  ping_retry: async (ctx) => {
    await ctx.answerCbQuery("Please resend !ping to check response time");
  }
};
