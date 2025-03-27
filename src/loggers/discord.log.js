"use strict";
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const token =
  "MTM1NDc0MjAyMTE3NjI5OTYzMQ.GiNptM.LUduYUFrzp-1Jv6TRSJMiBZrsdFaDpOF1WvAi4";

client.login(token);

client.on("ready", () => {
  console.log(`Logged is as ${client.user.tag}`);
});

client.on("messageCreate", (msg) => {
  if(msg.author.bot) {
    return;
  }
  if (msg.content === "hello") {
    msg.reply(`Hello sir! Binkeurs`);
  }
});
