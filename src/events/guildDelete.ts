import {Event} from '@src/lib/util/Event';
import {MessageEmbed, TextChannel} from 'discord.js';


export default new Event('guildDelete', (async (client, guild) => {


    client.prisma.guildConfig.delete({where: {gid: guild.id}});

    const channel = client.guilds
        .resolve('801506360872140841')!
        .channels
        .resolve('835230536863580231')! as TextChannel;

    const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Guild Left')
        .setDescription(guild.name);

    await channel.send({
        embeds: [embed]
    });
}));
