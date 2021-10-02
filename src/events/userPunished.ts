import {Event} from '@src/lib/util/Event';
import {ColorResolvable, Guild, MessageEmbed, TextChannel, User} from 'discord.js';
import {PunishmentType} from '@prisma/client';
import {stripIndents} from 'common-tags';

export default new Event('userPunished', (async (client, user: User, mod: User, guild: Guild, reason: string, type: PunishmentType, caseID: number, silent: boolean) => {

        const pastTenseForms: Record<PunishmentType, string> = {
            Ban: 'banned',
            Kick: 'kicked',
            Mute: 'muted',
            SoftBan: 'softbanned'
        };

        const embedColours: Record<PunishmentType, ColorResolvable> = {
            Ban: 'RED',
            SoftBan: 'RED',
            Kick: 'YELLOW',
            Mute: 'ORANGE'
        };

        const guildConfig = (await client.prisma.guildConfig.findFirst({where: {gid: guild.id}}))!;

        await user.send(`You have been **${pastTenseForms[type]}** in **${guild.name}** ${!guildConfig.hideMod ? `by **${mod.tag}**` : ''} `).catch(() => {});

        const modLogEmbed = new MessageEmbed()
            .setColor(embedColours[type])
            .setTitle(`User ${pastTenseForms[type]}`)
            .setDescription(stripIndents`
            >> **User**: ${user.tag} (\`${user.id}\`)
            >> **Moderator**: ${mod.tag} (\`${mod.id}\`)
            >> **Reason**: ${reason})
            `)
            .setFooter(`Case ID: ${caseID}`);

        const punishLogEmbed = new MessageEmbed(modLogEmbed)
            .setDescription(stripIndents`
            >> **User**: ${user.tag} (\`${user.id}\`)
            ${!guildConfig.hideMod ? `>> **Moderator**: ${mod.tag} (\`${mod.id}\`)` : ''}
            >> **Reason**: ${reason})
            `);

        if (guildConfig.modlog) {
            const channel = guild.channels.resolve(guildConfig.modlog) as TextChannel;
            if (!channel) return;

            if (!channel.permissionsFor(guild.me!).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return;

            await channel.send({
                embeds: [modLogEmbed]
            });
        }

        if (guildConfig.punishlog) {
            const channel = guild.channels.resolve(guildConfig.punishlog) as TextChannel;
            if (!channel) return;

            if (!channel.permissionsFor(guild.me!).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return;

            await channel.send({
                embeds: [punishLogEmbed]
            });
        }

    }
));
