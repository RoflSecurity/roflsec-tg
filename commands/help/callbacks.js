const fs = require("fs");
const path = require("path");

const escapeMarkdown = (text) => text ? text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1") : "";

module.exports = {
  execute: async (ctx) => {
    if (!ctx.callbackQuery) return;
    const data = ctx.callbackQuery.data;
    await ctx.answerCbQuery().catch(() => {});

    const commandsPath = path.join(__dirname, "..");
    const folders = fs.readdirSync(commandsPath).filter(f => fs.statSync(path.join(commandsPath, f)).isDirectory());
    const allCommands = folders.map(f => require(path.join(commandsPath, f, "index.js"))).filter(c => c.name);

    const grouped = { everyone: [], admin: [], owner: [] };
    allCommands.forEach(c => {
      if(c.permissions === "everyone") grouped.everyone.push(c);
      else if(c.permissions === "admin") grouped.admin.push(c);
      else if(c.permissions === "owner") grouped.owner.push(c);
    });

    let text = "";
    let keyboard = [];

    switch(data){
      case "help_everyone":
        text = "*Everyone Commands:*\n" + grouped.everyone.map(c => `• !${c.name}: ${c.description}`).join("\n");
        keyboard = [[{ text: "⬅️ Retour", callback_data: "help_main" }]];
        break;
      case "help_admin":
        text = "*Admin Commands:*\n" + grouped.admin.map(c => `• !${c.name}: ${c.description}`).join("\n");
        keyboard = [[{ text: "⬅️ Retour", callback_data: "help_main" }]];
        break;
      case "help_owner":
        text = "*Owner Commands:*\n" + grouped.owner.map(c => `• !${c.name}: ${c.description}`).join("\n");
        keyboard = [[{ text: "⬅️ Retour", callback_data: "help_main" }]];
        break;
      case "help_main":
        text = "Select a category to see commands:";
        keyboard = [
          [{ text: "Everyone", callback_data: "help_everyone" }],
          [{ text: "Admin", callback_data: "help_admin" }],
          [{ text: "Owner", callback_data: "help_owner" }]
        ];
        break;
      default:
        return;
    }

    if (ctx.callbackQuery.message) {
      await ctx.editMessageText(escapeMarkdown(text), {
        parse_mode: "MarkdownV2",
        reply_markup: { inline_keyboard: keyboard }
      });
    }
  }
};
