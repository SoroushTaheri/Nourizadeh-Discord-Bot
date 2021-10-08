// @ts-nocheck 
import { Client, VoiceChannel, Intents, MessageEmbed } from 'discord.js';

import {
    joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	StreamType,
	AudioPlayerStatus,
    VoiceConnectionStatus,
    getVoiceConnection
} from "@discordjs/voice";

import { createDiscordJSAdapter } from './adapter';

const config = require("../config.json");

const client:Client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});
const player = createAudioPlayer();

function playSong() {
	const resource = createAudioResource('https://www.dropbox.com/s/091y2cjq6nhlach/audio.mp3?dl=1', {
		inputType: StreamType.Arbitrary,
    });
	player.play(resource);
	return entersState(player, AudioPlayerStatus.Playing, 10e3);
}


async function connectToChannel(channel: VoiceChannel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: createDiscordJSAdapter(channel),
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

client.once("ready", async() => {
	console.log("Connected!");
	
    console.log("Setting up presence ...");
	client.user!.setPresence({
		status: "online",
		activities: [{
			type: "WATCHING",
			name: "VOA FARSI",
		}],
    });
	console.log("Ready to operate!");
});

client.on("messageCreate", async (message) => {
	if (!message.guild) return;
    if (message.author.id === message.guild!.me!.id) return;
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
	
    let command = args[0]?.toLowerCase();
    // @ts-ignore
    if (getUserFromMention(command)) {
        command = "";
    }

	switch (command) {
        case "":
            // message.reply("چشم")
			if (message.member!.voice.channel) {
                // @ts-ignore
                const connection = await connectToChannel(message.member?.voice.channel);
                connection.subscribe(player);
                await playSong();
            }
			if (getUserFromMention(args[0])) {
				message.channel.send(
					`${getUserFromMention(args[0])}\nبه‌به به‌به به‌به ...!\nخوشگلم اومد! ... اومد خوشگل من!`
				);
			}
            break;
        case "leave":
            if (message.guild.me?.voice.channel) {
                getVoiceConnection(message.guild.id)?.disconnect()
            }
            break;
        case "help":
			return message.channel.send({
				embeds: [new MessageEmbed()
					.setColor("GOLD")
					.setTitle("نوری زاده در میان شماست!")
					.setAuthor("سلام و درود!")
					.setDescription(
						`سلام و درود. ارادتمند و خدمتگزار شما، علیرضا نوری زاده هستم و فقط و فقط یک وظیفه دارم.\n\nبرای اجرا:`
					)
					.setThumbnail("https://i.imgur.com/HgXYzJ4.png")
					.addFields({
						name: "خوشگل من ▶️",
						value: "**`>noriz`**",
					},
                    {
						name: "خوشگل من (با منشن) 💭",
						value: "**`>noriz <User>`**",
                    },
                    {
						name: "ترک وویس ❌",
						value: "**`>noriz leave`**",
                    },
                    {
						name: "معرفی / راهنما ❔",
						value: "**`>noriz help`**",
					})
					.setImage("https://i.imgur.com/giJFglt.jpg")
					.setFooter("Nourizadeh Bot | Developed by god knows who for a noriz lover")]
            })

		default:
			break;
	}
});
const getUserFromMention = (mention: string) => {
	if (!mention) return;

	if (mention.startsWith("<@") && mention.endsWith(">")) {
		mention = mention.slice(2, -1);

		if (mention.startsWith("!")) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
};

client.login(config.token);
