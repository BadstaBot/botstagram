import {SlashCommand} from '@src/lib/util/SlashCommand';
import {GuildMember, User} from 'discord.js';
import {Logger} from '@src/lib/util/Logger';
import Centra = require('centra');

export default new SlashCommand(
    {
        name: 'bulkban',
        description: 'bulk ban users',
        botPerms: 'BAN_MEMBERS',
        userPerms: 'BAN_MEMBERS',
        requiresBot: true,
        options: [
            {
                name: 'haste',
                description: 'The key of the haste with the user ids',
                type: 'STRING',
                required: true
            },
            {
                name: 'reason',
                description: 'The reason for all the bans',
                type: 'STRING',
                required: false
            },
            {
                name: 'silent',
                description: 'If these punishments should be silent (the ban message wont be shown to other members)',
                type: 'BOOLEAN'
            }
        ]
    },

    async (client, interaction) => {
        const key = interaction.options.getString('haste', true);
        const reason = interaction.options.getString('reason', false) || 'No Reason Given';
        const silent = interaction.options.getBoolean('silent', false) || false;

        const res = await Centra(`https://hastebin.com/raw/${key}`).send();
        const text = await res.text();
        const failed: string[] = [];

        const ids = text.split('\n');

        await interaction.deferReply({ephemeral: silent});
        const promises: Promise<string | GuildMember | User>[] = [];
        for (const id of ids) {
            try {
                promises.push(interaction.guild!.members.ban(id, {reason: reason}));
            } catch (_) {
                failed.push(id);
            }
        }

        const [_, execTime] = await Logger.calcExecTime(async () => {
            await Promise.all(promises);
        });
        await interaction.editReply({
            content: `Banned ${ids.length - failed.length} users in ${execTime}ms. ${failed.length ? `Failed: ${failed.map(id => `\`${id}\``).join(', ')}` : ''}`
        });
    }
);
