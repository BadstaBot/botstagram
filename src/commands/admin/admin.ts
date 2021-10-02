import {SlashCommand} from '@src/lib/util/SlashCommand';
import {
    ButtonInteraction, CommandInteraction, ContextMenuInteraction,
    Formatters,
    Interaction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed, SelectMenuInteraction
} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';


export default new SlashCommand(
    {
        name: 'admin',
        description: 'Open the admin panel',
        ownerOnly: true
    },

    (async (client, interaction) => {
        const embed = new MessageEmbed()
            .setTitle(`${client.user!.username} Admin Panel`)
            .setDescription('Choose an option below');

        const row1 = new MessageActionRow()
            .setComponents([
                new MessageButton()
                    .setDisabled(true)
                    .setLabel('Power')
                    .setCustomId('power')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    // .setDisabled(true)
                    .setLabel('Query Database')
                    .setCustomId('dbQuery')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setLabel('Evaluate Code')
                    .setCustomId('eval')
                    .setStyle('DANGER'),
            ]);

        const msg = await interaction.reply({
            embeds: [embed],
            components: [row1],
            fetchReply: true
        }) as Message;

        const pressedButton = await msg.awaitMessageComponent({
            componentType: 'BUTTON',
            filter: b => b.user.id === interaction.user.id
        });

        const customId = pressedButton.customId as 'power' | 'dbQuery' | 'eval';

        if (customId === 'power')
            await _power(client, pressedButton);
        else if (customId === 'dbQuery')
            await _dbQuery(client, pressedButton, msg);
        else if (customId === 'eval')
            await _eval(client, pressedButton, msg);

    })
);

const _power = async (client: BotClient, interaction: ButtonInteraction) => {
    await interaction.update({
        content: 'Power Menu',
        embeds: [],
        components: [],
    });
};
const _dbQuery = async (client: BotClient, interaction: ButtonInteraction, msg: Message) => {
    await interaction.update({
        content: null,
        embeds: [
            new MessageEmbed()
                .setDescription('Awaiting query...')
        ],
        components: [],
    });

    const sentMsg = (await msg.channel.awaitMessages({
        filter: m => m.author.id === interaction.user.id,
        max: 1
    })).first();

    const content = sentMsg?.content;
    await sentMsg?.delete();

    const rows = (await client.db.query(content!)).rows;

    if (rows.length === 0) {
        await interaction.editReply({
            content: null,
            embeds: [
                new MessageEmbed()
                    .setTitle('Database Query')
                    .setDescription('No rows returned')
            ],
            components: [],
        });
        return;
    }

    let props = [];
    const pages: MessageEmbed[] = [];
    for (const row of rows) {
        for (const key in row) {
            props.push(`${key}: ${typeof row[key] === 'string' ? `'${row[key]}'` : row[key]}`);
        }

        pages.push(new MessageEmbed().setDescription(Formatters.codeBlock('js', `{\n${props.join(',\n')}\n}`)));
        props = [];
    }

    await client.util.paginate(interaction, pages);
};
const _eval = async (client: BotClient, interaction: ButtonInteraction, msg: Message) => {
    await interaction.update({
        content: null,
        embeds: [
            new MessageEmbed()
                .setDescription('Awaiting code...')
        ],
        components: [],
    });

    const sentMsg = (await msg.channel.awaitMessages({
        filter: m => m.author.id === interaction.user.id,
        max: 1
    })).first();

    const content = sentMsg?.content;
    await sentMsg?.delete();
    let evaled;
    try {
        // evaled = eval(`(async () => {\n${content!}\n})();`);
        evaled = eval(content!);
    } catch (e) {
        await interaction.editReply({
            content: null,
            embeds: [
                new MessageEmbed()
                    .setTitle('Error')
                    .setDescription(`${e}`)
            ],
            components: [],
        });
        return;
    }

    // const inspected = inspect(evaled, true, 2);

    await interaction.followUp({
        content: null,
        embeds: [
            new MessageEmbed()
                .setTitle('Success')
                .setDescription(`${evaled}`)
        ],
        components: [],
    });

};
