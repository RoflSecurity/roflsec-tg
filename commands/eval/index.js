const util = require("util")
require("dotenv").config()
const OWNER_ID = parseInt(process.env.BOT_OWNER_ID)
module.exports = {
  name: "eval",
  description: "Evaluate JS code",
  permissions: "owner",
  alias: ["e"],
  execute: async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ You are not allowed to use this command.");
    if (ctx.message.text.includes(["process", "token", "mysql", "require"])) return ctx.reply ("urmum");
  const code = ctx.message.text.split(" ").slice(1).join(" ")
    if (!code) return ctx.reply("❌ Please provide some code to evaluate.")
    try {
      const result = await eval(`(async () => { return ${code} })()`)
      const output = typeof result === "string" ? result : util.inspect(result, { depth: 1 })
      await ctx.reply(`✅ Result:\n${output}`)
    } catch (err) {
      await ctx.reply(`⚠️ Error:\n${err.message}`)
    }
  }
}
