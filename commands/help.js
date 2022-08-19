//  dynamically lists out all commands available

const fs = require("fs");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help with all my known commands!"),
    async execute(interaction){
        await interaction.deferReply();

        fs.readdir("./commands/", (err, files) => {
            if(err) console.error(err);

            let jsfiles = files.filter(f => f.split(".").pop() === "js");
            if(jsfiles.length <= 0){
                interaction.editReply("That's awkward...I forgot them all.");
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("GRS.bot User Guide")
                .setDescription("GRS.bot is here to help!\n\n")
                .addFields({
                        name: '\u200b',
                        value: '\u200b',
                        inline: false,
                    },
                    { 
                        name: "__**Commands**__", 
                        value: "Here's a list of all chat commands I know and how you can use them!\n\n"});

            var namelist = "";
            var desclist = "";
            var usage = "";
            
            let result = jsfiles.forEach((f, i) => {
                let props = require(`./${f}`);

                if(!props.help) return;

                namelist = props.help.name;
                desclist = props.help.description;
                usage = props.help.usage;

                embed.addFields({
                    name: `- ${props.help.name}`,
                    value: `${desclist} \n${usage}`
                })
            });

            interaction.editReply({ embeds: [embed]});
        });
    }
}