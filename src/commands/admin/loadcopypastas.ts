import {SlashCommand} from '@src/lib/util/SlashCommand';
import {Message, MessageEmbed} from 'discord.js';
import {readdir, readFile} from 'fs/promises';
import {copypastas} from '@src/lib/copypastas';
import configNew from '@src/commands/server/configNew';



export default new SlashCommand(
    {
        name: 'load_copypastas',
        description: 'Load copypastas',
        ownerOnly: true
    },

    (async (client, interaction) => {
        const files = await readdir('C:\\Users\\Badstagram\\Desktop\\aero-master-config-copypastas\\config\\copypastas');

        for (const file of files) {
            const buf = await readFile(`C:\\Users\\Badstagram\\Desktop\\aero-master-config-copypastas\\config\\copypastas\\${file}`);
            const content = buf.toString();

            client.logger.forkInstance('commands/load_copypasta').debug(`${file} -> ${content}`);
            copypastas.push(content);

        }
    })
);
