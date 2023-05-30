"use strict";

require("dotenv").config();
var Discord = require("./../node_modules/discord.js");
var Color   = require("./color").Color;

var client = new Discord.Client();

var prefix = "woon.";

client.on("message", message => {

  // <messageText> contains the entirety of the command invocation.
  var messageText = message.content;

  // Only the selfbot owner may run the selfbot.
  if (message.author.id === process.env.USER_ID && messageText.startsWith(prefix)) {

    // These are simple arrow functions used in <Promise.prototype.then> after the bot successfully completes an action
    // called from a command.
    var deleteMessage = ()    => { message.delete();   }; // resolve
    var logError      = error => { console.log(error); }; // reject

    // <commandFull> contains the command invocation without the prefix.
    var commandFull = messageText.substring(prefix.length).trim();

    // <commandGroup> contains the text between the prefix and the period separating it from <commandName>.
    var commandGroup = commandFull.split(" ")[0].substring(0, commandFull.indexOf(".")).trim().toLowerCase();

    // <command> contains the command invocation starting from the <commandName>. It only factors in a "." if a
    // <commandGroup> is provided.
    var command = messageText.substring((prefix + commandGroup + (commandGroup ? "." : "")).length).trim();

    // <commandName> contains the text in <command> before the first space.
    var commandName = command.split(" ")[0].trim().toLowerCase();
    // <commandArgs> contains all the text in <command> after the first space.
    var commandArgs = command.substring(command.indexOf(" ")).trim();

    // Command group "COLOR" //////////////////////////////////////////////////
    if (commandGroup == "color") {

      if (commandName == "values") {

        var color = Color.fromFormatted(nthArgOf(commandArgs, 0));

        var embed = initializeEmbed()
          .setColor(color.format("hex"))

          .addField("Red"             , color.r, true)
          .addField("Green"           , color.g, true)
          .addField("Blue"            , color.b, true)

          .addField("Red (Hex)"       , toHexString(color.r), true)
          .addField("Green (Hex)"     , toHexString(color.g), true)
          .addField("Blue (Hex)"      , toHexString(color.b), true)

          .addField("Hue"             , color.h + "°", true)
          .addField("Saturation (HSL)", (color.s    / 51 * 20) + "%", true)
          .addField("Lightness"       , (color.l    / 51 * 20) + "%", true)

          .addBlankField(true)
          .addField("Saturation (HSV)", (color.sHSV / 51 * 20) + "%", true)
          .addField("Value"           , (color.v    / 51 * 20) + "%", true);

        message.channel.send({ embed })
          .then(deleteMessage, logError);

      } // end command "woon.color.values"

      else if (commandName == "format") {

        var color = Color.fromFormatted(nthArgOf(commandArgs, 0));

        var outputColorType = nthArgOf(commandArgs, 1);

        var embed = initializeEmbed()
          .setColor(color.toString("hex"));
        
        if (outputColorType.startsWith("hsl")) {
          embed.addField("Output", color.format("hsl"));

        } else if (outputColorType.startsWith("hex")) {
          embed.addField("Output", color.format("hex"));

        } else {
          embed.addField("Output", color.format(/* rgb */));

        }

        message.channel.send({ embed })
          .then(deleteMessage, logError);

      } // end command "woon.color.format"

    } // end command group "woon.color"

    else if (commandName == "stop") {

      message.delete()
        .then(
          () => { process.exit(); },
          logError
        );

    } // end command "woon.stop"

    function initializeEmbed() {
      
      return new Discord.RichEmbed()
        .setTitle("__" + commandGroup + "." + commandName + "__")
        .addField("Input", commandArgs)
        .setFooter("Query made at " + new Date(message.createdAt).toUTCString());

    }

  } // end message author restriction

}); // end <client.on>

function nthArgOf(string, n) {
  if (!string) {
    return "";
  }

  var arg = string.split(" ")[n || 0];

  if (!arg) {
    return "";
  }

  return arg.trim();
}

function argArrayFrom(string, start, end) {
  return string.split(" ").slice(start, end);
}

function toHexString(n) {
  var string = n.toString(16);

  return string.length == 1 ? "0" + string : string;
}

client.login(process.env.TOKEN);