import {SlashCommand} from '@src/lib/util/SlashCommand';

export default new SlashCommand(
    {
        name: 'pong',
        description: 'Pong! (this one works lol)',
        cooldown: 24 * 60 * 60
    },

    (async (client, interaction) => {
        const members = interaction.guild!.members.cache.filter(m => !m.user.bot);

        for (const [_, m] of members) {
           await client.db.query('INSERT INTO economy (uid, gid) VALUES ($1, $2)', [
                m.id,
                m.guild.id
            ]);
        }

    })
);
