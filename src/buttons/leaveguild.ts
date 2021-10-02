import {ButtonHandler} from '@src/lib/util/ButtonHandler';

export default new ButtonHandler('leaveguild:*', async (client, interaction) => {
    if (!client.util.isOwner(interaction.user)) {
        return await interaction.reply({
            content: 'You don\'t have permission to do this',
            ephemeral: true
        });
    }

    const split = interaction.customId.split(':');

    const guildID = split[1];

    const guild = client.guilds.resolve(guildID);

    if (!guild) {
        return await interaction.reply({
            content: 'Unknown Guild (probably already left)',
            ephemeral: true
        });
    }

    await guild.leave();

    return await interaction.reply({
        content: `Force Left ${guild.name}`,
        ephemeral: true
    });

});
