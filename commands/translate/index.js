const translate = require("@iamtraction/google-translate")

module.exports = {
  name: "translate",
  description: "Translate message text to a target language. Usage: !translate <target_lang> [text] (or reply to a message). Source language is auto-detected.",
  permissions: "everyone",
  alias: ["trans"],
  execute: async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1)
    const targetLang = args[0]?.toLowerCase()
    if (!targetLang) return ctx.reply("❌ Please provide a target language code, e.g., `!translate en`")

    // Get text from command or from replied message
    let textToTranslate = args.slice(1).join(" ")
    if (!textToTranslate && ctx.message.reply_to_message?.text) {
      textToTranslate = ctx.message.reply_to_message.text
    }

    if (!textToTranslate) return ctx.reply("❌ No text to translate!")

    try {
      // Auto-detect source language
      const translation = await translate(textToTranslate, { to: targetLang })
      await ctx.reply(`🌍 Translation (${targetLang.toUpperCase()}):\n${translation.text}`)
    } catch (err) {
      console.error("[Translate] Error:", err)
      await ctx.reply("⚠️ An error occurred during translation.")
    }
  }
}
