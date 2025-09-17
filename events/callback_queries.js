const fs = require("fs");
const path = require("path");

module.exports = (bot) => {
  bot.on("callback_query", async (ctx) => {
    try {
      console.log("========== [CALLBACK_QUERY RECEIVED] ==========");
      if (!ctx?.callbackQuery) {
        console.error("[ERROR] ctx.callbackQuery is missing");
        return;
      }

      const data = ctx.callbackQuery.data;
      console.log("[CALLBACK DATA]", data);

      if (!data) {
        console.warn("[WARNING] CallbackQuery.data is empty");
        await ctx.answerCbQuery("No data provided").catch(err => console.error(err));
        return;
      }

      const parts = data.split("_");
      const commandName = parts[0];
      console.log("[COMMAND NAME EXTRACTED]", commandName);

      const callbackFile = path.join(__dirname, `../commands/${commandName}/callbacks.js`);
      if (!fs.existsSync(callbackFile)) {
        console.warn("[WARNING] No callbacks.js found for", commandName);
        await ctx.answerCbQuery("Unknown action").catch(err => console.error(err));
        return;
      }

      console.log("[LOADING CALLBACK FILE]", callbackFile);
      delete require.cache[require.resolve(callbackFile)];
      const commandCallbacks = require(callbackFile);

      if (!commandCallbacks || typeof commandCallbacks.execute !== "function") {
        console.error("[ERROR] Callback file missing execute()");
        await ctx.answerCbQuery("Callback error").catch(err => console.error(err));
        return;
      }

      console.log("[EXECUTING CALLBACK FUNCTION]");
      await ctx.answerCbQuery().catch(err => console.error("[ERROR] answerCbQuery failed:", err));
      await commandCallbacks.execute(ctx);
      console.log("[CALLBACK EXECUTED SUCCESSFULLY]");

      console.log("========== [CALLBACK_QUERY END] ==========\n");
    } catch (err) {
      console.error("[FATAL ERROR in callback_queries.js]", err);
    }
  });
};
