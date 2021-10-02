import {SlashCommand} from '@src/lib/util/SlashCommand';

export default new SlashCommand(
    {
        name: 'enable',
        description: 'Enable a command',
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

        const currentlyDisabled = (await client.prisma.guildConfig.findFirst({
            where: {
                gid: interaction.guildId!
            }
        }))!.disabledCommands;

        const index = currentlyDisabled.indexOf(cmd.data.name);

        delete currentlyDisabled[index];


        await client.prisma.guildConfig.update({
            where: {
                gid: interaction.guildId!
            },
            data: {
                disabledCommands: currentlyDisabled
            }
        });

        return await interaction.reply(`Enabled command ${cmd.data.name}`);


    })
);
