import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageEmbed} from 'discord.js';
import {UrbanDictionaryResult, UrbanDictionaryResultArray} from '@src/lib/interfaces/UrbanDictionaryResult';
import Centra = require('centra');
import {inspect} from 'util';

export default new SlashCommand(
    {
        name: 'urban',
        description: 'Define a word on urban dictionary',
        nsfw: true,
        options: [
            {
                name: 'word',
                description: 'The word',
                type: 'STRING',
                required: true
            }
        ]
    },

    (async (client, interaction) => {
        const word = interaction.options.getString('word', true);
        const res = await Centra(`https://api.urbandictionary.com/v0/define?term=${word}`).send();
        const json = await res.json();
        const array: UrbanDictionaryResultArray = {
            list: json.list as UrbanDictionaryResult[]
        };
        const results = array.list;

        const embeds: MessageEmbed[] = [];


        for (const result of results) {
            embeds.push(
                new MessageEmbed()
                .setTitle(word)
                .addField('Definition', result.definition.replaceAll(/[[\]]/g, ''), false)
                .addField('Example', result.example.replaceAll(/[[\]]/g, ''), false)
                .setTimestamp(result.written_on)
            );
        }

        await client.util.paginate(interaction, embeds);
    })
);
