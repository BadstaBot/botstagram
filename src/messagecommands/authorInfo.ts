import {MessageCommand} from '@src/lib/util/MessageCommand';

export default new MessageCommand({
    name: 'Author Info',
    type: 'MESSAGE'
}, async (client, interaction) => {

    const message = interaction.options.getMessage('message');

    client.getSlashCommand('user')?.func(client, interaction);
});
