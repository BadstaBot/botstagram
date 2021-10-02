import 'module-alias/register';

import {BotClient} from '@src/lib/BotClient';
import {config} from '@src/lib/config';
import * as Sentry from '@sentry/node';
import {Integrations} from '@sentry/tracing';
import {Logger} from '@src/lib/util/Logger';
import {version as DiscordJSVersion} from 'discord.js';
import {version as PGVersion} from 'pg/package.json';
import {version as PrismaVersion} from '@prisma/client/package.json';
import {registerAllCommands} from '@base/scripts/register';


const client = new BotClient();


(async function login() {
    await client.loadEvents().catch(err => client.logger.error(err));

    if (process.argv[2] === '--re-register') {
        new Logger('index').debug('Re-registering all commands before launching... This might take some time...');
        await registerAllCommands(client);

    }
    await client.login(config.secrets.discord).catch((err) => client.logger.error(err));
})();




Logger.calcExecTime(async () => {
    Sentry.init({
        dsn: client.config.secrets.sentry,
        release: client.config.development ? 'Development' : 'Production',
        environment: process.env.NODE_ENV,
        integrations: [
            new Integrations.Postgres({usePgNative: true})
        ]
    });

    Sentry.setContext('Botstagram', {
        'Discord.JS': DiscordJSVersion,
        'pg': PGVersion,
        'prisma': PrismaVersion
    });
})
    .then(([_, execTime]) => {
        new Logger('Sentry').debug('Initialized Sentry', `+${execTime}ms`);
    });


process.on('unhandledRejection', ((reason: Error) => {
    client.logger.error(reason);
}));

process.on('uncaughtException', ((reason: Error) => {
    client.logger.error(reason);
}));


