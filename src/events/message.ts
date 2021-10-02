import {Event} from '@src/lib/util/Event';
import {AutoMod} from '@src/automod/autoMod';
import {BotClient} from '@src/lib/BotClient';
import {Message, MessageEmbed} from 'discord.js';
import {nameMapping, ProfileKey, pronounMapping, PronounPage, titleMapping} from '@src/lib/interfaces/pronounPage';
import {zws} from '@src/lib/constants';
import Centra = require('centra');
import dayjs = require('dayjs');

export default new Event('messageCreate', async (client, message) => {
    await AutoMod.wordFilter(client, message);
    await _showPronouns(client, message);
    await _checkAfk(client, message);
    await _unmarkAfk(client, message);
});

const _showPronouns = async (client: BotClient, message: Message) => {
    if (message.author.bot) return;

    const re = new RegExp('(?<url>https?:\\/\\/(?<lang>de|es|en|fr|nl|no|pt|zh)\\.pronouns\\.page\\/(?<username>@.*))');

    if (!re.test(message.content)) {
        return;
    }

    const groups = re.exec(message.content)?.groups;


    const usernameMatch = groups?.username.substr(1);
    const langMatch = groups!.lang!;

    const res = await Centra(`https://${langMatch}.pronouns.page/api/profile/get/${usernameMatch}`).send();

    const json = (await res.json()) as PronounPage;
    if (!(langMatch in json.profiles)) {
        return;
    }
    const {avatar, username} = json;

    const {pronouns, names, words, flags, description} = json.profiles[langMatch as ProfileKey];
    const title1 = words[0];
    const title2 = words[1];
    const title3 = words[2];

    let prns = '';
    let nameStr = '';
    let title1Str = '';
    let title2Str = '';
    let title3Str = '';

    const prnKeys = Object.keys(pronouns);
    const nameKeys = Object.keys(names);
    const title1Keys = Object.keys(title1);
    const title2Keys = Object.keys(title2);
    const title3Keys = Object.keys(title3);

    for (const key of prnKeys) {
        prns += `${pronounMapping[pronouns[key]]} ${key}\n`;
    }
    const embed = new MessageEmbed()
        .setTitle(username)
        .setURL(groups?.url || '')
        .setThumbnail(avatar)
        .setDescription(description)
        .addField('Flags', flags.join(', '), false)
        .addField('Pronouns', prns, true);
    // .addField(zws, zws, true)
    // .addField(zws, zws, true);

    for (const key of nameKeys) {
        nameStr += `${nameMapping[names[key]]} ${key}\n`;

    }
    for (const key of title1Keys) {
        title1Str += `${titleMapping[title1[key]]} ${key}\n`;
    }
    for (const key of title2Keys) {
        title2Str += `${titleMapping[title2[key]]} ${key}\n`;
    }
    for (const key of title3Keys) {
        title3Str += `${titleMapping[title3[key]]} ${key}\n`;

    }

    if (nameStr.length !== 0) {
        embed.addField('Names', nameStr, true);
        // embed.addField(zws, zws, true);
        embed.addField(zws, zws, true);
    }

    if (title1Str.length !== 0) {
        embed.addField('Titles Page 1', title1Str, true);
    }
    if (title2Str.length !== 0) {
        embed.addField('Titles Page 2', title2Str, true);
    }
    if (title3Str.length !== 0) {
        embed.addField('Titles Page 3', title3Str, true);
    }

    await message.channel.send({embeds: [embed]});
};

const _checkAfk = async (client: BotClient, message: Message) => {
    if (message.author.id === client.user!.id) return;

    const userMentions = message.mentions.users;

    for (const [_, user] of userMentions) {
        const res = await client.prisma.afkUsers.findFirst({
            where: {
                uid: user.id
            }
        });

        if (!res) continue;

        await client.db.query('UPDATE afk_users SET pings_received = pings_received + 1 WHERE uid = $1 AND gid = $2', [user.id, message.guildId]);

        await message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle('AFK')
                    .setDescription(`${user} is AFK. ${res.reason ?? ''}`)
            ]
        });
    }
};

const _unmarkAfk = async (client: BotClient, message: Message) => {
    const res = await client.prisma.afkUsers.findFirst({
        where: {
            uid: message.author.id
        }
    });

    if (!res) return;

    await message.reply({
        embeds: [
            new MessageEmbed()
                .setTitle('Welcome Back')
                .setDescription(`You received **${res.pingsReceived}** pings while you were away`)
                .setFooter(`You were away for ${client.util.humanize(dayjs().diff(res.since))}`)
        ]
    });

    await client.prisma.afkUsers.delete({
        where: {
            id: res.id
        }
    });
};
