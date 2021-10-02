import {Event} from '@src/lib/util/Event';
import {MessageActionRow, MessageButton, MessageEmbed, TextChannel} from 'discord.js';


export default new Event('guildCreate', (async (client, guild) => {

    client.prisma.guildConfig.create({
        data: {
            gid: guild.id
        }
    });


    const channel = (await client.guilds
        .fetch('801506360872140841'))
        .channels
        .resolve('835230536863580231')! as TextChannel;

    const embed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('Guild Joined')
        .setDescription(guild.name);

    await channel.send({
        embeds: [embed],
        components: [
            new MessageActionRow({
                components: [
                    new MessageButton()
                        .setLabel('Leave')
                        .setStyle('DANGER')
                        .setCustomId(`leaveguild:${guild.id}`)
                ]
            })
        ]
    });
}));
