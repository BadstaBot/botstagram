import {UserCommand} from '@src/lib/util/UserCommand';

export default new UserCommand({
    name: 'Info',
    type: 'USER'
}, (async (client, interaction) => {
    client.logger.debug('hai hai');

    client.getSlashCommand('user')?.func(client, interaction);
}));
