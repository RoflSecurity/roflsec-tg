const os = require("os");
const { Markup } = require("telegraf");

const escapeMarkdownV2 = (text) => {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`")
    .replace(/>/g, "\\>")
    .replace(/#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/-/g, "\\-")
    .replace(/=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/!/g, "\\!");
};

const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("User Info", "info_user")],
  [Markup.button.callback("Chat Info", "info_chat")],
  [Markup.button.callback("Bot Info", "info_bot")]
]);

const backKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("⬅️ Retour", "info_main")]
]);

module.exports = {
  execute: async (ctx) => {
    if (!ctx.callbackQuery) return;

    const data = ctx.callbackQuery.data;
    console.log("========== [INFO CALLBACK] ==========");
    console.log("[CALLBACK DATA]", data);

    try {
      switch (data) {
        case "info_main":
          console.log("[SENDING INFO MAIN MENU]");
          await ctx.editMessageText(
            "Sélectionnez le type d'info à afficher :",
            { parse_mode: "MarkdownV2", reply_markup: mainKeyboard.reply_markup }
          );
          console.log("[INFO MAIN MENU SENT]");
          break;

        case "info_user": {
          console.log("[SENDING USER INFO]");
          const user = ctx.from;
          const chat = ctx.chat;

          let chatStatus = "N/A";
          if (chat.type === "group" || chat.type === "supergroup") {
            try {
              const member = await ctx.telegram.getChatMember(chat.id, user.id);
              chatStatus = member.status;
            } catch {}
          }

          const text =
            `*User Info*\n` +
            `• ID: ${user.id}\n` +
            `• Username: ${user.username || "N/A"}\n` +
            `• First Name: ${user.first_name || "N/A"}\n` +
            `• Last Name: ${user.last_name || "N/A"}\n` +
            `• Is Bot: ${user.is_bot ? "Yes" : "No"}\n\n` +
            `*Chat Info*\n` +
            `• Your Role: ${chatStatus}`;

          await ctx.editMessageText(
            escapeMarkdownV2(text),
            { parse_mode: "MarkdownV2", reply_markup: backKeyboard.reply_markup }
          );
          console.log("[USER INFO SENT]");
          break;
        }

        case "info_chat": {
          console.log("[SENDING CHAT INFO]");
          const chat = ctx.chat;
          const text =
            `*Chat Info*\n` +
            `• Chat ID: ${chat.id}\n` +
            `• Type: ${chat.type}\n` +
            `• Title: ${chat.title || "N/A"}\n` +
            `• Username: ${chat.username || "N/A"}`;

          await ctx.editMessageText(
            escapeMarkdownV2(text),
            { parse_mode: "MarkdownV2", reply_markup: backKeyboard.reply_markup }
          );
          console.log("[CHAT INFO SENT]");
          break;
        }

        case "info_bot": {
          console.log("[SENDING BOT INFO]");
          const uptime = Math.floor(process.uptime());
          const cpus = os.cpus() || [];
          const cpuModel = cpus.length ? cpus[0].model : "Unknown";
          const cpuCores = cpus.length || 1;
          const ramTotal = Math.floor(os.totalmem() / 1024 / 1024);
          const ramFree = Math.floor(os.freemem() / 1024 / 1024);

          const text =
            `*Bot Info*\n` +
            `• Uptime: ${uptime}s\n` +
            `• CPU: ${cpuModel} (${cpuCores} cores)\n` +
            `• RAM: ${ramFree} / ${ramTotal} MB free/total`;

          await ctx.editMessageText(
            escapeMarkdownV2(text),
            { parse_mode: "MarkdownV2", reply_markup: backKeyboard.reply_markup }
          );
          console.log("[BOT INFO SENT]");
          break;
        }

        default:
          console.warn("[UNKNOWN CALLBACK]", data);
          await ctx.answerCbQuery("Action inconnue").catch(() => {});
          break;
      }
    } catch (err) {
      console.error("[ERROR IN INFO CALLBACK]", err);
      await ctx.answerCbQuery("Erreur lors de l'exécution").catch(() => {});
    }

    console.log("========== [INFO CALLBACK END] ==========\n");
  }
};
