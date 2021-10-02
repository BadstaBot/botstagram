import {Event} from '@src/lib/util/Event';
import {AntiScam} from '@src/automod/antiScam';
import {AutoMod} from '@src/automod/autoMod';
import {noop} from '@src/lib/constants';
import {MessageEmbed, TextChannel} from 'discord.js';
import {Logger} from '@src/lib/util/Logger';
import dayjs = require('dayjs');


export default new Event('guildMemberAdd', async (client, member) => {

    if (await new AntiScam(member).run()) {
        return;
    }

    await AutoMod.deCancer(member);

    const raidModeEnabled = (await client.prisma.guildConfig.findFirst({where: {gid: member.guild.id}}))!.raidmodeEnabled;

    if (raidModeEnabled) {
        await member.send(`You can not join ${member.guild.name} at the moment because raid mode is currently enabled.`);
        await member.kick('Raid mode enabled');
        return;
    }

    client.prisma.$queryRaw`INSERT INTO economy (uid, gid) VALUES (${member.guild.id}, ${member.id})`;

    const modLog = (await client.prisma.guildConfig.findFirst({where: {gid: member.guild.id}}))!.modlog as string;

    if (!modLog) {
        return;
    }

    const modLogChannel = await member.guild.channels.fetch(modLog).catch(noop);


    if (!modLogChannel) {
        return;
    }

    const {user} = member;

    const embed = new MessageEmbed()
        .setColor(client.config.colors.success)
        .setTitle('Member Joined')
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .addField('Creation Date', `${client.util.formatDate(user.createdAt)} (${client.util.humanize(dayjs().diff(user.createdAt))} ago)`);

    await (modLogChannel as TextChannel).send({
        embeds: [embed]
    });
});

