import {SlashCommand} from '@src/lib/util/SlashCommand';
import {ColorResolvable, MessageEmbed} from 'discord.js';
import {Logger} from '@src/lib/util/Logger';

export default new SlashCommand(
    {
        name: '8ball',
        description: 'Ask the magic 8 ball a question',
        options: [
            {
                name: 'question',
                description: 'The question',
                type: 'STRING',
                required: true
            }
        ]
    },

    (async (client, interaction) => {

        const responses: Record<string, ColorResolvable> = {
            /* Positive */

            'It is certain': 'GREEN',
            'Without a doubt': 'GREEN',
            'You may rely on it': 'GREEN',
            'Yes definitely': 'GREEN',
            'It is decidedly so': 'GREEN',
            'As I see it, yes': 'GREEN',
            'Most likely': 'GREEN',
            'Yes': 'GREEN',
            'Outlook good': 'GREEN',
            'Signs point to yes': 'GREEN',

            /* Neutral */

            'Reply hazy try again': 'ORANGE',
            'Better not tell you now': 'ORANGE',
            'Ask again later': 'ORANGE',
            'Cannot predict now': 'ORANGE',
            'Concentrate and ask again': 'ORANGE',

            /* Negative */

            'Don\'t count on it': 'RED',
            'Outlook not so good': 'RED',
            'My sources say no': 'RED',
            'Very doubtful': 'RED',
            'My reply is no': 'RED'
        };

        const chosenResponse = client.util.randomElement(Object.keys(responses));

        const color = responses[chosenResponse];

        const question = interaction.options.getString('question', true);

        new Logger('commands/8ball').debug(`
        question: ${question}
        response: ${chosenResponse}
        `);
        const embed = new MessageEmbed()
            .setTitle('8 Ball')
            .addField('Question', question, false)
            .addField('Response', chosenResponse, false)
            .setColor(color);

        await interaction.reply({
            embeds: [embed]
        });
    })
);
