//  fetches the currect active members from Joomla Membership Pro

const fs = require('fs');
const path = require('path');
const { request } = require('undici');
const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require("discord.js");
const { joomla_membershipProAPIKey } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('activemembers')
    .setDescription('Replies with a link to an export of current active members in GRS'),
    async execute(interaction){
        await interaction.deferReply();

        const url = `https://www.gareptilesociety.org/en/?option=com_osmembership&task=api.get_all_active_members&api_key=${joomla_membershipProAPIKey}`;
        console.log(url);
        const {
            statusCode,
            headers,
            trailers,
            body
        } = await request(url);
        
        console.log('response received', statusCode)
        console.log('headers', headers)
        console.log('trailers', trailers)

        const { success, data } = await body.json();

        if(success == true){
            const items = data
            const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
            const header = Object.keys(items[0])
            const csv = [
              header.join(','), // header row first
              ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
            ].join('\r\n');

            const filePath = path.join(__dirname, '../exports', 'GRS_Active_Members_Export.csv');
            fs.writeFileSync(filePath, csv);
            const file = new AttachmentBuilder(filePath);

            await interaction.editReply({ content: "Download ready!", files: [file] });
        } 
        else{
            await interaction.editReply("Ran into an issue!");
        }
    }

}