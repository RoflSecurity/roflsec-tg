const Tesseract = require("tesseract.js")
const translate = require("@iamtraction/google-translate")

// Supported languages mapping for Tesseract
const supportedLangs = {
  ru: "rus",
  fr: "fra",
  es: "spa",
  de: "deu",
  it: "ita",
  zh: "chi_sim",
  ko: "kor"
}

// CDN path for traineddata
const LANG_CDN = "https://tessdata.projectnaptha.com/4.0.0_best"

module.exports = {
  name: "ocr",
  description: "Extract text from an image and translate it into English. Usage: !ocr <lang> (reply to an image)",
  permissions: "everyone",

  execute: async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1)
    const lang = args[0]?.toLowerCase()

    if (!lang || !supportedLangs[lang]) {
      return ctx.reply("❌ Unsupported language.\nAvailable: ru, fr, es, de, it, zh, ko")
    }

    if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
      return ctx.reply("📸 Please reply to an image with the command: `!ocr <lang>`")
    }

    try {
      const photos = ctx.message.reply_to_message.photo
      const fileId = photos[photos.length - 1].file_id
      const fileLink = await ctx.telegram.getFileLink(fileId)

      await ctx.reply("🔎 Performing OCR...")

      const { data: { text } } = await Tesseract.recognize(fileLink.href, supportedLangs[lang], {
        langPath: LANG_CDN,
        logger: m => console.log("[OCR]", m)
      })

      if (!text.trim()) return ctx.reply("❌ No text detected in the image.")
      await ctx.reply(`📝 Detected text:\n${text.trim()}`)

      const translation = await translate(text, { to: "en" })
      await ctx.reply(`🌍 Translation (EN):\n${translation.text}`)

    } catch (err) {
      console.error("[OCR] Error:", err)
      await ctx.reply("⚠️ An error occurred during OCR or translation.")
    }
  }
}
