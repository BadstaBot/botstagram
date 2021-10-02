import {Event} from '@src/lib/util/Event';

export default new Event('commandError', async (client, interaction, command, error) => {


    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
            content: `${error.name}: ${error.message}`,
            embeds: [],
            components: []
        });
    } else {
        await interaction.reply({
            content: `${error.name}: ${error.message}`,
            embeds: [],
            components: [],
            ephemeral: true
        });
    }
    if (client.config.env === 'development') {
        client.logger.forkInstance(`events/commandError (${command.data.name})`).error(error);
    } else {
        client.rollbar.error(error);
    }
});
