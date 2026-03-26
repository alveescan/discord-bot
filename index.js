require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder
} = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const snipes = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

const PREFIX = process.env.PREFIX || ".";

client.once("ready", () => {
  console.log(`${client.user.tag} olarak giriş yapıldı.`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (message.content.toLowerCase() === "selam") {
    return message.reply("Sanada selam fıstık");
  }

  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  if (command === "join") {
  try {
    const member = await message.guild.members.fetch(message.author.id);
    const voiceChannel = member.voice.channel;

    console.log("Komutu yazan:", message.author.tag);
    console.log("Voice channel:", voiceChannel ? voiceChannel.name : "YOK");

    if (!voiceChannel) {
      return message.reply("Komutu yazan hesap şu an bir ses kanalında değil.");
    }

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    return message.reply(`Ses kanalına girdim: ${voiceChannel.name} 🔊`);
  } catch (error) {
    console.error("JOIN HATASI:", error);
    return message.reply("Ses kanalına girerken hata oluştu.");
  }
}
if (command === "leave") {
  const connection = getVoiceConnection(message.guild.id);

  if (!connection) {
    return message.reply("Zaten ses kanalında değilim.");
  }

  connection.destroy();

  return message.reply("Ses kanalından çıktım 🚪");
}
  if (command === "snipe") {
  const data = snipes.get(message.channel.id);

  if (!data) {
    return message.reply("Silinen mesaj yok 😢");
  }

  const embed = new EmbedBuilder()
    .setAuthor({
      name: data.author.tag,
      iconURL: data.author.displayAvatarURL({ dynamic: true })
    })
    .setDescription(data.content || "*Mesaj içeriği yok*")
    .setFooter({ text: "Silinen mesaj" })
    .setTimestamp(data.createdAt)
    .setColor(0xff0000);

  return message.reply({ embeds: [embed] });
}

  if (command === "avatar") {
  const user = message.mentions.users.first() || message.author;

  const embed = new EmbedBuilder()
    .setTitle(`${user.username} adlı kullanıcının avatarı`)
    .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
    .setColor(0x5865F2);

  return message.reply({ embeds: [embed] });
  }
  if (command === "ship") {
    const members = message.guild.members.cache
      .filter(member => !member.user.bot)
      .map(member => member.user);

    if (members.length < 2) {
      return message.reply("Ship için en az 2 gerçek kullanıcı lazım.");
    }

    const shuffled = members.sort(() => 0.5 - Math.random());
    const user1 = shuffled[0];
    const user2 = shuffled[1];
    const percent = Math.floor(Math.random() * 101);

    return message.reply(`💘 ${user1.username} × ${user2.username}\nAşk oranı: **%${percent}**`);
  }

  if (command === "spotify") {
    const member = message.mentions.members.first() || message.member;

    const spotifyActivity = member.presence?.activities?.find(
      activity =>
        activity.type === ActivityType.Listening &&
        activity.name === "Spotify"
    );

    if (!spotifyActivity) {
      return message.reply(`${member.user.username} şu an Spotify dinlemiyor ya da durumu görünmüyor.`);
    }

    const song = spotifyActivity.details || "Bilinmeyen şarkı";
    const artist = spotifyActivity.state || "Bilinmeyen sanatçı";
    const album = spotifyActivity.assets?.largeText || "Bilinmeyen albüm";
    const image = spotifyActivity.assets?.largeImage
      ? `https://i.scdn.co/image/${spotifyActivity.assets.largeImage.replace("spotify:", "")}`
      : null;

    const embed = new EmbedBuilder()
      .setTitle("Spotify Dinliyor")
      .setDescription(`**Kullanıcı:** ${member.user.username}`)
      .addFields(
        { name: "Şarkı", value: song, inline: false },
        { name: "Sanatçı", value: artist, inline: false },
        { name: "Albüm", value: album, inline: false }
      )
      .setColor(0x1DB954);

    if (image) embed.setThumbnail(image);

    return message.reply({ embeds: [embed] });
  }
});
client.on("messageDelete", (message) => {
  if (!message.guild) return;
  if (message.author?.bot) return;

  snipes.set(message.channel.id, {
    content: message.content,
    author: message.author,
    createdAt: message.createdAt
  });
});
client.login(process.env.TOKEN);
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot aktif 🔥");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server çalışıyor");
});
