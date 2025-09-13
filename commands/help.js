const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  description: "Shows all commands grouped by permission",
  permissions: "everyone",
  execute: async (ctx) => {
    const commandsPath = __dirname;
    const allCommands = fs.readdirSync(commandsPath)
      .filter(f => f.endsWith(".js"))
      .map(f => require(path.join(commandsPath, f)))
      .filter(c => c.name);

    const grouped = { everyone: [], admin: [], owner: [] };
    allCommands.forEach(c => {
      if(c.permissions === "everyone") grouped.everyone.push(c);
      else if(c.permissions === "admin") grouped.admin.push(c);
      else if(c.permissions === "owner") grouped.owner.push(c);
    });

    let msg = "*Help Menu*\n\n";

    msg += "ℹ️ *Everyone Commands:*\n";
    grouped.everyone.forEach(c => {
      msg += `• !${c.name}: ${c.description}\n`;
    });

    msg += "\n🛡️ *Admin Commands:*\n";
    grouped.admin.forEach(c => {
      msg += `• !${c.name}: ${c.description}\n`;
    });

    msg += "\n👑 *Owner Commands:*\n";
    grouped.owner.forEach(c => {
      msg += `• !${c.name}: ${c.description}\n`;
    });

    await ctx.reply(msg);
  }
};
