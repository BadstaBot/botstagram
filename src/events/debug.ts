import {Event} from '@src/lib/util/Event';

export default new Event('debug', ((client, message) => {
    if (!client.config.development) return;

    client.logger.forkInstance('debug').debug(message);
}));
