// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token,  guildId } = require("./config.json");

//  Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

//  Add the default allowed roles for bot usage
client.defaultAllowedRoles = new Collection();

//  When the client is ready, run this code (only once)
client.on("ready", () => {
    //  Get the GRS Server
    const guild = client.guilds.cache.get(guildId);

    console.log(guild);

    let adminRole = guild.roles.cache.get('1007791008001572904');
    let leadershipRole = guild.roles.cache.get('1007792009618129079');

    client.defaultAllowedRoles.set(adminRole);
    client.defaultAllowedRoles.set(leadershipRole);

    console.log(adminRole);
    console.log(leadershipRole);

    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async interaction => {
    if(!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;
    
    //  check if the user as a valid role
    if(!interaction.member.roles.cache.some(r=>client.defaultAllowedRoles)){
        await interaction.reply({ content: "You're not permitted to use this command!"});
        return;
    }
    
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);