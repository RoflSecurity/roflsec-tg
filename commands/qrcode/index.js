const qr = require('qr-image');

module.exports = {
    name: 'qrcode',
    description: 'Generate a scannable QR code',
    permission: 'everyone',
    alias: ["qr"],
    async execute(ctx, args) {
        if (!args[0]) return ctx.reply('Usage: !qr <text>');
        const text = args.join(' ');

        try {
            const qrBuffer = qr.imageSync(text, { type: 'png', margin: 10, size: 10 });
            await ctx.replyWithPhoto({ source: qrBuffer });
        } catch (e) {
            console.error('[QR] Error executing command:', e);
        }
    }
};
