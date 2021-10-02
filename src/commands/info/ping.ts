import {SlashCommand} from '@src/lib/util/SlashCommand';
import {Message, MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'pong',
        description: 'Pong! (this one works lol)',
    },

    (async (client, interaction) => {
        const msg = await interaction.reply({
            embeds: [new MessageEmbed().setColor('RANDOM').setTitle('Pong!').setDescription('Pinging...')],
            fetchReply: true
        }) as Message;


        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor(msg.embeds[0].color || 'RANDOM')
                    .setTitle('Pong!')
                    .setDescription(`${client.ws.ping}ms`)
            ]
        });
    })
);
