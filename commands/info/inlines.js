module.exports = {
  execute: async (ctx) => {
    if (!ctx.inlineQuery) return;

    await ctx.answerInlineQuery([
      {
        type: "article",
        id: "info_1",
        title: "Display info",
        input_message_content: {
          message_text: "Use !info in chat to choose which info to display"
        }
      }
    ]);
  }
};
