import {ButtonHandler} from '@src/lib/util/ButtonHandler';
import {MessageEmbed} from 'discord.js';

export default new ButtonHandler('StaffApplicationButton', (async (client, interaction) => {
    const questions = [
        '1) What is your age (13+ minimum)',
        '2) What is your current level (`ar!member stats` in <#690298473073082409>)',
        '3) What timezone are you in',
        '4) How often are you able to moderate the server',
        '5) Do you have any previous moderation experience inside or outside of Discord',
        '6) How familiar are you with Discord\'s settings and features',
        '7) Why do you want to become a staff member',
        '8) What makes you the best candidate for this role',
        '9) How do you feel about making difficult decisions and tough choices to enforce the rules of the server',
        '10) Have you had any punishments from us previously? (This excludes punishments given to you by mistake, as well as punishments that you have appealed and have been removed as a result)',
        '11) If you answered \'Yes\', please explain at least one of the punishments and what you learnt from it. (otherwise type `n/a`)',
        '12) Do you have 2-factor authentication enabled',
        '13) Any further questions/comments about the server/staff position',
    ];

    const responses: string[] = [];
    let currentQuestion = 0;
    let humanReadable = 1;

    const instructionEmbed = new MessageEmbed()
        .setTitle('Instructions')
        .setDescription('Answer the following questions')
        .setColor('RANDOM');

    const questionEmbed = new MessageEmbed()
        .setTitle(`Question ${currentQuestion + 1}`)
        .setDescription(questions[currentQuestion])
        .setColor(instructionEmbed.color || 'RANDOM');

    const channel = await interaction.guild!.channels.create(`staff-app-${interaction.user.username}`, {
        parent: '877274355904679936',
        permissionOverwrites: [
            {
                id: interaction.user.id,
                type: 'member',
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }
        ]
    });

    const instructionMsg = await channel.send({
        content: `${interaction.user}`,
        embeds: [instructionEmbed]
    });
    const questionMsg = await channel.send({
        embeds: [questionEmbed]
    });

    const collector = channel.createMessageCollector({
        filter: msg => msg.author.id === interaction.user.id,
        max: questions.length,
        maxProcessed: questions.length
    });

    collector.on('collect', (msg) => {
        msg.delete();
        currentQuestion++;
        humanReadable++;

        client.logger.forkInstance('button/AlexGB231StaffApplication').debug(`${humanReadable} / ${questions.length}`);
        if (humanReadable >= questions.length) {
            collector.stop();
        }

        questionMsg.edit({
            embeds: [new MessageEmbed(questionEmbed).setTitle(`Question ${currentQuestion + 1}`).setDescription(questions[currentQuestion])]
        });
    });

    collector.on('end', (async (collected) => {
        await instructionMsg.delete();
        await questionMsg.delete();

        const responses: string[] = [];
        let i = 1;
        collected.forEach(response => {
            responses.push(`${i}) ${response}`);
            i++;
        });

        const responseEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setDescription(responses.join('\n'))
            .setTitle('Responses')
            .setFooter(`Application started by ${interaction.user.username}`, interaction.user.displayAvatarURL({dynamic: true}));

        const questionEmbed = new MessageEmbed()
            .setTitle('Questions')
            .setDescription(questions.join('\n'))
            .setColor('GREEN');

        await channel.send({
            embeds: [questionEmbed, responseEmbed]
        });
    }));

}));
