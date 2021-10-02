import {Event} from '@src/lib/util/Event';
import {noop} from '@src/lib/constants';
import {GuildMember, MessageEmbed, TextChannel} from 'discord.js';
import dayjs = require('dayjs');

export default new Event('guildMemberRemove', async (client, member) => {

    const modLog = (await client.prisma.guildConfig.findFirst({where: {gid: member.guild.id}}))!.modlog as string;

    member = member as GuildMember;
    if (!modLog) {
        return;
    }

    const modLogChannel = await member.guild.channels.fetch(modLog).catch(noop);


    if (!modLogChannel) {
        return;
    }

    const {user} = member;

    const embed = new MessageEmbed()
        .setColor(client.config.colors.error)
        .setTitle('Member Left')
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .addField('Creation Date', `${client.util.formatDate(user.createdAt)} (${client.util.humanize(dayjs().diff(user.createdAt))} ago)`)
        .addField('Join Date', `${client.util.formatDate(member.joinedTimestamp!)} (${client.util.humanize(dayjs().diff(member.joinedTimestamp))} ago)`)
        .addField('Roles', member.roles.cache.filter(r => r.id !== member.guild.roles.everyone.id).map(r => `${r}`).join(' - '));

    await (modLogChannel as TextChannel).send({
        embeds: [embed]
    });
});
