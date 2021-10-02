import {SlashCommand} from '@src/lib/util/SlashCommand';
import {Image} from 'imagescript';
import {readFile} from 'fs/promises';
import {join} from 'path';
import {Logger} from '@src/lib/util/Logger';
import Centra = require('centra');
import path = require('node:path');

export default new SlashCommand(
    {
        name: 'flag',
        description: 'Overlay a flag over a users profile picture',
        options: [
            {
                name: 'flag',
                description: 'The flag',
                type: 'STRING',
                required: true,
                choices: [
                    {
                        name: 'bisexual',
                        value: 'bisexual'
                    }
                ]
            },
            {
                name: 'user',
                description: 'The user',
                type: 'USER',
                required: false
            },
            {
                name: 'opacity',
                description: 'The opacity',
                type: 'NUMBER',
                required: false
            }
        ]
    },

    (async (client, interaction) => {

        await interaction.deferReply();


        const flagType = interaction.options.getString('flag', true);
        const url = (interaction.options.getUser('user', false) ?? interaction.user).displayAvatarURL({
            size: 512,
            format: 'jpg'
        });
        const opacity = (interaction.options.getNumber('opacity', false) ?? 25) / 100;

        new Logger(client.util.lastElement(__filename.split(path.sep))).debug(join(__dirname, '..', '..', '..', 'assets', 'flags', `${flagType}.png`));
        const fileBuffer = await readFile(join(__dirname, '..', '..', '..', 'assets', 'flags', `${flagType}.png`));

        new Logger(client.util.lastElement(__filename.split('/'))).debug(`length: ${fileBuffer.length}`);
        // new Logger(client.util.lastElement(__filename.split('/'))).debug();
        const flagImage = new Image.composite(fileBuffer, 0, 0);
        const avatar = (await Image.decode((await Centra(url).send()).body))
            .resize(512, 512);


        const flag = new Image(flagImage.width, flagImage.height)
            .composite(flagImage, 0, 0)
            .opacity(opacity)
            .resize(avatar.width, avatar.height);


        const buf = Buffer.from(await avatar.composite(flag, 0, 0).encode());

        await interaction.editReply({
            files: [
                {
                    attachment: buf,
                    name: `${flagType}.png`
                }
            ]
        });

    })
);
