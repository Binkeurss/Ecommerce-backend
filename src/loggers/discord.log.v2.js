"use strict";

const { Client, GatewayIntentBits, PermissionFlagsBits } = require("discord.js");
const { CHANNEL_ID_DISCORD, TOKEN_MITSUHA_DISCORD } = process.env;

class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    // Add channel ID
    this.channelId = CHANNEL_ID_DISCORD;

    // Event listener for client ready state
    this.client.on('ready', async () => {
      console.log(`Logged in as ${this.client.user.tag}`);
      
      try {
        // Fetch the channel to ensure it's accessible
        const channel = await this.client.channels.fetch(this.channelId);
        console.log(`Successfully found channel: ${channel.name}`);
      } catch (error) {
        console.error(`Error finding channel: ${error.message}`);
      }
    });

    // Error handling for login
    this.client.on('error', console.error);

    // Login to Discord
    this.client.login(TOKEN_MITSUHA_DISCORD);
  }

  async sendToFormatCode(logData) {
    const {
      code,
      message = "This is some additional information about the code",
      title = "Code Example",
    } = logData;
    
    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt("00ff00", 16), // Convert hexadecimal color to integer
          title,
          description: `\`\`\`json\n${JSON.stringify(code, null, 2)}\n\`\`\``,
        },
      ],
    };
    
    await this.sendToMessage(codeMessage);
  }

  async sendToMessage(message = "message") {
    try {
      // Fetch the channel directly before sending
      const channel = await this.client.channels.fetch(this.channelId);
      
      if (!channel) {
        console.log(`Couldn't find the channel: ${this.channelId}`);
        return;
      }

      await channel.send(message);
    } catch (error) {
      console.error(`Error sending message: ${error.message}`);
      console.log(`Channel ID attempted: ${this.channelId}`);
      
      // Log all available channels for debugging
      const channels = this.client.channels.cache.map(ch => `${ch.id} (${ch.name || 'unnamed'})`);
      console.log("Available channels:", channels);
    }
  }
}

const loggerService = new LoggerService();

module.exports = loggerService;