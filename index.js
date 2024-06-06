const { Client, GatewayIntentBits, SlashCommandBuilder , EmbedBuilder  ,  PermissionsBitField , ActionRowBuilder, ButtonBuilder, ButtonStyle , ChatInputCommandInteraction ,REST, Routes ,ChannelType, UserFlags } = require('discord.js');
const fetch = require('node-fetch'); 
const fs = require('fs');
require('dotenv').config();  
const os = require('os');
const axios = require("axios");
const { version } = require('discord.js');



const shoppingLists = {}; 
const main = 313338; 
const mainColor =  313338;
const errorV =  313338; 
const error = "Only the person who executed this command may use the buttons!";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent , 
        GatewayIntentBits.GuildMembers ,
        
    ]
});
client.tempVoiceChannelCategory = null;

const app_id = process.env.EDAMAM_APP_ID;
const app_key = process.env.EDAMAM_APP_KEY;
const token = process.env.BOT_TOKEN; 
const feedbackChannelId = process.env.FEEDBACK_CHANNEL_ID;

const currentDishGuesses = {};

client.on('ready', () => {
    
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('dnd');
    client.user.setUsername('FOODZ');
    client.user.setActivity('PREPARING FOOD FOR 🫵');

    const commandsToDelete = [
    // "" , "",
    ];
    
    commandsToDelete.forEach(commandId => {
        client.application.commands.delete(commandId)
            .then(() => console.log(`Deleted command ${commandId}`))
            .catch(console.error);
    });

    
    client.application.commands.create( 
        new SlashCommandBuilder()
           .setName('recipe')
           .setDescription('Get a recipe by name')
           .addStringOption(option =>
               option.setName('name')
                     .setDescription('The name of the recipe')
                     .setRequired(true)
           )
    );

    client.application.commands.create( 
        new SlashCommandBuilder()
            .setName('clear')
            .setDescription('Clear a specified number of messages')
            .addIntegerOption(option =>
                option.setName('amount')
                      .setDescription('The number of messages to clear')
                      .setRequired(true)
            )
    ); 

    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('feedback')
            .setDescription('Suggest new commands for the bot')
    );

    client.application.commands.create( 
        new SlashCommandBuilder()
            .setName('sl')
            .setDescription('(Owner Only)')
    );
    
    client.application.commands.create( 
        new SlashCommandBuilder()
            .setName('whatsinfridge')
            .setDescription('Find recipes based on what you have')
            .addStringOption(option =>
                option.setName('ingredients')
                .setDescription('Comma-separated list of ingredients')
                .setRequired(true)
    )
);
    client.application.commands.create(
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a specified member in the server')
        .addUserOption(option => 
            option.setName('user')
                  .setDescription('The member to mute')
                  .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                  .setDescription('Duration of the mute in minutes')
        )
        .addStringOption(option =>
            option.setName('reason')
                  .setDescription('The reason for the mute'))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
);
    client.application.commands.create(
    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmutes a specified member in the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The member to unmute')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    );

    client.application.commands.create( 
        new SlashCommandBuilder()
           .setName('rolemaker')
           .setDescription('Make a role with premade permissions.')
           .setDefaultMemberPermissions(PermissionsBitField.FlagsAdministrator)
           .addStringOption(option => option.setName('role').setDescription('Enter the name of the role.').setRequired(true))
           .addStringOption(option => 
               option.setName('permissions')
                     .setDescription('Enter what permissions you want to add to the role.')
                     .setRequired(true)
                     .addChoices(
                         { name: 'Administrator', value: 'Admin' },
                         { name: 'Super Moderator', value: 'SuperMod' },
                         { name: 'Moderator', value: 'Mod' },
                         { name: 'Member', value: 'Member' },
                         { name: 'Cosmetic', value: 'Cosmetic' }
                     ))
           .addStringOption(option => option.setName('color').setDescription('HEX code.').setRequired(false))
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('antilink')
            .setDescription('Enable/Disable the anti-link system')
            .addSubcommand(subcommand =>
                subcommand.setName('enable')
                          .setDescription('Enable the anti-link system'))
            .addSubcommand(subcommand =>
                subcommand.setName('disable')
                          .setDescription('Disable the anti-link system'))
            .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild) 
    );

    client.application.commands.create(
        new SlashCommandBuilder()
            .setName(`avatar`)
            .setDescription(`Get anybody's Profile Picture / Banner.`)
            .addUserOption(option => 
                option.setName(`user`)
                    .setDescription(`Select a user`)
                    .setRequired(false) 
            )
    );

    client.application.commands.create(
        new SlashCommandBuilder()
        .setName(`ping`)
        .setDescription(`Just get ping of user`)
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('botinfo')
            .setDescription('Get information about the bot.')
    
    
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('shoppinglist')
            .setDescription('Manage your temporary shopping list')
            .addSubcommand(subcommand =>
                subcommand.setName('add')
                          .setDescription('Add items to your shopping list')
                          .addStringOption(option => 
                              option.setName('items')
                                    .setDescription('Comma-separated list of items to add')
                                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('view')
                          .setDescription('View your shopping list'))
            .addSubcommand(subcommand =>
                subcommand.setName('clear')
                          .setDescription('Clear your shopping list'))
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('timer')
            .setDescription('Set a timer for cooking')
            .addIntegerOption(option =>
                option.setName('duration')
                    .setDescription('Duration of the timer in minutes')
                    .setRequired(true))
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('cookwithme')
            .setDescription('Create an event to cook a recipe together')
            .addStringOption(option => 
                option.setName('recipe_name')
                      .setDescription('Name of the recipe you want to cook')
                      .setRequired(true))
            .addUserOption(option => 
                option.setName('users')
                      .setDescription('Mention user1 to invite (optional)')
            )
  
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('moveall')
            .setDescription('Move all users from one voice channel to another')
            .addChannelOption(option => 
                option.setName('from')
                      .setDescription('The voice channel to move users from')
                      .setRequired(true)
                      .addChannelTypes(ChannelType.GuildVoice)) // Must be a voice channel
            .addChannelOption(option => 
                option.setName('to')
                      .setDescription('The voice channel to move users to')
                      .setRequired(true)
                      .addChannelTypes(ChannelType.GuildVoice))
            .setDefaultMemberPermissions(PermissionsBitField.Flags.MoveMembers) // Require permission
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('recipepoll')
            .setDescription('Create a poll to vote on recipes')
            .addStringOption(option =>
                option.setName('question')
                    .setDescription('The question for the poll (e.g., "Which recipe is better?")')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('options')
                    .setDescription('Comma-separated list of recipe names or dishes (max 10)')
                    .setRequired(true))
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('guessthedish')
            .setDescription('Start a game to guess the dish from an image')
            .addStringOption(option => option.setName('image_url').setDescription('Direct URL of the dish image').setRequired(true))
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('cmds')
            .setDescription('(Owner Only !😊)')
            
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('mediachan')
            .setDescription('Create a media-only channel (Admin Only)')
            .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('deafen')
            .setDescription('Deafens mentioned user or users.')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user(s) to deafen')
                    .setRequired(true))
            
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('undeafen')
            .setDescription('Undeafens mentioned user or users.')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user(s) to undeafen')
                    .setRequired(true))
            
            
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('softban')
            .setDescription('Softban a user (kick and delete recent messages)')
            .addUserOption(option => option.setName('user').setDescription('The user to softban').setRequired(true))
            .addStringOption(option => 
                option.setName('reason')
                      .setDescription('Reason for the softban'))
            .addIntegerOption(option =>
                option.setName('days')
                      .setDescription('Number of days to delete messages (default: 1)'))
            
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('slowmode')
            .setDescription('Enable/disable slow mode in a channel')
            .addChannelOption(option => 
                option.setName('channel')
                      .setDescription('The channel to apply slow mode to')
                      .setRequired(true)
                      .addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(option => 
                option.setName('duration')
                      .setDescription('Duration in seconds (0 to disable)')
                      .setRequired(true)
                      .setMinValue(0)
                      .setMaxValue(21600)) 
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('rolestats')
            .setDescription('Show statistics about the number of members in each role.')
    );
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('help command which gives you all the command list ! ')
    );
    client.application.commands.create(
        new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Use this command to invite the bot')
    );

    

    
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;


    if (interaction.commandName === 'recipe') {
        const recipeName = interaction.options.getString('name');
        const apiUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=${recipeName}&app_id=${app_id}&app_key=${app_key}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.hits.length > 0) {
                const recipe = data.hits[0].recipe;
                const ingredients = recipe.ingredientLines.map(line => `- ${line}`).join('\n'); 
                await interaction.reply(`Here's a recipe for **${recipeName}** :\n**Ingredients :**\n${ingredients}\n**Instructions  :** ${recipe.url}`); 
            } else {
                await interaction.reply(`Sorry, I couldn't find a recipe for ${recipeName}`);
            }
        } catch (error) {
            console.error('Error fetching recipe:', error);
            await interaction.reply('Oops, something went wrong. Try again later.');
        }
    } else if (interaction.commandName === 'clear') {
        const amount = interaction.options.getInteger('amount');

        if (!amount || amount <= 0 || amount > 100) {
            return interaction.reply({ content:'Please enter a number between 1 and 100 for the amount of messages to clear.', ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            const fetched = await interaction.channel.messages.fetch({ limit: amount });
            const deleted = await interaction.channel.bulkDelete(fetched);
            await interaction.reply({ content: `Successfully deleted ${deleted.size} messages!`, ephemeral: true });
        } catch (error) {
            console.error('Error deleting messages:', error);
            await interaction.reply({ content: 'You can only bulk delete messages that are under 14 days old.', ephemeral: true });
        }
    } else if (interaction.commandName === 'feedback') {
        const feedbackChannel = client.channels.cache.get(feedbackChannelId);

        if (!feedbackChannel) {
            return interaction.reply({ content: 'Feedback channel not found. Please contact the bot owner.', ephemeral: true });
        }

        const question = await interaction.reply({
            content: 'What suggestion do you want to give us that  would you like to see added to this bot? Please describe it.', 
            ephemeral: true 
        });

        const filter = (m) => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

        collector.on('collect', async (message) => {
            const suggestion = message.content;
            await feedbackChannel.send(`**A feedback of items to be add from  <@${interaction.user.id}> :**\n ---> ${suggestion}`);
            await interaction.followUp({ content: 'Thank you for your feedback! It has been submitted and I hope You loved the bot ! \n - From Owner!', ephemeral: true });
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                interaction.followUp({ content: 'You did not provide any feedback within the time limit.', ephemeral: true });
            }
        });
    } else if (interaction.commandName === 'sl') {
        if (interaction.user.id !==  process.env.OWNER_ID ) { 
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const guilds = client.guilds.cache.map(guild => `${guild.name} (${guild.id})`);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF) 
            .setTitle('Server List')
            .setDescription(`Total **${client.guilds.cache.size}** servers  are Under me ! :\n\n ${guilds.join('\n')}`);

        interaction.reply({ embeds: [embed] , ephemeral : true}  );
    } else if (interaction.commandName === 'whatsinfridge') {
        const ingredients = interaction.options.getString('ingredients'); 
        const ingredientList = ingredients.split(',').map(item => item.trim()); 
        const mainIngredient = ingredientList[0]; 
        const additionalIngredients = ingredientList.slice(1); 

        try {
            const apiUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=${mainIngredient},${additionalIngredients.join(',')}&app_id=${app_id}&app_key=${app_key}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.hits.length > 0) {
                const recipesToDisplay = data.hits.slice(0, 5); 
                let replyMessage = "Here are some recipe ideas based on what you have:\n";
                recipesToDisplay.forEach(recipe => {
                    replyMessage += `**${recipe.recipe.label}** - ${recipe.recipe.url}\n`; 
            });

    await interaction.reply(replyMessage);
            } else {
                await interaction.reply("Sorry, I couldn't find good recipes with those ingredients. Try a different combination or add more specifics.");
            }
        } catch (error) { 
            console.error('Error fetching recipes:', error); 
            await interaction.reply('Oops, something went wrong. Try again later.');
        }
    } else if (interaction.commandName === 'mute') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const targetMember = interaction.options.getMember('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!targetMember.moderatable) { 
            return interaction.reply({ content: 'This user cannot be muted.', ephemeral: true });
        }

        let muteRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted'); 
        if (!muteRole) {
            try {
                muteRole = await interaction.guild.roles.create({
                    name: 'muted',
                    permissions: [ ], 
                    reason: 'Mute role creation' 
                });     
                interaction.guild.channels.cache.forEach(channel => {
                    channel.permissionOverwrites.create(muteRole, { 
                        SEND_MESSAGES: false,  ADD_REACTIONS : false ,VIEW_CHANNEL : false , READ_MESSAGE_HISTORY : false , CONNECT : false ,  MANAGE_MESSAGES : false 
                    });
                });
                  
            } catch (error) {
                console.error('Error creating mute role:', error);
                return interaction.reply({ content: 'Could not create a mute role. Please check my permissions and try again.', ephemeral: true });
            }
        }

        try {          
            await targetMember.roles.add(muteRole);
            interaction.reply({ content: `${targetMember.user.tag} has been muted for ${duration} minutes. Reason: ${reason}`, ephemeral: true });

            
            if (duration) {
                setTimeout(async () => {
                    if (!targetMember.roles.cache.has(muteRole.id)) return; 
                    await targetMember.roles.remove(muteRole);
                    interaction.followUp({ content: `<@${targetMember.id}> has been unmuted.`, ephemeral: true });
                }, duration * 60 * 1000); 
            }
        } catch (error) {
            console.error('Error muting member:', error);
            interaction.reply({ content: `Oops, couldn't mute ${targetMember.user.tag}.`, ephemeral: true });
        }
    } else if (interaction.commandName === 'unmute') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const targetMember = interaction.options.getMember('user');

        if (!targetMember.roles.cache.find(role => role.name.toLowerCase() === 'muted')) {
            return interaction.reply({ content: 'This user is not muted.', ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
        if (!muteRole) {
            return interaction.reply({ content: 'Could not find the muted role.', ephemeral: true });
        }

        try {
            await targetMember.roles.remove(muteRole);
            interaction.reply({ content: `Successfully unmuted ${targetMember.user.tag}`, ephemeral: true });
        } catch (error) {
            console.error('Error unmuting member:', error);
            interaction.reply({ content: `Oops, couldn't unmute ${targetMember.user.tag}.`, ephemeral: true });
        }
    }else if (interaction.commandName === 'rolemaker') {
        const newRole = interaction.options.getString("role");
        const permSet = interaction.options.getString("permissions");
        let roleColor = interaction.options.getString("color");
        const guild = interaction.guild;
        
        
        if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(roleColor)) {
            console.error("Invalid color format. Setting color to default value.");
            roleColor = "000000"; 
        }
  
        try {
            
            if (permSet === "Admin") {
                guild.roles.create({
                    name: newRole,
                    permissions: [PermissionsBitField.Flags.Administrator],
                    color: `${roleColor}`,
                  });
            }
            if (permSet === "SuperMod") {
                guild.roles.create({
                    name: newRole,
                    permissions: [
                      PermissionsBitField.Flags.AddReactions,
                      PermissionsBitField.Flags.AttachFiles,
                      PermissionsBitField.Flags.BanMembers,
                      PermissionsBitField.Flags.ChangeNickname,
                      PermissionsBitField.Flags.Connect,
                      PermissionsBitField.Flags.CreateInstantInvite,
                      PermissionsBitField.Flags.CreatePrivateThreads,
                      PermissionsBitField.Flags.CreatePublicThreads,
                      PermissionsBitField.Flags.DeafenMembers,
                      PermissionsBitField.Flags.EmbedLinks,
                      PermissionsBitField.Flags.KickMembers,
                      PermissionsBitField.Flags.ManageChannels,
                      PermissionsBitField.Flags.ManageEvents,
                      PermissionsBitField.Flags.ManageGuildExpressions,
                      PermissionsBitField.Flags.ManageMessages,
                      PermissionsBitField.Flags.ManageNicknames,
                      PermissionsBitField.Flags.ManageRoles,
                      PermissionsBitField.Flags.ManageThreads,
                      PermissionsBitField.Flags.ManageWebhooks,
                      PermissionsBitField.Flags.MentionEveryone,
                      PermissionsBitField.Flags.ModerateMembers,
                      PermissionsBitField.Flags.MoveMembers,
                      PermissionsBitField.Flags.MuteMembers,
                      PermissionsBitField.Flags.PrioritySpeaker,
                      PermissionsBitField.Flags.ReadMessageHistory,
                      PermissionsBitField.Flags.SendMessages,
                      PermissionsBitField.Flags.SendMessagesInThreads,
                      PermissionsBitField.Flags.SendTTSMessages,
                      PermissionsBitField.Flags.SendVoiceMessages,
                      PermissionsBitField.Flags.Speak,
                      PermissionsBitField.Flags.Stream,
                      PermissionsBitField.Flags.UseApplicationCommands,
                      PermissionsBitField.Flags.UseEmbeddedActivities,
                      PermissionsBitField.Flags.UseExternalEmojis,
                      PermissionsBitField.Flags.UseExternalSounds,
                      PermissionsBitField.Flags.UseExternalStickers,
                      PermissionsBitField.Flags.UseSoundboard,
                      PermissionsBitField.Flags.UseVAD,
                      PermissionsBitField.Flags.ViewAuditLog,
                      PermissionsBitField.Flags.ViewChannel,
                      PermissionsBitField.Flags.ViewGuildInsights,
                    ],
                    color: `${roleColor}`,
            });
        }
        if (permSet === "Mod") {
            guild.roles.create({
              name: newRole,
              permissions: [
                PermissionsBitField.Flags.AddReactions,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.BanMembers,
                PermissionsBitField.Flags.ChangeNickname,
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.CreateInstantInvite,
                PermissionsBitField.Flags.CreatePrivateThreads,
                PermissionsBitField.Flags.CreatePublicThreads,
                PermissionsBitField.Flags.DeafenMembers,
                PermissionsBitField.Flags.EmbedLinks,
                PermissionsBitField.Flags.KickMembers,
                PermissionsBitField.Flags.ManageEvents,
                PermissionsBitField.Flags.ManageGuildExpressions,
                PermissionsBitField.Flags.ManageMessages,
                PermissionsBitField.Flags.ManageNicknames,
                PermissionsBitField.Flags.ManageThreads,
                PermissionsBitField.Flags.ManageWebhooks,
                PermissionsBitField.Flags.MentionEveryone,
                PermissionsBitField.Flags.ModerateMembers,
                PermissionsBitField.Flags.MoveMembers,
                PermissionsBitField.Flags.MuteMembers,
                PermissionsBitField.Flags.PrioritySpeaker,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.SendMessagesInThreads,
                PermissionsBitField.Flags.SendTTSMessages,
                PermissionsBitField.Flags.SendVoiceMessages,
                PermissionsBitField.Flags.Speak,
                PermissionsBitField.Flags.Stream,
                PermissionsBitField.Flags.UseApplicationCommands,
                PermissionsBitField.Flags.UseEmbeddedActivities,
                PermissionsBitField.Flags.UseExternalEmojis,
                PermissionsBitField.Flags.UseExternalSounds,
                PermissionsBitField.Flags.UseExternalStickers,
                PermissionsBitField.Flags.UseSoundboard,
                PermissionsBitField.Flags.UseVAD,
                PermissionsBitField.Flags.ViewAuditLog,
                PermissionsBitField.Flags.ViewChannel,
              ],
              color: `${roleColor}`,
            });
          }
          if (permSet === "Member") {
            guild.roles.create({
              name: newRole,
              permissions: [
                PermissionsBitField.Flags.AddReactions,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.ChangeNickname,
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.CreatePrivateThreads,
                PermissionsBitField.Flags.CreatePublicThreads,
                PermissionsBitField.Flags.EmbedLinks,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.SendMessagesInThreads,
                PermissionsBitField.Flags.SendTTSMessages,
                PermissionsBitField.Flags.SendVoiceMessages,
                PermissionsBitField.Flags.Speak,
                PermissionsBitField.Flags.Stream,
                PermissionsBitField.Flags.UseApplicationCommands,
                PermissionsBitField.Flags.UseEmbeddedActivities,
                PermissionsBitField.Flags.UseExternalEmojis,
                PermissionsBitField.Flags.UseExternalSounds,
                PermissionsBitField.Flags.UseExternalStickers,
                PermissionsBitField.Flags.UseSoundboard,
                PermissionsBitField.Flags.ViewChannel,
              ],
              color: `${roleColor}`,
            });
          }
          if (permSet === "Cosmetic") {
            guild.roles.create({
              name: newRole,
              permissions: [],
              color: `${roleColor}`,
            });
          }
          interaction.reply({
            content: `Successfully created: ${newRole} with permissions ${permSet}`,
            ephemeral: true,
          });
            
        } catch (error) {
            console.error("An error occurred:", error);
        }
    } else if (interaction.commandName === 'antilink') {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        let settings;
        try {
            settings = JSON.parse(fs.readFileSync('./settings.json'));
        } catch (error) {
            console.error('Error reading settings file:', error);
            settings = { guildSettings: {} }; 
        }

        if (subcommand === 'enable') {
            settings.guildSettings[guildId] = { antiLink: true };
            fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2));
            await interaction.reply({ content: 'Anti-link System has been enabled .', ephemeral: true });
        } else if (subcommand === 'disable') {
            settings.guildSettings[guildId] = { antiLink: false };
            fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2));
            await interaction.reply({ content: 'Anti-link System has been disabled .', ephemeral: true });
        }
    }else if (interaction.commandName === 'avatar') {
        handleAvatarCommand(interaction)
            .catch(console.error); 
     } 
     else if(interaction.commandName === 'ping') {
        interaction.reply({content: `**Websocket heartbeat:** ${client.ws.ping}ms.`, ephemeral:true});
    }else if (interaction.commandName === 'botinfo') {
        handleBotInfoCommand(interaction, client);
    }else if (interaction.commandName === 'shoppinglist') {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
    
        if (subcommand === 'add') {
            const items = interaction.options.getString('items').split(',').map(item => item.trim());
            if (!shoppingLists[userId]) {
                shoppingLists[userId] = [];
            }
            shoppingLists[userId].push(...items);
            await interaction.reply({content: `***Added items to your shopping list :*** ${items.join(', ')}` , ephemeral:true});
        } else if (subcommand === 'view') {
            const list = shoppingLists[userId] || [];
            if (list.length === 0) {
                await interaction.reply({content:'***Your shopping list is empty.***' , ephemeral:true});
            } else {
                await interaction.reply({content: `***Your shopping list :*** \n${list.map(item => `- ${item}`).join('\n')}` , ephemeral:true});
            }
        } else if (subcommand === 'clear') {
            delete shoppingLists[userId];
            await interaction.reply({content: '***Shopping list cleared!***' , ephemeral:true});    
        }
    }
    else if (interaction.commandName === 'timer') {
        const durationSeconds = interaction.options.getInteger('duration');
      
        
        if (durationSeconds <= 0 || durationSeconds > 86400) {
          return interaction.reply({ content: 'Please enter a duration between 1 second and 24 hours.', ephemeral: true });
        }
      
        
        const durationMinutes = Math.floor(durationSeconds / 60); 
      
        
        await interaction.reply({ content: `Timer set for ${durationMinutes} minutes! I'll let you know when it's done.`, ephemeral: true });
      
        
        const timeout = durationSeconds * 1000;
      
        setTimeout(() => {
          interaction.followUp({ content: `***Time's up! Your  ${durationMinutes} minute timer has finished.***`, ephemeral: true })
            .catch(console.error);
        }, timeout);
      }
      
    else if (interaction.commandName === 'cookwithme') {
        handleCookWithMeCommand(interaction);
    }
    else if (interaction.customId === 'deleteEventChannel') {
        await interaction.deferReply({ ephemeral: true }); 
        const channel = interaction.channel; 

        if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            try {
                await channel.delete(); 
                await interaction.editReply({ content: `Channel ${channel.name} has been deleted.`, ephemeral: true }); 
            } catch (error) {
                console.error('Error deleting channel:', error);
                await interaction.editReply({ content: 'Failed to delete the channel. Do I have the necessary permissions?', ephemeral: true }); 
            }
        } else {
            await interaction.editReply({ content: 'You do not have permission to delete this channel.', ephemeral: true }); 
        }
    }  else if (interaction.commandName === 'help') {
        handleHelpCommand(interaction, client); 
    }  
    else if (interaction.commandName === 'moveall') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.MoveMembers)) {
         return interaction.reply({ content: "You don't have permission to use this command!", ephemeral: true });
        }
         
        const fromChannel = interaction.options.getChannel('from');
        const toChannel = interaction.options.getChannel('to');
         
        if (!fromChannel || !fromChannel.isVoiceBased()) {
         return interaction.reply({ content: 'Invalid "from" channel. Please specify a voice channel.', ephemeral: true });
        }
         
        if (!toChannel || !toChannel.isVoiceBased()) {
         return interaction.reply({ content: 'Invalid "to" channel. Please specify a voice channel.', ephemeral: true });
        }
         
        const membersToMove = fromChannel.members;
        let movedCount = 0;
         
        
        if (membersToMove.size === 0) {
         return interaction.reply({ content: 'There are no members in the specified voice channel.', ephemeral: true });
        }
         
        
        try {
         for (const member of membersToMove.values()) {
        await member.voice.setChannel(toChannel);
        movedCount++;
         }
         
         interaction.reply({ content: `**Successfully moved ${movedCount} members to** <#${toChannel.id}>`, ephemeral: true });
        } catch (error) {
         console.error('Error moving members:', error);
         interaction.reply({ content: 'An error occurred while moving members.', ephemeral: true });
        }
    }
    
    
    
    else if (interaction.commandName === 'recipepoll') {
        handleRecipePollCommand(interaction);
    }
    else if(interaction.commandName === 'invite') {
        const embed = new EmbedBuilder()

        .setDescription('[invite](https://discord.com/oauth2/authorize?client_id=834364911244673065&permissions=0&scope=bot+applications.commands)')
        .setFooter({text : 'Made by jaxk' })

        interaction.reply({embeds : [embed] , ephemeral:true})
    }
    else if (interaction.commandName === 'guessthedish') {
        handleGuessTheDishCommand(interaction);
    }
    else if (interaction.commandName === 'cmds') {
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
        }
        
        const commandList = client.application.commands.cache.map(cmd => `/${cmd.name}`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('Grey')
            .setTitle('Available Commands')
            .setDescription(commandList);

    }
    else if (interaction.commandName === 'mediachan') {
        handleMediaChanCommand(interaction);
    }
    if (interaction.commandName === 'deafen') {
        handleDeafenCommand(interaction);
    } else if (interaction.commandName === 'undeafen') {
        handleUndeafenCommand(interaction);
    }
    
    else if (interaction.commandName === 'softban') {
        handleSoftbanCommand(interaction);
    }
    else if (interaction.commandName === 'slowmode') {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: "You don't have permission to use this command!", ephemeral: true });
        }
    
        const channel = interaction.options.getChannel('channel');
        const duration = interaction.options.getInteger('duration');
    
        if (!channel || !channel.isTextBased()) {
            return interaction.reply({ content: 'Invalid channel. Please specify a text channel.', ephemeral: true });
        }
    
        try {
            await channel.setRateLimitPerUser(duration);
            interaction.reply({ content: `Slow mode ${duration === 0 ? 'disabled' : `set to ${duration} seconds`} in ${channel}`, ephemeral: true });
        } catch (error) {
            console.error('Error setting slow mode:', error);
            interaction.reply({ content: 'An error occurred while setting slow mode.', ephemeral: true });
        }
    
    }
    else if (interaction.commandName === 'rolestats') {
        if (interaction.user.id !== PermissionsBitField.Flags.Administrator) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
        }
        const roleStats = interaction.guild.roles.cache
            .filter(role => role.name !== '@everyone') 
            .map(role => ({
                name: role.name,
                count: role.members.size
            }));
        
        const embed = new EmbedBuilder()
            .setTitle('Role Statistics')
            .setColor(mainColor)
            .setDescription(roleStats.map(stat => `**${stat.name}:** ${stat.count}`).join('\n') || 'No roles found.');
    
        interaction.reply({ embeds: [embed] , ephemeral: true  });
    }
    else if (interaction.isButton()) {
        const buttonId = interaction.customId;
      
        if (buttonId === 'Delete') {
          
          if (interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) {
      
            
            interaction.channel.delete()
              .then(() => {
              })
              .catch(error => {
                
                console.error('Error deleting channel:', error);
                interaction.reply({ content: 'Failed to delete the channel. Do I have the necessary permissions?', ephemeral: true });
              });
          } else {
            interaction.reply({ content: 'You do not have permission to delete this channel.', ephemeral: true });
          }
        }
      }

    
    

    
    
    client.on('messageCreate', message => {
        if (message.author.bot) return;
    
        const guildId = message.guild?.id; 
        if (!guildId) return; 
    
        let settings;
        try {
            settings = JSON.parse(fs.readFileSync('./settings.json'));
        } catch (error) {
            console.error('Error reading settings file:', error);
            return; 
        }
    
        const isAntiLinkEnabled = settings.guildSettings[guildId] && settings.guildSettings[guildId].antiLink;
        const isManager = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
        const hasLinks = message.content.includes("https://") || message.content.includes("http://") || message.content.includes("discord.gg");
    
        if (isAntiLinkEnabled && !isManager && hasLinks) {
            message.channel.messages.fetch(message.id)
                .then(fetchedMessage => {
                    if (fetchedMessage) {
                        return fetchedMessage.delete();
                    } else {
                        console.error("Message not found or already deleted.");
                        return null; 
                    }
                })
                .then(() => {
                    const antilinkMessage = `${message.author}, Sending Links is **Not Allowed** `;
                    const antiembed = new EmbedBuilder()
                        .setTitle("Anti-link System")
                        .setDescription(antilinkMessage)
                        .setColor(0xFF0000)
                        .setThumbnail("https://cdn.discordapp.com/avatars/834364911244673065/010ff96b58fadcc6608b27354c50a865.png?size=1024") 
                        .setTimestamp();
    
                    return message.channel.send({ embeds: [antiembed] });
                })
                .then(msg => {
                    if (msg) { 
                        setTimeout(() => msg.delete().catch(console.error), 20000); 
                    }
                })
                .catch(error => console.error('Error handling anti-link:', error)); 
        }
    
        
    });
    
    






async function handleAvatarCommand(interaction) {
    const usermention = interaction.options.getUser(`user`) || interaction.user;
    const avatar = usermention.displayAvatarURL({ size: 1024, format: "png"});
    let banner, embed2;

    try {
        const fetchedUser = await interaction.client.users.fetch(usermention.id, { force: true });
        banner = fetchedUser.bannerURL({ size: 4096 });
        
        if (banner) { 
            embed2 = new EmbedBuilder() 
                .setColor(main)
                .setAuthor({ name: `${usermention.tag}, banner`, iconURL: `${usermention.displayAvatarURL()}`})
                .setTitle(`Download`)
                .setURL(banner)
                .setImage(banner);
        }
    } catch (error) {
        console.error("Error fetching banner:", error);
    }

    await interaction.channel.sendTyping();

    
const cmp = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel(`Avatar`)
            .setCustomId(`avatar`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
            .setLabel(`Banner`)
            .setCustomId(`banner`)
            .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
            .setLabel(`Delete`)
            .setCustomId(`delete`)
            .setStyle(ButtonStyle.Danger)
        )

        const cmp2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel(`Avatar`)
            .setCustomId(`avatar`)
            .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
            .setLabel(`Banner`)
            .setCustomId(`banner`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
            .setLabel(`Delete`)
            .setCustomId(`delete`)
            .setStyle(ButtonStyle.Danger)
        )

        const cmp3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel(`Avatar`)
            .setCustomId(`avatar`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
            .setLabel(`Delete`)
            .setCustomId(`delete`)
            .setStyle(ButtonStyle.Danger)
        )

        const embed = new EmbedBuilder()
        .setColor(main) 
        .setAuthor({ name: `${usermention.tag}, avatar`, iconURL: `${usermention.displayAvatarURL()}`})
        .setTitle(`Download`)
        .setURL(avatar)
        .setImage(avatar)

        embed2 = new EmbedBuilder() 
            .setColor(main)
            .setAuthor({ name: `${usermention.tag}, banner`, iconURL: `${usermention.displayAvatarURL()}`})
            .setTitle(`Download`)
            .setURL(banner)
            .setImage(banner);

    
            const sendEmbed = async () => {
                try {
                    const message = await (banner
                        ? interaction.reply({ embeds: [embed], components: [cmp], ephemeral: true })
                        : interaction.reply({ embeds: [embed], components: [cmp3], ephemeral: true }));
        
                    const filter = (i) => i.user.id === interaction.user.id;
                    const collector = message.createMessageComponentCollector({ filter, time: 15000 });
        
                    collector.on(`collect`, async i => {
                        if (i.customId === 'avatar') {
                            await i.update({ embeds: [embed], components: [cmp], ephemeral: true });
                        } else if (i.customId === 'banner' && banner) {
                            await i.update({ embeds: [embed2], components: [cmp2], ephemeral: true });
                        } else if (i.customId === 'delete') {
                            await interaction.deleteReply();
                        }
                    });
        
                    collector.on('end', collected => {
                       
                        message.edit({ components: message.components?.map(row => {
                            return new ActionRowBuilder().addComponents(
                                row.components.map(component => component.setDisabled(true))
                            );
                        }) }).catch(console.error);
                    });
                } catch (error) {
                    console.error('Error sending message:', error);
                    interaction.followUp({ content: 'Oops, something went wrong while processing the command.', ephemeral: true });
                }
            };
        
            sendEmbed();
        }

async function handleBotInfoCommand(interaction, client) {
    const apiLatency = `${client.ws.ping} ms`;
    interaction.deferReply({ephemeral: true}); 

    setTimeout(async () => {
        const embed = new EmbedBuilder()
            .setColor('2B2D31')
            .setTitle('Bot Info')
            .setDescription('Here is some information about me!')
            .addFields(
                { name: 'Bot ID', value: interaction.client.user.id, inline: true },
                { name: 'Server Count', value: interaction.client.guilds.cache.size.toString(), inline: true },
                { name: 'User Count', value: interaction.client.users.cache.size.toString(), inline: true },
                { name: 'Library', value: 'Discord.js', inline: true },
                { name: 'Version', value: `v${process.env.botVersion || "1.0.0"}`, inline: true }, 
                { name: 'Creator', value: `<@${process.env.OWNER_ID}>`, inline: true }, 
                { name: `API Latency`, value: apiLatency, inline: true },
                { name: `Client Latency`, value: `${interaction.createdTimestamp - Date.now()} ms`, inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }));

        interaction.editReply({ 
            embeds: [embed], 
            ephemeral: true, 
        }); 
    }, 1000); 
};

});

async function getRecipe(recipeName) {
    const apiUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=${recipeName}&app_id=${app_id}&app_key=${app_key}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.hits.length > 0) {
            return data.hits[0].recipe;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching recipe:', error);
        return null;
    }
}

async function handleCookWithMeCommand(interaction) {
    const recipeName = interaction.options.getString('recipe_name');

    
    await interaction.deferReply({ ephemeral: true });

    const recipe = await getRecipe(recipeName);

    if (!recipe) {
        return interaction.editReply({
            content: `Sorry, I couldn't find a recipe for "${recipeName}".`,
            ephemeral: true
        });
    }

    const channelName = `cookwithme-${recipeName.replace(/\s+/g, '-').toLowerCase()}`; 

    try {
        const mentionedUsers = interaction.options.getUser('users');
        const allowedUsers = [interaction.user.id];
        if (mentionedUsers) {
            allowedUsers.push(mentionedUsers.id);
        }

        const eventChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: client.tempVoiceChannelCategory, 
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                ...allowedUsers.map(userId => ({
                    id: userId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
                }))
            ]
        });

        const invitedUsers = mentionedUsers ? mentionedUsers.toString() : "";

        const embed = new EmbedBuilder()
            .setTitle(`Cook-With-Me Event: ${recipeName}`)
            .setDescription(
                `${interaction.user.toString()} has started a Cook-With-Me event for ${recipeName}! ${invitedUsers}\n\n` +
                `Join us in ${eventChannel} to cook together! \n\n` +
                `Share your progress, ask questions, and have fun!`
            )
            .setColor(mainColor)
            .setThumbnail(recipe.image || '');

        await interaction.editReply({ embeds: [embed] });

            
        const deleteButton = new ButtonBuilder()
            .setCustomId('Delete')
            .setLabel('Delete')
            .setStyle(ButtonStyle.Danger);

        const channelEmbed = new EmbedBuilder()
            .setTitle(`Cook-With-Me Event: ${recipeName}`)
            .setDescription(`Ingredients:\n${recipe.ingredientLines.map(line => `- ${line}`).join('\n')}\n\nInstructions:\n${recipe.url}`)
            .setColor(mainColor)
            .setThumbnail(recipe.image || '');

        await eventChannel.send({ embeds: [channelEmbed], components: [new ActionRowBuilder().addComponents(deleteButton)] });

        
        let deletionTimeout;

        const checkAndDeleteChannel = () => {
            if (eventChannel.members.size === 0) {
                eventChannel.delete()
                    .then(() => console.log(`Deleted channel ${eventChannel.name}`))
                    .catch(console.error); 
            }
        };

        
        deletionTimeout = setTimeout(checkAndDeleteChannel, 50000); 

        client.on('voiceStateUpdate', (oldState, newState) => {
            if (newState.channelId === eventChannel.id) {
                clearTimeout(deletionTimeout); 

                if (newState.channel.members.size === 0) {
                    
                    deletionTimeout = setTimeout(checkAndDeleteChannel, 5000); 
                }
            }
        });
    } catch (error) {
        console.error('Error creating event channel:', error);
        interaction.followUp({ content: 'An error occurred while creating the event channel.', ephemeral: true }); 
    }
}



client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const guildId = message.guild?.id; 
    if (!guildId) return; 

    let settings;
    try {
        settings = JSON.parse(fs.readFileSync('./settings.json'));
    } catch (error) {
        console.error('Error reading settings file:', error);
        return; 
    }

    const isAntiLinkEnabled = settings.guildSettings[guildId] && settings.guildSettings[guildId].antiLink;
    const isManager = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
    const hasLinks = message.content.includes("https://") || message.content.includes("http://") || message.content.includes("discord.gg");

    if (isAntiLinkEnabled && !isManager && hasLinks) {
        try {
            const fetchedMessage = await message.channel.messages.fetch(message.id); 
            if (fetchedMessage) {
                await fetchedMessage.delete();

                const antilinkMessage = `${message.author}, Sending Links is **Not Allowed** `;
                const antiembed = new EmbedBuilder()
                    .setTitle("Anti-link System")
                    .setDescription(antilinkMessage)
                    .setColor(0xFF0000)
                    .setThumbnail("https://cdn.discordapp.com/avatars/834364911244673065/010ff96b58fadcc6608b27354c50a865.png?size=1024")
                    .setTimestamp();

                await message.channel.send({ embeds: [antiembed] })
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 20000))
                    .catch(console.error);
            } else {
                console.error("Message not found or already deleted.");
            }
        } catch (error) {
            console.error('Error handling anti-link:', error); 
        }
    }
});

async function handleRecipePollCommand(interaction) {
    const question = interaction.options.getString('question');
    const optionsString = interaction.options.getString('options');
    const optionsArray = optionsString.split(',').map(option => option.trim()).slice(0, 10); 

    if (optionsArray.length < 2) {
        return interaction.reply({ content: 'Please provide at least two options for the poll.', ephemeral: true });
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']; 

    const pollEmbed = new EmbedBuilder()
        .setTitle(question)
        .setColor(mainColor)
        .setDescription(optionsArray.map((option, index) => `${emojis[index]} ${option}`).join('\n'));

    try {
        
        const message = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

        
        for (let i = 0; i < optionsArray.length; i++) {
            await message.react(emojis[i]);
        }
    } catch (error) {
        console.error('Error creating poll:', error);
        interaction.followUp({ content: 'An error occurred while creating the poll.', ephemeral: true }); 
    }
}

//////////////////////////////////////////////////////////////////

async function handleGuessTheDishCommand(interaction) {
    const imageUrl = interaction.options.getString('image_url');
    
    const embed = new EmbedBuilder()
        .setTitle('Guess the Dish!')
        .setColor(mainColor)
        .setImage(imageUrl);
        
    try {

        await interaction.reply({ embeds: [embed] });

        
    } catch (error) {
        console.error('Error creating guess the dish game:', error);
        interaction.reply({ content: 'An error occurred while starting the game.', ephemeral: true });
    }
}


async function handleMediaChanCommand(interaction) {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const guild = interaction.guild;
    const channelName = `${guild.name}-media`; 

    
    const existingChannel = guild.channels.cache.find(channel => 
        channel.name.toLowerCase() === channelName.toLowerCase() && 
        channel.type === ChannelType.GuildText
    );

    if (existingChannel) {
        return interaction.reply({ content: `A media channel named <#${existingChannel.id}> already exists.`, ephemeral: true });
    }

    try {
        const mediaChannel = await guild.channels.create({
            name: channelName,
            topic:'This is Media-only channel Your not allowed to text her ',
            type: ChannelType.GuildText,
            
            
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.SendMessages],
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.AttachFiles]
                }
            ]
        });

        await interaction.reply({ content: `Media-only channel created: ${mediaChannel}`, ephemeral: true });

        
        client.on('messageCreate', message => {
            if (message.channel.id === mediaChannel.id && !message.attachments.size) { 
                message.delete().catch(console.error);
            }
        });
    } catch (error) {
        console.error('Error creating media channel:', error);
        interaction.reply({ content: 'An error occurred while creating the media channel.', ephemeral: true });
    }
}


async function handleSoftbanCommand(interaction) {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers | PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: "You don't have permission to use this command!", ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || "No reason provided.";
    const days = interaction.options.getInteger('days') || 1;

    try {
        
        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        if (!targetMember.bannable) {
            return interaction.reply({ content: 'This user cannot be softbanned.', ephemeral: true });
        }

        
        const deleteMessageDays = Math.max(0, Math.min(7, days)); 
        const deleteMessageSeconds = deleteMessageDays * 24 * 60 * 60;
        const deleteTimestamp = new Date().getTime() - (deleteMessageSeconds * 1000);

        
        const channel = interaction.channel; 
        const fetched = await channel.messages.fetch({ limit: 100 });
        const messagesToDelete = fetched.filter(msg => msg.author.id === targetUser.id && msg.createdTimestamp > deleteTimestamp);

        
        await channel.bulkDelete(messagesToDelete); 

        
        await interaction.guild.members.ban(targetUser, { days: deleteMessageDays, reason: reason });
        await interaction.guild.members.unban(targetUser);

        await interaction.reply({ content: `Successfully softbanned ${targetUser.tag} (deleted messages from the last ${deleteMessageDays} days).`, ephemeral: true });
    } catch (error) {
        console.error('Error softbanning user:', error);
        interaction.reply({ content: 'An error occurred while softbanning the user.', ephemeral: true });
    }
}

function handleDeafenCommand(interaction) {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.DeafenMembers)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }
    
    const taggedMembers = interaction.options.getMember('target');

    if (!taggedMembers.voice.channel) { 
        return interaction.reply({ content: 'Target member is not in a voice channel.', ephemeral: true });
    }
    
    taggedMembers.voice.setDeaf(true)
        .then(() => interaction.reply({ content: `Deafened ${taggedMembers.displayName} in ${taggedMembers.voice.channel}.`, ephemeral: true }))
        .catch(error => {
            console.error('Error deafening member:', error);
            interaction.reply({ content: 'An error occurred while deafening the member.', ephemeral: true });
        });
}

function handleUndeafenCommand(interaction) {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.DeafenMembers)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }
    
    const taggedMembers = interaction.options.getMember('target');
    
    if (!taggedMembers.voice.channel) { 
        return interaction.reply({ content: 'Target member is not in a voice channel.', ephemeral: true });
    }

    taggedMembers.voice.setDeaf(false)
        .then(() => interaction.reply({ content: `Undeafened ${taggedMembers.displayName} in ${taggedMembers.voice.channel}.`, ephemeral: true }))
        .catch(error => {
            console.error('Error undeafening member:', error);
            interaction.reply({ content: 'An error occurred while undeafening the member.', ephemeral: true });
        });
}

async function handleHelpCommand(interaction, client) {
    
    await interaction.deferReply({ ephemeral: true });

    try {
        
        const allCommands = await Promise.all(
            client.guilds.cache.map(guild => guild.commands.fetch())
        );

        const globalCommands = client.application.commands.cache; // Fetch global commands separately
        const commands = allCommands.flat().concat(Array.from(globalCommands.values()));

        const uniqueCommands = new Set(commands.map(cmd => `/${cmd.name} - ${cmd.description}`));

        const commandList = Array.from(uniqueCommands).join('\n');

        const embed = new EmbedBuilder()
            .setColor(mainColor)
            .setTitle('Available Commands ')
            .setDescription(commandList || 'No commands found.')
            .addFields({ name: 'Issue with command', value: 'As it fetches all the command from guild/globe so it may show some and some not use again  `/help` command again', inline: true })
            

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error('Error fetching or displaying commands:', error);
        interaction.editReply({ content: 'An error occurred while fetching commands.', ephemeral: true });
    }
}

console.log(PermissionsBitField.Flags.SEND_MESSAGES); 
client.login(token); 

