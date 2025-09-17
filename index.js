require("dotenv").config();
const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Collection pour commandes
bot.commands = new Map();

// Chargement des commandes
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath).forEach((folder) => {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) return;

  const command = require(path.join(folderPath, "index.js"));
  if (command.name && typeof command.execute === "function") {
    bot.commands.set(command.name, command);

    // Chargement des callbacks si présents
    const callbacksPath = path.join(folderPath, "callbacks.js");
    if (fs.existsSync(callbacksPath)) command.callbacks = require(callbacksPath);

    // Chargement des inline handlers si présents
    const inlinePath = path.join(folderPath, "inline.js");
    if (fs.existsSync(inlinePath)) command.inline = require(inlinePath);

    console.log(`[index] Loaded command: ${command.name}`);
  }
});

// Chargement des events
const eventsPath = path.join(__dirname, "events");
fs.readdirSync(eventsPath).forEach((file) => {
  if (!file.endsWith(".js")) return;
  const event = require(path.join(eventsPath, file));

  // Pour callback_queries.js qui exporte une fonction
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

//bot.launch({handleSIGINT:false,handleSIGTERM:false});
//process.once("SIGINT", () => bot.stop("SIGINT"));
//process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.launch({ handleSIGINT: false, handleSIGTERM: false });

process.once("SIGINT", async () => {
  console.log(" Shutting down (SIGINT)");
  await bot.stop("SIGINT");
  process.exit(0);
});

process.once("SIGTERM", async () => {
  console.log(" Shutting down (SIGTERM)");
  await bot.stop("SIGTERM");
  process.exit(0);
});
