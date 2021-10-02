import {SlashCommand} from '@src/lib/util/SlashCommand';
import {stripIndents} from 'common-tags';
import {GuildMember, MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'guild',
        description: 'Get info about the guild',
    },

    (async (client, interaction) => {
        const guild = interaction.guild!;
        const channels = guild.channels.cache;
        const text = channels.filter(c => c.type === 'GUILD_TEXT').size;
        const voice = channels.filter(c => c.type === 'GUILD_VOICE').size;
        const stage = channels.filter(c => c.type === 'GUILD_STAGE_VOICE').size;
        const announcement = channels.filter(c => c.type === 'GUILD_NEWS').size;
        const allTypes = [
            `<:ChannelText:779036156175188001> ${text}`,
            `<:channelvoice:794243248444407838>  ${voice}`,
            `<:channelstage:831890012366307379>   ${stage}`,
            `<:ChannelAnnouncements:779042577114202122>  ${announcement}`,
        ].join(', ');

        const verifLevel = client.util.parseVerificationLevel(guild);
        const contentFilter = client.util.parseExplicitFilterLevel(guild);
        const mfaLevel = client.util.parseMfaLevel(guild);
        const defaultNotifs = client.util.parseNotificationLevel(guild);
        const features = client.util.parseGuildFeatures(guild);
        const roles = guild.roles.cache.filter(r => r.id !== guild.roles.everyone.id);
        const roleMentions = roles.map(r => `${r}`).join(' - ');

        const aboutValue = stripIndents`
        **Owner**: ${(await guild.fetchOwner()).user.tag}
        **Creation**: ${client.util.formatDateRelative(guild.createdAt)} 
        **Members**: ${guild.approximateMemberCount || 0} 
        **Online**: ${guild.approximatePresenceCount || 0} 
        **Channels**: ${channels.size} (${allTypes}) 
        `;

        const securityValue = stripIndents`
        **Verification Level**: ${verifLevel}
        **Content Filter**: ${contentFilter} 
        **Default Notifications**: ${defaultNotifs} 
        **Two-Factor Auth**: ${mfaLevel}
        `;

        const embed = new MessageEmbed()
            .setColor((interaction.member as GuildMember).roles.color?.color || 'RANDOM')
            .setAuthor(guild.name, guild.iconURL({dynamic: true}) || undefined)
            .addField('» About', aboutValue, false)
            .addField('» Security', securityValue, false)
            .addField('» Features', features, false)
            .addField(`» Roles [${roles.size}]`, roleMentions.substr(0, 1024), false);

        await interaction.reply({
            embeds: [embed]
        });

    })
);
