import {Event} from '@src/lib/util/Event';
import dayjs = require('dayjs');
import {registerSlashCommands} from '@base/scripts/register';
import {proc} from 'node-os-utils';
import {MessageActionRow, MessageButton} from 'discord.js';

export default new Event('ready', async (client) => {
    client.rollbar.log('hello world!');
    const logger = client.logger.forkInstance('Events/Ready');

    logger.info(`${client.user?.tag} Logged in`);

    // await client.loadUserCommands();
    // await client.loadMessageCommands();
    await client.loadButtons();
    await registerSlashCommands(client);


    logger.info([
        `Loaded ${client.slashCommands.size} slash commands`,
        `${client.buttonHandlers.size} button handlers`,
        `${client.userCommands.size} user commands`,
        `${client.messageCommands.size} Message commands`
    ].join(' | '));

    logger.debug(
        new MessageActionRow().setComponents([
            new MessageButton().setStyle('PRIMARY').setCustomId('selfRole:balance').setEmoji(':Dot_Balance:862433276480454706>'),
            new MessageButton().setStyle('PRIMARY').setCustomId('selfRole:bravery').setEmoji('<:Dot_Bravery:862433276424749086>'),
            new MessageButton().setStyle('PRIMARY').setCustomId('selfRole:brilliance').setEmoji('<:Dot_Brilliance:862433276495659019>'),
            new MessageButton().setStyle('PRIMARY').setCustomId('selfRole:fuchsia').setEmoji('<:Dot_Fuchsia:862433276396306502>'),
            new MessageButton().setStyle('PRIMARY').setCustomId('selfRole:green').setEmoji('<:Dot_Green:862433276598026240>')
        ]).toJSON()
    );

    logger.debug(
        new MessageActionRow().setComponents([
            new MessageButton().setStyle('PRIMARY').setCustomId('selfRole:yellow').setEmoji('<:Dot_Yellow:862433276483731466>'),
            new MessageButton().setStyle('PRIMARY').setCustomId('selfRole:streamPing').setEmoji('<:Mention:855680475792277534>'),
            new MessageButton().setStyle('PRIMARY').setCustomId('selfRole:announcements').setEmoji('<:Mention:855680475792277534>'),
        ]).toJSON()
    );

    logger.info(`Took ${client.util.humanize(dayjs().diff(client.started))}`);


    client.user?.setPresence({
        activities: [
            {
                name: `${client.slashCommands.size} commands loaded`,
                type: 'WATCHING'
            }
        ]
    });
}, {once: true});
