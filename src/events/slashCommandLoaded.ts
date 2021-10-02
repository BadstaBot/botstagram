import {Event} from '@src/lib/util/Event';

export default new Event('slashCommandLoaded', async (client, command) => {
    client.logger.forkInstance('Events/slashCommandLoaded')
        .info('Loaded command', command.data.name);
});
