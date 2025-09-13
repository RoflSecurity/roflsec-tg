require("dotenv").config();
const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Collection pour commandes
bot.commands = new Map();

// Chargement des commandes
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath).forEach(file => {
  if (!file.endsWith(".js")) return;
  const command = require(path.join(commandsPath, file));
  if (command.name && typeof command.execute === "function") {
    bot.commands.set(command.name, command);
    console.log(`[index] Loaded command: ${command.name}`);
  }
});

// Chargement des events
const eventsPath = path.join(__dirname, "events");
fs.readdirSync(eventsPath).forEach(file => {
  if (!file.endsWith(".js")) return;
  const event = require(path.join(eventsPath, file));
  if (event.name && typeof event.execute === "function") {
    // Exécution immédiate pour ready, sinon wrapper pour les messages
    if (event.name === "ready") {
      event.execute(bot);
    } else {
      bot.on(event.name, ctx => event.execute(ctx, bot));
    }
    console.log(`[index] Loaded event: ${file}`);
  }
});

// Démarrage du bot
bot.launch().then(() => console.log("[index] Bot started"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
