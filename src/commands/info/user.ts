import {SlashCommand} from '@src/lib/util/SlashCommand';
import {
    CommandInteraction,
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Role,
    User
} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import {stripIndents} from 'common-tags';
import {MentionableType} from '@src/lib/constants';
import dayjs = require('dayjs');
import Centra = require('centra');
import {mem} from 'node-os-utils';

export default new SlashCommand(
    {
        name: 'user',
        description: 'User info',
        options: [
            {
                name: 'thing',
                type: 'MENTIONABLE',
                description: 'The thing to get info for'
            }
        ]
    },

    (async (client, interaction) => {

        let mentionable: MentionableType = interaction.options.getMentionable('thing') || interaction.user as User;

        if (interaction.isContextMenu()) {
            if (interaction.targetType === 'USER') {
                mentionable = interaction.options.getUser('user')!;
            } else {
                mentionable = await client.users.fetch(interaction.options.getMessage('message')!.author.id);
            }
        }

        if (mentionable instanceof User) {
            const member = interaction.guild?.members?.resolve(mentionable);
            if (member) {
                await _memberInfo(client, interaction, member);
                return;
            }
            await _userInfo(client, interaction, mentionable);
        } else if (mentionable instanceof GuildMember) {
            await _memberInfo(client, interaction, mentionable);
        } else if (mentionable instanceof Role) {
            await _roleInfo(client, interaction, mentionable);
        }
    })
);

async function _userInfo(client: BotClient, interaction: CommandInteraction, user: User): Promise<void> {
    const gBanned = await client.ksoft.bans.check(user.id);
    const pronouns = await _getPronouns(user.id);
    const embed = new MessageEmbed()
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .setDescription(client.util.parseUserFlags(user))
        .addField('» About', stripIndents`
        **Mention**: ${user}
        **ID**: ${user.id}
        **Created**: ${dayjs(user.createdAt).format('DD-MM-YYYY HH:mm:ss')}
        **Global Banned**: ${gBanned ? 'Yes' : 'No'}
        **Pronouns**: ${pronouns ? pronouns : 'Unknown'}
        `);

    const data = await _getProfileCustomizationData(client, user.id);
    if (data.banner) {
        embed.addField('» Banner', '\u200B', false).setImage(data.banner);
    }

    if (data.accent_color) {
        embed.setColor(data.accent_color!);
    }

    await interaction.reply({
        embeds: [embed]
    });
}

async function _memberInfo(client: BotClient, interaction: CommandInteraction, member: GuildMember): Promise<void> {
    const gBanned = await client.ksoft.bans.check(member.id);
    const roles = member.roles.cache.filter(r => r.name !== '@everyone');
    const rolesMentions = roles.map(r => `${r}`).join(' - ');
    const pronouns = await _getPronouns(member.id);

    const user = member.user;

    const embed = new MessageEmbed()
        .setColor(member.roles.color?.color ?? 0x202225)
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .setDescription(client.util.parseUserFlags(user))
        .addField('» About', stripIndents`
        **Mention**: ${user}
        **ID**: ${user.id}
        **Created**: ${client.util.formatDateRelative(user.createdAt)}
        **Joined**: ${client.util.formatDateRelative(member.joinedAt!)}
        **Global Banned**: ${gBanned ? 'Yes' : 'No'}
        **Pronouns**: ${pronouns ? pronouns : 'Unknown'}
        `, false)
        .addField(`» Roles [${roles.size}]`, rolesMentions || 'None', false);

    const data = await _getProfileCustomizationData(client, member.id);
    if (data.banner) {
        embed.addField('» Banner', '\u200B', false).setImage(data.banner);
    }

    await interaction.reply({
        embeds: [embed]
    });
}

async function _roleInfo(client: BotClient, interaction: CommandInteraction, role: Role): Promise<void> {

    const baseEmbed = new MessageEmbed().setColor(role.color || [153, 170, 181]);

    const basicInfoEmbed = new MessageEmbed(baseEmbed)
        .setTitle('Basic Information')
        .setDescription(stripIndents`
        >> **ID** ${role.id}
        >> **Name** ${role.name}
        >> **Colour** ${role.hexColor.toUpperCase()}
        >> **Creation** ${dayjs(role.createdAt).format('DD-MM-YYYY hh:mm:ss')}
        >> **Position** ${role.position}
        >> **Hoisted** ${role.hoist ? 'Yes' : 'No'}
        >> **Mentionable** ${role.mentionable ? 'Yes' : 'No'}
        >> **Managed** ${role.managed ? 'Yes' : 'No'}
        `);

    const permissionsEmbed = new MessageEmbed(baseEmbed)
        .setTitle('Permissions')
        .setDescription(stripIndents`
        ${client.util.parsePermissionString(role.permissions.toArray(), ', ')}
        `);

    const membersEmbed = new MessageEmbed(baseEmbed)
        .setTitle('Members')
        .setDescription(stripIndents`${role.members.map(m => `${m}`).join(' ')}`);

    const basicInfoButton = new MessageButton()
        .setLabel('Basic Info')
        .setStyle('SECONDARY')
        .setCustomId('basic_info_button')
        .setDisabled(true);

    const permissionsButton = new MessageButton()
        .setLabel('Permissions')
        .setStyle('SECONDARY')
        .setCustomId('permissions_button');

    const membersButton = new MessageButton()
        .setLabel('Members')
        .setStyle('SECONDARY')
        .setCustomId('members_button');


    const msg = await interaction.reply({
        embeds: [basicInfoEmbed],
        components: [new MessageActionRow().addComponents([basicInfoButton, permissionsButton, membersButton])],
        fetchReply: true
    }) as Message;

    const collector = msg.createMessageComponentCollector({
        filter: clicker => clicker.user.id === interaction.user.id,
        componentType: 'BUTTON',
        time: 300000 // 5 mins
    });

    collector.on('collect', (button) => {
        if (button.customId === 'basic_info_button') {
            basicInfoButton.setDisabled(true);
            permissionsButton.setDisabled(false);
            membersButton.setDisabled(false);

            button.update({
                embeds: [basicInfoEmbed],
                components: [new MessageActionRow().addComponents([basicInfoButton, permissionsButton, membersButton])],
            });
        } else if (button.customId === 'permissions_button') {
            basicInfoButton.setDisabled(false);
            permissionsButton.setDisabled(true);
            membersButton.setDisabled(false);

            button.update({
                embeds: [permissionsEmbed],
                components: [new MessageActionRow().addComponents([basicInfoButton, permissionsButton, membersButton])],
            });
        } else if (button.customId === 'members_button') {
            basicInfoButton.setDisabled(false);
            permissionsButton.setDisabled(false);
            membersButton.setDisabled(true);

            button.update({
                embeds: [membersEmbed],
                components: [new MessageActionRow().addComponents([basicInfoButton, permissionsButton, membersButton])],
            });
        }
    });

    collector.on('end', async () => {
        await interaction.editReply({
            components: [new MessageActionRow().addComponents(msg.components[0].components.map(c => (c as MessageButton).setDisabled(true)))]
        });
    });

}

async function _getProfileCustomizationData(client: BotClient, userID: string): Promise<ProfileCustomizationData> {
    const res = await Centra(`https://discord.com/api/users/${userID}`)
        .header('Authorization', `Bot ${client.token}`)
        .send();

    const json = await res.json();

    const {banner, banner_color, accent_color} = json;

    return {
        banner: banner ? `https://cdn.discordapp.com/banners/${userID}/${banner}.${banner.startsWith('a_') ? 'gif' : 'png'}?size=512` : null,
        accent_color: accent_color,
        banner_color: banner_color
    };
}

async function _getPronouns(id: string): Promise<string | null> {
    const mapping: Record<string, string> = {
        'unspecified': 'Unspecified',
        'hh': 'he/him',
        'hi': 'he/it',
        'hs': 'he/she',
        'ht': 'he/they',
        'ih': 'it/him',
        'ii': 'it/its',
        'is': 'it/she',
        'it': 'it/they',
        'shh': 'she/he',
        'sh': 'she/her',
        'si': 'she/it',
        'st': 'she/they',
        'th': 'they/he',
        'ti': 'they/it',
        'ts': 'they/she',
        'tt': 'they/them',
        'any': 'Any pronouns',
        'other': 'Other pronouns',
        'ask': 'Ask me my pronouns',
        'avoid': 'Avoid pronouns, use my name',
    };

    const res = await Centra('https://pronoundb.org/api/v1/lookup')
        .query('platform', 'discord')
        .query('id', id)
        .send();

    return res.statusCode === 404 ? null : mapping[(await res.json()).pronouns];
}

interface ProfileCustomizationData {
    banner: string | null;
    banner_color: string | null;
    accent_color: number | null;
}

