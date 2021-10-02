import {SlashCommand} from '@src/lib/util/SlashCommand';
import {cpu, mem} from 'node-os-utils';
import {MessageEmbed, version as djsVersion} from 'discord.js';
import {version as prismaVersion} from '@prisma/client/package.json';
import {version as pgVersion} from 'pg/package.json';
import {version as ksoftVersion} from 'ksoft.js/package.json';
import {stripIndents} from 'common-tags';
import dayjs = require('dayjs');

export default new SlashCommand(
    {
        name: 'stats',
        description: 'Show stats about the bot',
        ownerOnly: true
    },

    (async (client, interaction) => {
        await interaction.deferReply();


        const cpuUsage = await cpu.usage();
        const ramUsage = (await mem.used()).usedMemMb;
        const totalRam = (await mem.used()).totalMemMb;


        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`${client.user?.username} Info`)
            .addField('Process', stripIndents`
            **CPU Usage**: ${Math.round(cpuUsage)}%
            **RAM Usage**: ${Math.round(ramUsage).toLocaleString()}mb / ${Math.round(totalRam).toLocaleString()}mb (${Math.round((ramUsage / totalRam) * 100)}%)
            **Uptime**: ${client.util.humanize(dayjs().diff(client.readyTimestamp))}
            `, false)
            .addField('Stats', stripIndents`
            **Cached Users**: ${client.users.cache.size}
            **Guilds**: ${client.guilds.cache.size}
            **Slash Commands**: ${client.slashCommands.size}
            **User Commands**: ${client.userCommands.size}
            **Message Commands**: ${client.messageCommands.size}
            **Button Handlers**: ${client.buttonHandlers.size}
            `)
            .addField('Versions', stripIndents`
            **Discord.js**: ${djsVersion}
            **Prisma**: ${prismaVersion}
            **pg**: ${pgVersion}
            **KSoft.js**: ${ksoftVersion}
            `, false);

        await interaction.editReply({
            embeds: [embed]
        });
    })
);
