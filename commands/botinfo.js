const os = require("os");

module.exports = {
  name: "botinfo",
  description: "Show bot and system info",
  permissions: "everyone",
  execute: async (ctx) => {
    const uptime = Math.floor(process.uptime());
    const cpus = os.cpus() || [];
    const cpuModel = cpus.length ? cpus[0].model : "Unknown";
    const cpuCores = cpus.length || 1;
    const ramTotal = Math.floor(os.totalmem() / 1024 / 1024);
    const ramFree = Math.floor(os.freemem() / 1024 / 1024);

    const msg =
      `*RoflSecurity Bot Info*\n` +
      `• Uptime: ${uptime}s\n` +
      `• CPU: ${cpuModel} (${cpuCores} cores)\n` +
      `• RAM: ${ramFree} / ${ramTotal} MB free/total\n\n` +
      `Visit opexposecps.com !`;

    await ctx.reply(msg);
  }
};
