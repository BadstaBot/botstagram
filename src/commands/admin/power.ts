import {SlashCommand} from '@src/lib/util/SlashCommand';
import {Message, MessageActionRow, MessageEmbed, MessageSelectMenu} from 'discord.js';
import {execSync} from 'child_process';
import {os} from 'node-os-utils';

export default new SlashCommand(
    {
        name: 'power',
        description: 'Manage the bots power state',
        ownerOnly: true
    },

    (async (client, interaction) => {

        const select = new MessageSelectMenu()
            .addOptions([
                {
                    label: 'Stop',
                    value: 'stop',
                    description: `Stop ${client.user!.username} and all its associated processes`
                },
                {
                    label: 'Restart',
                    value: 'restart',
                    description: `Restart ${client.user!.username} and all its associated processes`

                },
                {
                    label: 'System Power Off',
                    value: 'sysStop',
                    description: 'Power off the system'

                },
                {
                    label: 'System Restart',
                    value: 'sysRestart',
                    description: 'Restart the system'
                },
                {
                    label: 'Database Stop',
                    value: 'dbStop',
                    description: 'Stop the database. This will break everything.'
                },
                {
                    label: 'Database Restart',
                    value: 'dbRestart',
                    description: 'Restart the database',
                },
            ])
            .setCustomId('powerMenu');

        const msg = await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`${client.user!.username} Power Menu`)
                    .setDescription('Select an option below')
            ],
            components: [
                new MessageActionRow().setComponents([select])
            ],
            fetchReply: true
        }) as Message;

        const awaitedSelect = await msg.awaitMessageComponent({
            componentType: 'SELECT_MENU',
            filter: args => args.user.id === interaction.user.id
        });

        const value = awaitedSelect.values[0] as 'stop'
            | 'restart'
            | 'sysStop'
            | 'sysRestart'
            | 'dbStop'
            | 'dbRestart';
        const embed = new MessageEmbed();

        if (value === 'stop') {
            await interaction.editReply({
                embeds: [embed.setDescription('Stopping the bot and all associated processes...')],
                components: []
            });
            execSync('docker stop db');
            execSync('pm2 stop 0');
        } else if (value === 'restart') {
            await interaction.editReply({
                embeds: [embed.setDescription('Restarting the bot and all associated processes...')],
                components: []
            });
            execSync('docker restart db');
            execSync('pm2 restart 0');
        } else if (value === 'sysStop') {
            await interaction.editReply({
                embeds: [embed.setDescription('Shutting down the system...')],
                components: []
            });
            execSync(os.platform() === 'win32' ? 'shutdown /p' : 'poweroff');
        } else if (value === 'dbRestart') {
            await interaction.editReply({
                embeds: [embed.setDescription('Restarting the database...')],
                components: []
            });
            execSync('docker restart db');
        } else if (value === 'dbStop') {
            await interaction.editReply({
                embeds: [embed.setDescription('Shutting down the database...')],
                components: []
            });
            execSync('docker stop db');
        }
    })
);
