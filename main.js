// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ActivityType } = require("discord.js");
const { token,  guildId, role_administrator_id, role_leadership_id } = require("./config.json");

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

    let adminRole = guild.roles.cache.get(role_administrator_id);
    let leadershipRole = guild.roles.cache.get(role_leadership_id);

    //  set the default roles allowed to use this bot
    client.defaultAllowedRoles.set(adminRole);
    client.defaultAllowedRoles.set(leadershipRole);

    //  set the bot's status
    client.user.setActivity('What is my purpose?');

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