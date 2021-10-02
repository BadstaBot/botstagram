import {Event} from '@src/lib/util/Event';
import {
    ButtonInteraction,
    CommandInteraction,
    ContextMenuInteraction,
    GuildMember,
    Snowflake,
    TextChannel
} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import dayjs = require('dayjs');

export default new Event('interactionCreate', (async (client, i) => {
    if (i.isCommand()) {
        client.logger.forkInstance('events/interaction').debug(i.commandId);
        await handleSlashCommand(client, i, i.commandId);
    } else if (i.isButton()) {
        await handleButton(client, i, i.customId);
    } else if (i.isContextMenu()) {
        client.logger.forkInstance('events/interaction').debug(i.commandId);
        await handleContextCommand(client, i, i.id);
    }
}));

async function handleSlashCommand(client: BotClient, i: CommandInteraction, commandId: Snowflake) {
    const cmd = client.slashCommands.get(i.commandId);

    if (cmd) {

        if (!await runCmdChecks(client, i, commandId)) {
            return;
        }
        try {
            await cmd.func(client, i);

            if (cmd.data.cooldown && cmd.data.cooldown > 0) {
                client.cooldowns.set({
                    cid: i.commandId,
                    uid: i.user.id,
                    gid: i.guildId!
                }, {
                    command: cmd.data.name,
                    guildId: i.guildId!,
                    userId: i.user.id,
                    expire: dayjs().add(cmd.data.cooldown, 'seconds').toDate()
                });
            }
        } catch (e) {
            client.emit('commandError', i, cmd, e);
        }
    }
}

async function handleContextCommand(client: BotClient, i: ContextMenuInteraction, commandId: Snowflake) {

    if (i.targetType === 'USER') {
        const cmd = client.userCommands.get(i.commandId);
        if (!cmd) return;
        try {
            await cmd.func(client, i);
        } catch (e) {
            client.emit('commandError', i, cmd, e);
        }
    } else if (i.targetType === 'MESSAGE') {
        const cmd = client.messageCommands.get(i.commandId);
        if (!cmd) return;
        try {
            await cmd.func(client, i);
        } catch (e) {
            client.emit('commandError', i, cmd, e);
        }
    }


}

async function handleButton(client: BotClient, i: ButtonInteraction, customID: string) {
    const logger = client.logger.forkInstance('events/interaction');

    if (customID.includes(':')) {
        customID = customID.split(':')[0];
    }
    const handler = client.buttonHandlers.find((handler, key) => key.startsWith(customID));
    if (!handler) return;

    handler.func(client, i);
}


async function runCmdChecks(client: BotClient, i: CommandInteraction | ContextMenuInteraction, commandId: string): Promise<boolean> {
    const cmd = client.slashCommands.get(commandId) || client.userCommands.get(commandId) || null;

    if (!cmd) return false; // lol what

    if (cmd.data.requiresBot && !i.guild?.me) {
        await i.reply(`This command requires the bot to be in the server. [Invite](${client.invite(undefined, i.guildId!)})`);
        return false;
    }

    if (i.channel?.type === 'DM') {
        await i.reply('Commands can\'t be run in DMs.');
        return false;
    }

    try {
        const disabledCommands = (await client.prisma.guildConfig.findFirst({
            where: {
                gid: i.guildId!
            }
        }))!.disabledCommands;

        if (disabledCommands.includes(cmd.data.name)) {
            await i.reply('This command has been disabled in this server');
            return false;
        }
    } catch (e) {
        await i.reply(e);
        return false;
    }

    if (cmd.data.ownerOnly && !client.util.isOwner(i.user)) {
        await i.reply('Only the bot owner can run this command');
        return false;
    }

    if (cmd.data.nsfw && !(i.channel as TextChannel).nsfw) {
        await i.reply('This command can only be used in NSFW channels');
        return false;
    }

    if (cmd.data.botPerms && !i.guild!.me!.permissions.has(cmd.data.botPerms)) {
        await i.reply(`I am missing ${Array.isArray(cmd.data.userPerms) ? cmd.data.userPerms.map(p => `\`${p}\``).join(', ') : cmd.data.userPerms} permissions for that command`);
        return false;
    }

    if (cmd.data.userPerms && !(i.member as GuildMember).permissions.has(cmd.data.userPerms)) {
        await i.reply(`You am missing ${Array.isArray(cmd.data.userPerms) ? cmd.data.userPerms.map(p => `\`${p}\``).join(', ') : cmd.data.userPerms} permissions for that command`);
        return false;
    }

    const cooldownData = client.cooldowns.find(((value, key) => {
        return key.cid === commandId &&
            key.uid === i.user.id &&
            key.gid === i.guildId!;
    }));
    if (cooldownData && cooldownData.expire > new Date()) {
        await i.reply(`This command is on cooldown for another ${client.util.humanize(dayjs().diff(cooldownData.expire))}`);
        return false;
    }

    return true;
}
