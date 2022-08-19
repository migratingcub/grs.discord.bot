//  fetches the currect active members from Joomla Membership Pro

const fs = require('fs');
const path = require('path');
const { request } = require('undici');
const {SlashCommandBuilder, AttachmentBuilder} = require("discord.js");
const { joomla_membershipProAPIKey, grs_baseurl, joomla_modulename, joomla_api_getallactivemembers} = require('../config.json');

const commandname = "activemembers"
const description = "Replies with a .csv attachment of current active members in the GRS Website."

module.exports = {
    help: {
        name: commandname,
        description: description,
        usage: "```/activemembers```"
    },
    data: new SlashCommandBuilder()
    .setName(commandname)
    .setDescription(description),
    async execute(interaction){
        await interaction.deferReply();

        const url = `${grs_baseurl}?option=${joomla_modulename}&task=${joomla_api_getallactivemembers}&api_key=${joomla_membershipProAPIKey}`;

        const {
            statusCode,
            headers,
            trailers,
            body
        } = await request(url);

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