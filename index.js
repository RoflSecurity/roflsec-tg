require("dotenv").config();
const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.commands = new Map();
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath).forEach((folder) => {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) return;
  const command = require(path.join(folderPath, "index.js"));
  if (command.name && typeof command.execute === "function") {
    bot.commands.set(command.name, command);
    const callbacksPath = path.join(folderPath, "callbacks.js");
    if (fs.existsSync(callbacksPath)) command.callbacks = require(callbacksPath);
    const inlinePath = path.join(folderPath, "inlines.js");
    if (fs.existsSync(inlinePath)) command.inline = require(inlinePath);
    console.log(`[index] Loaded command: ${command.name}`);
  }
});
const eventsPath = path.join(__dirname, "events");
fs.readdirSync(eventsPath).forEach((file) => {
  if (!file.endsWith(".js")) return;
  if (file === "logs.js") return;
  const event = require(path.join(eventsPath, file));
  if (file === "callback_queries.js") {
    event(bot);
    console.log(`[index] Loaded event: ${file}`);
    return;
  }
  if (!event.name || typeof event.execute !== "function") return;
  if (event.name === "ready") {
    event.execute(bot);
  } else {
    bot.on(event.name, (ctx) => event.execute(ctx, bot));
  }
  console.log(`[index] Loaded event: ${file}`);
});
bot.launch({ handleSIGINT: false, handleSIGTERM: false });
const handleShutdown = async (signal) => {
  console.log(`Shutting down (${signal})`);
  await bot.telegram.sendMessage(process.env.BOT_LOGS, `[${signal}] bot down!`);
  await bot.stop(signal);
  process.exit(0);
};
process.once("SIGINT", () => handleShutdown("SIGINT"));
process.once("SIGTERM", () => handleShutdown("SIGTERM"));
