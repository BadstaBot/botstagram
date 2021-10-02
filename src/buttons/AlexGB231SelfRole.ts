import {ButtonHandler} from '@src/lib/util/ButtonHandler';
import {GuildMember, Snowflake} from 'discord.js';
import {Logger} from '@src/lib/util/Logger';

export default new ButtonHandler('selfRole:*', async (client, interaction) => {
    const roleMapping: Record<string, Snowflake> = {
        'balance': '893664981260861481',
        'bravery': '893665008322510879',
        'brilliance': '893665025678532639',
        'fuchsia': '893665048940138546',
        'green': '893665076698038322',
        'yellow': '893665093299101726',
        'streamPing': '893665115273060363',
        'announcements': '893665144566067200',
    };

    const onlyOneAllowedRoles = [
        'balance',
        'bravery',
        'brilliance',
        'fuchsia',
        'green',
        'yellow',
    ];

    const multipleAllowed = [
        'streamPing',
        'announcements',
    ];

    const member = interaction.member as GuildMember;

    const split = interaction.customId.split(':');
    const roleName = split[1];

    const role = await interaction.guild!.roles.fetch(roleMapping[roleName]);

    if (member.roles.cache.has(role!.id)) {
        new Logger('buttons/AlexGB231SelfRole').debug('aaaa');
        await interaction.reply({
            content: `You left ${role!}`,
            ephemeral: true
        }); // this doesnt work

        await member.roles.remove(role!); // but this does
        return;
    }

    const roleToRemove = member.roles.cache.find((r, _) => onlyOneAllowedRoles.includes(r.name.toLowerCase()) && !multipleAllowed.includes(r.name.toLowerCase()));

    if (roleToRemove) {
        await member.roles.remove(roleToRemove);
    }

    await member.roles.add(role!);

    await interaction.reply({
        content: `You joined ${role}${roleToRemove ? ` and left ${roleToRemove}.` : '.'}`,
        ephemeral: true
    });
});
