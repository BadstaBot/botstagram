import {SlashCommand} from '@src/lib/util/SlashCommand';

export default new SlashCommand(
    {
        name: 'disable',
        description: 'Disable a command',
        userPerms: 'MANAGE_GUILD',
        requiresBot: true,
        options: [
            {
                name: 'command',
                description: 'The command',
                required: true,
                type: 'STRING'
            }
        ]
    },

    (async (client, interaction) => {
        const name = interaction.options.getString('command', true);
        const cmd = client.getSlashCommand(name);

        if (!cmd) {
            return await interaction.reply('Unknown Command');
        }

        await client.prisma.guildConfig.update({
            where: {
                gid: interaction.guildId!
            },
            data: {
                disabledCommands: {
                    push: cmd.data.name
                }
            }
        });

        return await interaction.reply(`Disabled command ${cmd.data.name}`);


    })
);
