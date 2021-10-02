import {SlashCommand} from '@src/lib/util/SlashCommand';
import {PunishmentType} from '@prisma/client';

export default new SlashCommand(
    {
        name: 'kick',
        description: 'Kick a member',
        userPerms: 'KICK_MEMBERS',
        botPerms: 'KICK_MEMBERS',
        requiresBot: true,
        options: [
            {
                name: 'member',
                description: 'The member to kick',
                type: 'USER'
            },
            {
                name: 'reason',
                description: 'The reason',
                type: 'STRING'
            },
            {
                name: 'silent',
                description: 'If this punishment should be silent (the kick message wont be shown to other members)',
                type: 'BOOLEAN'
            }
        ]
    },

    async (client, interaction) => {
        const user = interaction.options.getUser('member', true);
        const reason = interaction.options.getString('reason', false) || 'No Reason Provided';
        const silent = interaction.options.getBoolean('silent', false) || false;

        const member = await interaction.guild!.members.fetch(user).catch(async _ => {
            return await interaction.reply({
                content: 'That user is not a member of this guild',
                ephemeral: silent
            });
        });

        if (typeof member === 'undefined') return;

        if (!member!.kickable) {

            await interaction.reply({
                content: 'That user can\'t be kicked',
                ephemeral: silent
            });
            return;

        }
        const res = await client.prisma.punishments.create({
            data: {
                gid: interaction.guild!.id,
                uid: user.id,
                mod: interaction.user.id,
                reason: reason,
                type: PunishmentType.Kick
            }
        });

        client.emit('userPunished', user, interaction.user, interaction.guild!, reason, PunishmentType.Kick, res.case_id, silent);

    }
);
