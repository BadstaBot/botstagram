import {SlashCommand} from '@src/lib/util/SlashCommand';
import {ActivityType} from 'discord.js';

export default new SlashCommand(
    {
        name: 'presence',
        description: 'Update the bots presence',
        ownerOnly: true,
        options: [
            {
                name: 'type',
                description: 'the type of presence',
                type: 'STRING',
                choices: [
                    {
                        name: 'Playing',
                        value: 'PLAYING'
                    },
                    {
                        name: 'Streaming',
                        value: 'STREAMING'
                    },
                    {
                        name: 'Listening',
                        value: 'LISTENING'
                    },
                    {
                        name: 'Watching',
                        value: 'WATCHING'
                    },
                    {
                        name: 'Competing',
                        value: 'COMPETING'
                    },
                ],
                required: true
            },
            {
                name: 'value',
                description: 'the value of the new presence',
                type: 'STRING',
                required: true
            }
        ]
    },

    (async (client, interaction) => {
        const type = interaction.options.getString('type', true) as Exclude<ActivityType, 'CUSTOM'>;
        const value = interaction.options.getString('value', true);

        await client.user!.setPresence({
            activities: [
                {
                    name: value,
                    type: type
                }
            ]
        });

        await interaction.reply('Set The bot\'s presence.');
    })
);
