import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageEmbed} from 'discord.js';
import {Logger} from '@src/lib/util/Logger';

export default new SlashCommand(
    {
        name: 'daily',
        description: 'Claim your daily reward',
        cooldown: 24 * 60 * 60,
        requiresBot: true
    },

    (async (client, interaction) => {
        const reward = client.util.randInt(1, 1000);

        // const newBalance = await client.prisma.economy.update({
        //     where: {
        //
        //     }
        // });



        const embed = new MessageEmbed()
            .setDescription('Daily')
            .setDescription(`You claimed your daily reward of $${reward}`);
            // .setFooter(`Your new balance is $${rows[0].hand_balance}`);

        await interaction.reply({
            embeds: [embed]
        });
    })
);
