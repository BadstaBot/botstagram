import {SlashCommand} from '@src/lib/util/SlashCommand';

export default new SlashCommand(
    {
        name: 'afk',
        description: 'Mark yourself as AFK',
        options: [
            {
                name: 'reason',
                description: 'The reason for going afk',
                type: 'STRING',
                required: false
            }
        ]
    },

    (async (client, interaction) => {
        const reason = interaction.options.getString('reason', false);

        await client.prisma.afkUsers.create({
            data: {
                uid: interaction.user.id,
                gid: interaction.guildId!,
                reason: reason
            }
        });


        await interaction.reply({
            content: 'You have been marked as AFK. Send a message to remove your AFK status.',
            ephemeral: true
        });
    })
);
