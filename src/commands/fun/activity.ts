import {SlashCommand} from '@src/lib/util/SlashCommand';
import {GuildMember, Message, MessageActionRow, MessageSelectMenu, StageChannel, VoiceChannel} from 'discord.js';
import {zws} from '@src/lib/constants';
import {InviteTargetType} from 'discord.js/typings/enums';

export default new SlashCommand(
    {
        name: 'activity',
        description: 'Start an activity in your voice channel',
        options: [
            {
                name: 'channel',
                description: 'The channel to make the activity in',
                type: 'CHANNEL',
                channelTypes: ['GUILD_VOICE'],
                required: true
            }
        ]
    },

    (async (client, interaction) => {

        const channel = interaction.options.getChannel('channel', true) as VoiceChannel;

        if (!interaction.guild!.me?.permissionsIn(channel ).has('CREATE_INSTANT_INVITE')) {
            await interaction.reply('I don\'t have permissions to make invites in that channel');
            return;
        }

        const select = new MessageSelectMenu()
            .setCustomId('activitySelectMenu')
            .setOptions([
                {
                    label: 'YouTube Together',
                    value: '880218394199220334',
                    emoji: '<:YouTube:328612276636483584>'
                },
                {
                    label: 'Fishington',
                    value: '814288819477020702',
                    emoji: '🎣'
                },
                {
                    label: 'Chess',
                    value: '832012774040141894',
                    emoji: '<:chess_black_rook:870434394878390322> '
                },
                {
                    label: 'Letter Tile',
                    value: '879863686565621790',
                    emoji: '🔡'
                },
                {
                    label: 'Betrayal',
                    value: '773336526917861400',
                    emoji: '<:betrayal:847852825812009020>'
                },
                {
                    label: 'Doodle',
                    value: '878067389634314250',
                    emoji: '✏️'
                },
                {
                    label: 'Poker',
                    value: '755827207812677713',
                    emoji: '<:poker_cards:839989105785307167>'
                },
            ]);

        const msg = await interaction.reply({
            content: zws,
            components: [new MessageActionRow().setComponents([select])],
            fetchReply: true
        }) as Message;

        const value = await msg.awaitMessageComponent({
            filter: i => {
                return i.user.id === interaction.user.id && i.customId === select.customId;
            },
            componentType: 'SELECT_MENU'
        });

        const inv = await channel.createInvite({
            targetApplication: value.values[0],
            targetType: InviteTargetType.EMBEDDED_APPLICATION,
        });

       await interaction.editReply({
           content: inv.url,
           components: []
       });
    })
);
