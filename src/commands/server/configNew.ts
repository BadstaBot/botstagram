import {SlashCommand} from '@src/lib/util/SlashCommand';
import {
    CommandInteraction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
    SelectMenuInteraction
} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';

export default new SlashCommand(
    {
        name: 'config_new', // TODO: rename this
        description: 'Edit server config',
    },

    (async (client, interaction) => {
        const select = new MessageSelectMenu()
            .setCustomId('configSelect')
            .addOptions([
                {
                    label: 'Logging',
                    value: 'logging',
                    description: 'Edit logging channels'
                },
                {
                    label: 'Auto-Mod',
                    value: 'auto-mod',
                    description: 'Edit the auto-mod'
                }
            ]);

        const msg = await interaction.reply({
            content: 'Use the select menu to chose a config category to edit',
            components: [
                new MessageActionRow().addComponents([select])
            ],
            fetchReply: true
        }) as Message;

        const awaitedSelect = (await msg.awaitMessageComponent({
            filter: args => args.user.id === interaction.user.id,
            componentType: 'SELECT_MENU'
        })) as SelectMenuInteraction;

        if (awaitedSelect.values[0] === 'logging') {
            await _logging(client, interaction, awaitedSelect);
        } else if (awaitedSelect.values[0] === 'auto-mod') {
            await _autoMod(client, interaction, awaitedSelect);
        }

    })
);

async function _logging(client: BotClient, cmdInteraction: CommandInteraction, selectInteraction: SelectMenuInteraction) {
    const buttons = [
        new MessageButton()
            .setLabel('Add Channel')
            .setCustomId('addChannel')
            .setStyle('SUCCESS'),
        new MessageButton()
            .setLabel('Remove Channel')
            .setCustomId('removeChannel')
            .setStyle('DANGER')
    ];

    await selectInteraction.update({
        content: 'Use the buttons to add or remove a logging channel',
        components: [
            new MessageActionRow().addComponents(buttons)
        ]
    });
}

async function _autoMod(client: BotClient, cmdInteraction: CommandInteraction, selectInteraction: SelectMenuInteraction) {

}
