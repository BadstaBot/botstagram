import {Event} from '@src/lib/util/Event';

export default new Event('userCommandLoaded', async (client, command) => {
    client.logger.forkInstance('Events/userCommandLoaded')
        .info('Loaded command', command.data.name);
});
