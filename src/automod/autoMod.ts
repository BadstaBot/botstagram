import {GuildMember, Message, MessageEmbed, TextChannel} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import {weirdToNormalChars as normalize} from 'weird-to-normal-chars';

export class AutoMod {
    public static async deCancer(member: GuildMember) {
        if (!member.user.username.match(/[\w\d]/gi)) {
            await member.setNickname('[moderated nickname]').catch(() => {
            });
            return true;
        }

        return false;
    }

    public static async wordFilter(client: BotClient, message: Message) {
        const cfg = (await client.prisma.guildConfig.findFirst({
            where: {
                gid: message.guildId!
            }
        }))!;
        if (!cfg.wordFilterEnabled) {
            return;
        }

        const content = normalize(message.content);

        for (const word of cfg.wordFilter) {
            if (content.includes(word)) {
                await message.delete();

                await message.channel.send(`${message.author} You can't say that word here.`);

                const modLogId = cfg.modlog;
                if (!modLogId) return;
                const modLogChannel = message.guild!.channels.resolve(modLogId);

                const embed = new MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setTitle('Auto-Mod Notification')
                    .setDescription(`Blocked word sent by ${message.author}`)
                    .addField('Message', content.replace(word, `__**${word}**__`));

                    (modLogChannel as TextChannel)?.send({
                        embeds: [embed]
                    });
            }
        }
    }
}
