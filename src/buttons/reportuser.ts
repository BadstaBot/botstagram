import {ButtonHandler} from '@src/lib/util/ButtonHandler';
import {ReportActionType} from '@src/lib/constants';
import {BotClient} from '@src/lib/BotClient';
import {ButtonInteraction, GuildMember, Message} from 'discord.js';

export default new ButtonHandler('user_report:*', (async (client, interaction) => {
    const split = interaction.customId.split(':');

    client.logger.forkInstance('buttons/reportuser').debug(`[${split.join(', ')}]`);

    const action = split[1] as ReportActionType;
    const guildId = split[2];
    const userId = split[3];
    const reason = split[4];

    const guild = client.guilds.resolve(guildId);
    const member = guild?.members.resolve(userId);

    switch (action) {
        case 'ban':
            await _ban(client, interaction, reason, member);
            break;
        case 'kick':
            await _kick(client, interaction, reason, member);
            break;
        case 'mute':
            await _mute(client, interaction, reason, member);
            break;
        case 'warn':
            await _warn(client, interaction, reason, member);
            break;
        case 'ignore':
            await _ignore(client, interaction, reason, member);
            break;
    }
}));

async function _ban(client: BotClient, interaction: ButtonInteraction, reason: string, member?: GuildMember | null) {
    setTimeout(() => (interaction.message as Message).delete(), 30_000); // 30 secs


    try {
        await member?.ban({
            days: 7,
            reason: reason
        });

    } catch (err) {
        await interaction.reply({
            content: `:x: Failed to ban ${member?.user.tag}: ${err}`,
            ephemeral: true
        });
    }

    await interaction.reply({
        content: `${member?.user.tag} was kicked.`,
        fetchReply: true
    }).then(() => setTimeout(() => {
        interaction.deleteReply();
    }, 5_000));
}

async function _kick(client: BotClient, interaction: ButtonInteraction, reason: string, member?: GuildMember | null) {

    setTimeout(() => (interaction.message as Message).delete(), 30_000); // 30 secs
    try {
        await member?.kick(reason);
    } catch (err) {
        await interaction.reply({
            content: `:x: Failed to kick ${member?.user.tag}: ${err}`,
            ephemeral: true
        });
    }

    await interaction.reply({
        content: `${member?.user.tag} was kicked.`,
        fetchReply: true
    }).then(() => setTimeout(() => {
        interaction.deleteReply();
    }, 5_000));
}

async function _mute(client: BotClient, interaction: ButtonInteraction, reason: string, member?: GuildMember | null) {
    setTimeout(() => (interaction.message as Message).delete(), 30_000); // 30 secs


    await interaction.reply({
        content: 'This feature is not yet implemented.',
        ephemeral: true
    });
}

async function _warn(client: BotClient, interaction: ButtonInteraction, reason: string, member?: GuildMember | null) {
    setTimeout(() => (interaction.message as Message).delete(), 30_000); // 30 secs


    await interaction.reply({
        content: `Warned ${member?.user.tag}`
    }).then(() => setTimeout(() => {
        interaction.deleteReply();
    }, 5_000));
}

async function _ignore(client: BotClient, interaction: ButtonInteraction, reason: string, member?: GuildMember | null) {
    setTimeout(() => (interaction.message as Message).delete(), 30_000); // 30 secs

    await interaction.reply({
        content: 'Report ignored (no action was taken.)',
        fetchReply: true
    }).then(() => setTimeout(() => {
        interaction.deleteReply();
    }, 5_000));
}
