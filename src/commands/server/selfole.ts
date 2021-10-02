import {SlashCommand} from '@src/lib/util/SlashCommand';
import {
    CommandInteraction,
    GuildMember,
    Message,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction
} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import {zws} from '@src/lib/constants';

export default new SlashCommand(
    {
        name: 'selfrole',
        description: 'Manage or join selfroles',
        options: [
            {
                name: 'create',
                description: 'Create a self role',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'role',
                        description: 'The role',
                        type: 'ROLE',
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Remove a self role',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'role',
                        description: 'The role',
                        type: 'ROLE',
                        required: true
                    }
                ]
            },
            {
                name: 'join',
                description: 'Join roles',
                type: 'SUB_COMMAND',
            },
            {
                name: 'leave',
                description: 'Leave roles',
                type: 'SUB_COMMAND',
            },
            {
                name: 'list',
                description: 'List the self roles',
                type: 'SUB_COMMAND',
            }
        ]
    },

    (async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand(true);

        switch (subcommand) {
            case 'create':
                await _create(client, interaction);
                break;
            case 'remove':
                await _remove(client, interaction);
                break;
            case 'join':
                await _join(client, interaction);
                break;
            case 'leave':
                await _leave(client, interaction);
                break;
            case 'list':
                await _list(client, interaction);
                break;
        }
    })
);

const _create = async (client: BotClient, interaction: CommandInteraction) => {
    const role = interaction.options.getRole('role', true);

    await client.prisma.guildConfig.update({
        where: {gid: interaction.guildId!},
        data: {
            selfroles: {
                push: role.id
            }
        }
    });

    await interaction.reply({
        content: `Created self role ${role}`,
        allowedMentions: {
            parse: [],
        }
    });
};
const _remove = async (client: BotClient, interaction: CommandInteraction) => {
    const role = interaction.options.getRole('role', true);

    const currentRoles = (await client.prisma.guildConfig.findFirst({
        where: {gid: interaction.guildId!}
    }))!.selfroles;

    delete currentRoles[currentRoles.indexOf(role.id)];

    await client.prisma.guildConfig.update({
        where: {gid: interaction.guildId!},
        data: {
            selfroles: currentRoles
        }
    });
};


const _join = async (client: BotClient, interaction: CommandInteraction) => {
    const roleIds = (await client.prisma.guildConfig.findFirst({
        where: {gid: interaction.guildId!}
    }))!.selfroles;

    const roles = roleIds.map(id => interaction.guild!.roles.resolve(id)).filter(r => r !== null);
    const selectMenu = new MessageSelectMenu()
        .setPlaceholder('Use this dropdown to select your role(s)')
        .setMaxValues(roles.length)
        .setCustomId('selfroleJoin')
        .setMinValues(1);

    for (const role of roles) {
        if (!role) return;

        selectMenu.addOptions({
            label: `@${role.name}`,
            value: role.id
        });
    }

    const msg = await interaction.reply({
        content: zws,
        components: [new MessageActionRow().addComponents([selectMenu])],
        ephemeral: true,
        fetchReply: true
    }) as Message;

    const awaitedSelect = await msg.awaitMessageComponent({
        filter: args => args.user.id === interaction.user.id && args.customId === 'selfroleJoin',
        componentType: 'SELECT_MENU'
    }) as SelectMenuInteraction;

    const rolesToGive = awaitedSelect.values.map(id => interaction.guild!.roles.resolve(id)).filter(r => r !== null).map(r => r!);

    await (interaction.member as GuildMember).roles.add(rolesToGive).catch(() => {
        interaction.editReply({
            content: 'Failed to join 1 or more roles (maybe my highest role is below it)',
            components: [],
        });
    });

    await interaction.editReply({
        content: `You joined ${rolesToGive.map(r => `${r}`)}`,
        components: [],
        allowedMentions: {parse: []}
    });
};

const _leave = async (client: BotClient, interaction: CommandInteraction) => {

};

const _list = async (client: BotClient, interaction: CommandInteraction) => {

};
