import {ButtonHandler} from '@src/lib/util/ButtonHandler';
import {CategoryChannel, MessageEmbed} from 'discord.js';

export default new ButtonHandler('IRLFriendApplyButton', (async (client, interaction) => {

    const category = interaction.guild!.channels.resolve('877273135811022908')! as CategoryChannel;

    client.logger.debug(`${category.children.find(ch => ch.name === `irl-friend-${interaction.user.username}`)}`);

    if (category.children.find(ch => ch.name === `irl-friend-${interaction.user.username}`)) {
        await interaction.reply({
            content: 'You already have an open application.',
            ephemeral: true
        });
        return;
    }

    const questions = [
        '**1)** What is your irl name (this won\'t be shared outside this application unless you choose for it to be)?',
        '**2)** Where do you know Alex from?'
    ];
    const role = interaction.guild!.roles.resolve('771369804166725673')!;

    const channel = await interaction.guild!.channels.create(`irl-friend-${interaction.user.username}`, {
        parent: category,
        permissionOverwrites: [
            {
                id: interaction.user.id,
                type: 'member',
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }
        ]
    });

    await interaction.reply({
        content: `Follow the instructions in ${channel} to apply for the role`,
        ephemeral: true
    });

    const instructionEmbed = new MessageEmbed()
        .setTitle('Instructions')
        .setDescription('Answer the following questions')
        .setColor(role.color);

    const questionEmbed = new MessageEmbed()
        .setTitle('Questions')
        .setDescription(questions.join('\n'))
        .setColor(role.color);

    await channel.send({
        content: `${interaction.user}`,
        embeds: [instructionEmbed, questionEmbed]
    });
}));
