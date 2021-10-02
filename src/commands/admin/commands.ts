import {SlashCommand} from '@src/lib/util/SlashCommand';
import {ApplicationCommandType, MessageEmbed, Util} from 'discord.js';

export default new SlashCommand(
    {
        name: 'commands',
        description: 'Show all commands and their IDs',
        ownerOnly: true
    },

    (async (client, interaction) => {
        const typeMapping: Record<ApplicationCommandType, string> = {
            CHAT_INPUT: 'Slash Command',
            USER: 'User Command',
            MESSAGE: 'Message Command'
        };

        const commands = interaction.guild!.commands.cache.filter(c => c.applicationId === client.user?.id)
            .map(c => `${c.id} -> ${c.name} - ${typeMapping[c.type]}`)
            .join('\n');

        const split = Util.splitMessage(commands, {
            maxLength: 1000,
            char: '\n'
        });

        if (split.length === 1) {
            await interaction.reply({
                embeds: [
                    new MessageEmbed().setDescription(split[0])
                ]
            });
            return;
        }

        const embeds: MessageEmbed[] = [];

        for (const s of split) {
            embeds.push(new MessageEmbed().setDescription(s));
        }

        await client.util.paginate(interaction, embeds);

    })
);
