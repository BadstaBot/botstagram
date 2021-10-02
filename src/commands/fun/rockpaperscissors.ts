import {SlashCommand} from '@src/lib/util/SlashCommand';
import {GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, User} from 'discord.js';

type RockPaperScissorsPlay = 'Rock' | 'Paper' | 'Scissors';

export default new SlashCommand(
    {
        name: 'rps',
        description: 'Challenge a user to rock paper scissors',
        options: [
            {
                name: 'challenger',
                description: 'The user to challenge',
                type: 'USER',
                required: true
            }
        ]
    },

    (async (client, interaction) => {
        const challenger = interaction.options.getUser('challenger', true) as User;

        const challengerMember = await interaction.guild!.members.fetch(challenger).catch(() => {
        });

        if (!challengerMember) {
            return await interaction.reply({
                content: 'That user is not a member of this server.',
                ephemeral: true
            });
        }

        const embed = new MessageEmbed()
            .setDescription(`${interaction.user} has challenged you to a game of rock paper scissors`)
            .setFooter('Use the buttons below to accept or deny. You have 30 seconds.')
            .setColor(challengerMember.roles.color?.color || 'RANDOM');

        const buttons = [
            new MessageButton()
                .setLabel('Accept')
                .setCustomId('rpsAccept')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setLabel('Deny')
                .setCustomId('rpsDeny')
                .setStyle('DANGER')
        ];

        const winTable: Record<RockPaperScissorsPlay, RockPaperScissorsPlay[]> = {
            'Rock': ['Scissors'],
            'Paper': ['Rock'],
            'Scissors': ['Paper']
        };

        const msg = await interaction.reply({
            content: `${challengerMember}`,
            embeds: [embed],
            components: [new MessageActionRow().addComponents(buttons)],
            fetchReply: true
        }) as Message;

        let replied = false;
        setTimeout(async () => {
            if (replied) return;
            await interaction.editReply({
                embeds: [embed.setDescription('The request expired').setFooter('')],
                components: [new MessageActionRow().addComponents(buttons.map(b => b.setDisabled(true)))],
            });
        }, 3_000);

        const awaitedButton = await msg.awaitMessageComponent({
            componentType: 'BUTTON',
            filter: clicker => clicker.user.id === challenger.id
        });

        if (awaitedButton.customId === 'rpsDeny') {
            replied = true;
            await interaction.editReply({
                content: null,
                embeds: [embed.setDescription(`${challengerMember} Denied your request`).setFooter('')],
                components: []
            });
            return;
        }

        replied = true;

        const moveButtons = [
            new MessageButton()
                .setLabel('Rock')
                .setCustomId('rpsMoveRock')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setLabel('Paper')
                .setCustomId('rpsMovePaper')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setLabel('Scissors')
                .setCustomId('rpsMoveScissors')
                .setStyle('SECONDARY')
        ];

        const askChallengeeForTheirPlayEmbed = new MessageEmbed()
            .setDescription(`${interaction.user} choose your move`)
            .setFooter('Use the buttons below.')
            .setColor((interaction.member as GuildMember)!.roles.color?.color || 'RANDOM');

        await interaction.editReply({
            content: `${interaction.member}`,
            embeds: [askChallengeeForTheirPlayEmbed],
            components: [new MessageActionRow().addComponents(moveButtons)],
        });

    })
);
