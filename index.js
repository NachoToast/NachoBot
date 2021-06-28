const bootStartTime = new Date().getTime();

// client instantiation
const fs = require('fs');
const cron = require('node-cron');
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandNames = [];
const commandNameAliases = {};
const allAliases = [];

const config = require('./config.json');
const nachoWhitelistAPI = require('./apis/whitelist_check');
//const roleClaimInit = require('./react_roles/init');

// prefix validation checks
{
  if (
    config?.prefixes === undefined || // prefixes not defined
    !Array.isArray(config.prefixes) || // prefixes not an array
    config.prefixes.length < 1 || // prefixes empty array
    config.prefixes.some((e) => e.length < 1) // some prefixes are ''
  ) {
    console.log(
      'Invalid prefixes detected! Please make a valid prefixes array in config!'
    );
    return;
  }
}

const reactPool = [
  // bot must be in the server these emotes are from
  '🥳',
  '💜',
  '<a:ratJAM:797566731748638741>',
  '<a:headbang:604895069161521175>',
  '<a:angeryping:555295819314757632>',
  '<:respekt:598110434893234186>',
  '<:obama:610371105219280896>',
  '<:PogO:791539032735088641>',
  '<:PogU:764740680525676544>',
];

// command file getting
const commandFolders = fs.readdirSync('./commands');
const duplicateAliases = {};
for (const folder of commandFolders) {
  // read subdirectories (1 layer deep only)
  const command_files = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith('.js'));

  for (const file of command_files) {
    const command = require(`./commands/${folder}/${file}`);
    // add name
    client.commands.set(command.name, command);
    commandNames.push(command.name);

    // add aliases if present
    if (command?.aliases !== undefined) {
      command.aliases.forEach((e) => {
        // duplicate alias checking
        if (allAliases.indexOf(e) !== -1) {
          // no recorded duplicate aliases
          if (duplicateAliases.hasOwnProperty(e)) {
            duplicateAliases[e].push(command.name);
          } else {
            duplicateAliases[e] = [commandNameAliases[e], command.name];
          }
        } else {
          commandNameAliases[e] = command.name;
          allAliases.push(e);
        }
      });
    }
  }
}

// duplicate alias resolving
{
  if (Object.keys(duplicateAliases).length > 0) {
    console.log(
      `Found ${
        Object.keys(duplicateAliases).length
      } duplicate command aliases:`,
      duplicateAliases
    );
    return;
  }
}

client.on('ready', () => {
  const bootFinishTime = new Date();
  console.log(`---\n${bootFinishTime.toLocaleString()}`);
  console.log(`Logged in as ${client.user.tag}`);
  console.log(
    `Boot time: ${((bootFinishTime.getTime() - bootStartTime) / 1000).toFixed(
      2
    )}s`
  );
  if (config.devmode) {
    console.log(`Running in development mode.`);
  }

  // scheduling
  cron.schedule(
    `*/${Math.ceil(
      config.commands.nachotoastMC.whitelistCheckInterval
    )} * * * *`,
    () => nachoWhitelistAPI(client)
  );
  // cron.schedule(`*/ * * * * *`, () => nachoWhitelistAPI(client));

  nachoWhitelistAPI(client);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  if (message.author.id == '190747796452671488') return; // i hate justin :)

  const inDevGuild = config.devServers.indexOf(message.guild?.id) !== -1;
  const directMessage = message.channel.type === 'dm';

  if (config.devmode !== inDevGuild && !directMessage) {
    // skip if devmode enabled but not in development server, or vice versa (excluding dms)
    return;
  }

  // birthday react module
  {
    if (
      config.commands.birthday.enabled &&
      !directMessage &&
      (message.mentions.members
        .map((e) => e.nickname)
        .filter((e) => e !== null)
        .some((e) => e.toLowerCase().includes('happy birthday')) ||
        message.content.toLowerCase().includes('happy birthday'))
    ) {
      message.react(reactPool[Math.floor(Math.random() * reactPool.length)]);
      return;
    }
  }

  // prefix, command, args construction
  const args = message.content
    .toLowerCase()
    .trim()
    .split(' ')
    .filter((e) => e.length > 0);
  const prefix = args.shift();
  let command = args.shift();

  // prefix validation
  if (config.prefixes.indexOf(prefix) === -1) {
    return;
  }

  // command validation
  if (commandNames.indexOf(command) === -1) {
    if (allAliases.indexOf(command) === -1) {
      // command and alias not found
      message.reply(`Command '${command}' not found.`);
      return;
    }

    // alias found
    command = commandNameAliases[command];
  }

  client.commands.get(command).execute(client, message, args);

  {
    /*   if (message.content.toLowerCase().startsWith('nachobot')) {
    message.reply(
      `Look here, you ape-brained clown, you absolute idiot, you troglodyte of a human being. Responding to normal commands is extremely old. Discord had the brains to realize that when bots are choosing more prefixes than the average CIA employee something needed to change. Lo and behold bots now respond ***directly*** to slash commands.\nTry it, I dare you, start typing /ping or /help or *any* shitty command and allow your boomer eyes to see what comes up. Fuck you 🥰`
    );
  } */
  }
});

// interaction
{
  /*   client.on('interaction', async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.user.bot) {
      interaction.reply(`No.`);
      return;
    }

    if (interaction.commandName === 'help' && interaction?.options.length > 0)
      var helpmode = true;
    else helpmode = false;

    if (helpmode)
      var command = client.commands.get(interaction.options[0].value);
    else var command = client.commands.get(interaction.commandName);

    try {
      if (helpmode) await command.execute_help(client, interaction);
      else await command.execute(client, interaction);
    } catch (err) {
      if (
        err instanceof TypeError &&
        err.message === "Cannot read property 'execute_help' of undefined"
      ) {
        interaction.reply(
          `This command '${interaction.options[0].value}' doesn't exist, why did you even type help for it in the first place?`,
          { ephemeral: true }
        );
        return;
      }
      if (
        err instanceof TypeError &&
        err.message === "Cannot read property 'execute' of undefined"
      ) {
        console.log(
          `${new Date().toLocaleString()}: Missing command requested: '${
            interaction.commandName
          }'`
        );
        interaction.reply(`This command doesn't appear to exist, unlucky.`, {
          ephemeral: true,
        });
        return;
      }
      if (
        err instanceof TypeError &&
        err.message === 'command.execute_help is not a function'
      ) {
        console.log(
          `${new Date().toLocaleString()}: Missing help subcommand: ${
            interaction.options[0].value
          }`
        );
        interaction.reply(
          `This command doesn't have a help section, enjoy the guess and check.`,
          { ephemeral: true }
        );
        return;
      }
      console.log(
        `${new Date().toLocaleString()}: Unknown error during command execution: ${
          interaction.commandName
        }.`
      );
      if (interaction.options.length > 0)
        console.log(
          `Options: ${interaction.options.map(
            (e) => `\n${e.name}: ${e.value} (${e.type.toLowerCase()})`
          )}`
        );
      console.log(err);
      interaction.reply(
        `You somehow caused an error that I have never seen before, well done shitass.`,
        { ephemeral: true }
      );
    }
  }); */
}

client.login(config.devmode ? config.discordTokenDev : config.discordToken);
