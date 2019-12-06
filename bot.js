const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const express = require("express");
const app = express();
const http = require("http");
/*const ytdl = require('ytdl-core');
var opus = require('node-opus');*/
bot.on("ready", () => {
  var myArray = config.activities;
  bot.user.setActivity(myArray[Math.floor(Math.random() * myArray.length)]);
  setTimeout(() => {bot.user.setActivity(myArray[Math.floor(Math.random() * myArray.length)]);}, 30000)
  
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`); 
});
bot.on('guildMemberAdd', member => {
    member.guild.channels.get('500144687978512406').send("Welcome, "+member.displayName+", to the discord server."); 
});
bot.on("message", async message => {
  try {
  var isMod = message.member.roles.some(r=>["Administrator", "Admin", "Owner", "Mod", "Moderator", "That guy."].includes(r.name))}
  catch (error) {var isMod = false}
  function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
  }
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const uid = message.member.id;
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  if(command === "spam") {
    for (var i = 0; i < 20; i++) {message.channel.send(args[0]);}
  }
  if(command === "yesno") {
    var h = yesno(uid);
  }
  if(command === "nick") {
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    member.setNickname(args[1].replace(/\\/g, ' ')).catch(console.error);
    message.delete();
  }
  async function yesno(uid) {
    var result;
    message.channel.send("Choose").then(async message => {
    await message.react('✔');
    await message.react('❌');
    
    const filter = (reaction, user) => reaction.emoji.name === '✔' || '❌' && user.id === '487443883127472129';
    const collector = message.createReactionCollector(filter);
    await collector.on('collect', r => {if(r.emoji.name === '✔'){result = true}
                                 else if (r.emoji.name === '❌') {result = false} if (result === true) { var yesorno = 'yes'; } else { var yesorno = 'no'; } message.edit(yesorno);});});
    return result;
  }
  if(command === "tell") {
    var user = message.mentions.members.first();
    user.createDM();
    user.send(args[0]);
    
  }
  /*if(command === "play") { var channel = bot.channels.get("499058402111258635");
                         channel.join().then(connection => {
    connection.playStream(ytdl(
  'https://www.youtube.com/watch?v=ZlAU_w7-Xp8',
  { filter: 'audioonly' }));})}*/
  if(command === "help") {
    message.author.createDM();
    message.author.send("Sorry, help is not availible at this time. OR EVER. jk");
    message.channel.send("Sent!");
  }
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(console.error); 
    // And we get the bot to say the thing: 
    return message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!isMod)
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  if(command === "whoareyou") {
    return message.channel.send("Not brody");
  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!isMod)
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  if(command === "del") {
  if(!isMod)
      return message.reply("Sorry, you don't have permissions to use this!");
    // This command removes all messages from all users in the channel, up to 100.
    // get the delete count, as an actual number.
  var deleteCount = parseInt(args[0], 10) + 1;
  
    if (args[0] == "all") {
        async function lol() {
          let fetched;
          fetched = await message.channel.fetchMessages({limit: 100});
          message.channel.bulkDelete(fetched);
          while(fetched.size >= 2) {
            fetched = await message.channel.fetchMessages({limit: 100});
            message.channel.bulkDelete(fetched);
          }
        }
      await lol();
        return;
    }
    // Ooooh nice, combined conditions. <3
    else if(!deleteCount|| deleteCount < 1 || deleteCount > 100) {
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");}
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});
app.get("/", (req, res) => res.send("lol"));
bot.login(config.token);
app.listen(process.env.PORT, console.log(`Site up, with port ${process.env.PORT}`));
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);