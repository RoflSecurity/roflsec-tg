const Tesseract = require("tesseract.js");
const translate = require("@iamtraction/google-translate");

// Full Tesseract supported languages array
const tesseractLanguages = [
  "afr","amh","ara","asm","aze","aze_cyrl","bel","ben","bod","bos","bre","bul","cat",
  "ceb","ces","chi_sim","chi_tra","chr","cos","cym","dan","deu","dzo","ell","eng","enm",
  "epo","equ","est","eus","fao","fas","fil","fin","fra","frk","frm","gle","glg","grc",
  "guj","hat","heb","hin","hrv","hun","hye","iku","ind","isl","ita","ita_old","jav",
  "jpn","kan","kat","kaz","khm","kir","kmr","kor","kur","lao","lat","lav","lit","ltz",
  "mal","mar","mkd","mlt","mon","mri","msa","mya","nep","nld","nor","oci","ori","pan",
  "pol","por","pus","que","ron","rus","san","sin","slk","slv","snd","spa","sqi","srp",
  "srp_latn","sun","swa","swe","syr","tam","tat","tel","tgk","tgl","tha","tir","tur",
  "uig","ukr","urd","uzb","uzb_cyrl","vie","yid"
];

// CDN path for traineddata
const LANG_CDN = "https://tessdata.projectnaptha.com/4.0.0_best";

module.exports = {
  name: "ocr",
  description: "Extract text from an image and translate it into English. Usage: !ocr <lang> (reply to an image)",
  permissions: "everyone",

  execute: async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    const lang = args[0]?.toLowerCase();

    if (!lang || !tesseractLanguages.includes(lang)) {
      return ctx.reply(`❌ Unsupported language.\nAvailable languages: ${tesseractLanguages.join(", ")}`);
    }

    if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
      return ctx.reply("📸 Please reply to an image with the command: `!ocr <lang>`");
    }

    try {
      const photos = ctx.message.reply_to_message.photo;
      const fileId = photos[photos.length - 1].file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);

      await ctx.reply("🔎 Performing OCR...");

      const { data: { text } } = await Tesseract.recognize(fileLink.href, lang, {
        langPath: LANG_CDN,
        logger: m => console.log("[OCR]", m)
      });

      if (!text.trim()) return ctx.reply("❌ No text detected in the image.");
      await ctx.reply(`📝 Detected text:\n${text.trim()}`);

      const translation = await translate(text, { to: "en" });
      await ctx.reply(`🌍 Translation (EN):\n${translation.text}`);

    } catch (err) {
      console.error("[OCR] Error:", err);
      await ctx.reply("⚠️ An error occurred during OCR or translation.");
    }
  }
};
