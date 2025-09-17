module.exports = {
  mp3_inline: async (ctx) => {
    console.log("========== [MP3 INLINE QUERY RECEIVED] ==========");
    console.log("[CTX FROM USER]", { id: ctx.from.id, username: ctx.from.username });

    await ctx.answerInlineQuery([{
      type: "article",
      id: "mp3_1",
      title: "Download MP3",
      input_message_content: {
        message_text: "Use !mp3 <YouTube_URL> in chat to download the MP3"
      }
    }]);

    console.log("========== [MP3 INLINE QUERY END] ==========\n");
  }
};
