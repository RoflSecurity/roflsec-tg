module.exports = {
  ping_inline: async (ctx) => {
    await ctx.answerInlineQuery([{
      type: "article",
      id: "ping_1",
      title: "Ping the bot",
      input_message_content: {
        message_text: "Use !ping in chat to get the response time"
      }
    }]);
  }
};
