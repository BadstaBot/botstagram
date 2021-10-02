import {MessageCommand} from '@src/lib/util/MessageCommand';
import {Message, MessageEmbed} from 'discord.js';
import {OCRResult} from '@src/lib/interfaces/OCRResult';
import Centra = require('centra');
import {inspect} from 'util';

export default new MessageCommand({
    name: 'OCR',
    type: 'MESSAGE'
}, (async (client, interaction) => {
    const msg = interaction.options.getMessage('message', true) as Message;

    const attachment = msg.attachments.first();

    if (!attachment) {
        return await interaction.reply({
            content: 'That message has no attachments',
            ephemeral: true
        });
    }

    await interaction.deferReply();
    const res = await Centra('https://api.ocr.space/parse/image', 'POST')
        .header('apikey', client.config.secrets.ocrSpace)
        .body({
            'url': attachment.url
        }, 'form')
        .send();

    const result = (await res.json()) as OCRResult;
    console.log(inspect(await res.json(), true, 3));

    const embed = new MessageEmbed()
        .setTitle('OCR')
        .setDescription(result.ParsedResults[0].ParsedText)
        .setFooter(`Took ${client.util.humanize(parseInt(result.ProcessingTimeInMilliseconds), true)} | Powered By ocr.space`);

    await interaction.editReply({
        embeds: [embed]
    });


}));
