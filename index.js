require("dotenv").config();

process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder
} = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const express = require("express");

const app = express();
const snipes = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ]
});

const PREFIX = process.env.PREFIX || ".";
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("Bot aktif 🔥");
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong 🏓");
});

app.listen(PORT, () => {
  console.log(`Web server çalışıyor | Port: ${PORT}`);
});

client.once("ready", () => {
  console.log(`${client.user.tag} olarak giriş yapıldı.`);
});

client.on("error", (err) => {
  console.error("Discord client error:", err);
});

client.on("shardError", (err) => {
  console.error("Shard error:", err);
});

client.on("warn", (info) => {
  console.warn("Discord warn:", info);
});

client.on("messageDelete", (message) => {
  try {
    if (!message.guild) return;
    if (!message.author || message.author.bot) return;

    snipes.set(message.channel.id, {
      content: message.content,
      author: message.author,
      createdAt: message.createdAt
    });
  } catch (err) {
    console.error("messageDelete HATASI:", err);
  }
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (message.content.toLowerCase() === "selam") {
      return message.reply("Sanada selam fıstık");
    }

    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();

    if (!command) return;

    if (command === "join") {
      try {
        const member = await message.guild.members.fetch(message.author.id);
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
          return message.reply("Komutu yazan hesap şu an bir ses kanalında değil.");
        }

        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
          selfDeaf: false
        });

        return message.reply(`Ses kanalına girdim: ${voiceChannel.name} 🔊`);
      } catch (error) {
        console.error("JOIN HATASI:", error);
        return message.reply("Ses kanalına girerken hata oluştu.");
      }
    }

    if (command === "leave") {
      try {
        const connection = getVoiceConnection(message.guild.id);

        if (!connection) {
          return message.reply("Zaten ses kanalında değilim.");
        }

        connection.destroy();
        return message.reply("Ses kanalından çıktım 🚪");
      } catch (error) {
        console.error("LEAVE HATASI:", error);
        return message.reply("Ses kanalından çıkarken hata oluştu.");
      }
    }

    if (command === "snipe") {
      try {
        const data = snipes.get(message.channel.id);

        if (!data) {
          return message.reply("Silinen mesaj yok 😢");
        }

        const embed = new EmbedBuilder()
          .setAuthor({
            name: data.author.tag,
            iconURL: data.author.displayAvatarURL({ forceStatic: false })
          })
          .setDescription(data.content || "*Mesaj içeriği yok*")
          .setFooter({ text: "Silinen mesaj" })
          .setTimestamp(data.createdAt)
          .setColor(0xff0000);

        return message.reply({ embeds: [embed] });
      } catch (error) {
        console.error("SNIPE HATASI:", error);
        return message.reply("Snipe komutunda hata oluştu.");
      }
    }

    if (command === "avatar") {
      try {
        const user = message.mentions.users.first() || message.author;

        const embed = new EmbedBuilder()
          .setTitle(`${user.username} adlı kullanıcının avatarı`)
          .setImage(user.displayAvatarURL({ size: 1024, forceStatic: false }))
          .setColor(0x5865f2);

        return message.reply({ embeds: [embed] });
      } catch (error) {
        console.error("AVATAR HATASI:", error);
        return message.reply("Avatar komutunda hata oluştu.");
      }
    }

    if (command === "ship") {
      try {
        const target = message.mentions.users.first();
        const user1 = message.author;
        let user2;

        if (target) {
          if (target.bot) {
            return message.reply("Botlarla ship olmaz 😔");
          }

          if (target.id === message.author.id) {
            return message.reply("Kendinle kendini shipleyemezsin 😭");
          }

          user2 = target;
        } else {
          const members = message.guild.members.cache
            .filter((m) => !m.user.bot && m.id !== message.author.id)
            .map((m) => m.user);

          if (members.length === 0) {
            return message.reply("Ship yapılacak kimse yok 😢");
          }

          user2 = members[Math.floor(Math.random() * members.length)];
        }

        const lovePercent = Math.floor(Math.random() * 101);

        let comment = "Eh işte, zorlasan olur 😅";
        if (lovePercent >= 90) comment = "Ruh eşi çıktınız ❤️";
        else if (lovePercent >= 75) comment = "Alev alev ilişki 🔥";
        else if (lovePercent >= 50) comment = "Olabilir aslında 😉";
        else if (lovePercent >= 25) comment = "Biraz karışık 😬";
        else comment = "Bundan bi şey çıkmaz 💀";

        const filled = Math.floor(lovePercent / 10);
        const empty = 10 - filled;
        const bar = "💖".repeat(filled) + "🤍".repeat(empty);

        const avatar1 = user1.displayAvatarURL({ extension: "png", size: 256 });
        const avatar2 = user2.displayAvatarURL({ extension: "png", size: 256 });
        const shipImage = `https://api.popcat.xyz/ship?user1=${encodeURIComponent(avatar1)}&user2=${encodeURIComponent(avatar2)}`;

        const embed = new EmbedBuilder()
          .setColor(0xff69b4)
          .setTitle("💘 Ship Sonucu")
          .addFields(
            { name: "Kişiler", value: `${user1.username} 💞 ${user2.username}` },
            { name: "Uyum", value: `%${lovePercent}\n${bar}` },
            { name: "Yorum", value: comment }
          )
          .setThumbnail(user1.displayAvatarURL({ size: 256, forceStatic: false }))
          .setFooter({
            text: `Shipleyen: ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ size: 256, forceStatic: false })
          })
          .setTimestamp()
          .setImage(shipImage);

        return message.reply({ embeds: [embed] });
      } catch (err) {
        console.error("SHIP HATASI:", err);

        try {
          const target = message.mentions.users.first();
          const user1 = message.author;
          let user2;

          if (target && !target.bot && target.id !== message.author.id) {
            user2 = target;
          } else {
            const members = message.guild.members.cache
              .filter((m) => !m.user.bot && m.id !== message.author.id)
              .map((m) => m.user);

            if (members.length === 0) {
              return message.reply("Ship yapılacak kimse yok 😢");
            }

            user2 = members[Math.floor(Math.random() * members.length)];
          }

          const lovePercent = Math.floor(Math.random() * 101);

    let comment = "Eh işte, zorlasan olur 😅";
          if (lovePercent >= 90) comment = "Ruh eşi çıktınız ❤️";
          else if (lovePercent >= 75) comment = "Alev alev ilişki 🔥";
          else if (lovePercent >= 50) comment = "Olabilir aslında 😉";
          else if (lovePercent >= 25) comment = "Biraz karışık 😬";
          else comment = "Bundan bi şey çıkmaz 💀";

          const filled = Math.floor(lovePercent / 10);
          const empty = 10 - filled;
          const bar = "💖".repeat(filled) + "🤍".repeat(empty);

          const fallbackEmbed = new EmbedBuilder()
            .setColor(0xff69b4)
            .setTitle("💘 Ship Sonucu")
            .addFields(
              { name: "Kişiler", value: `${user1.username} 💞 ${user2.username}` },
              { name: "Uyum", value: `%${lovePercent}\n${bar}` },
              { name: "Yorum", value: comment }
            )
            .setThumbnail(user1.displayAvatarURL({ size: 256, forceStatic: false }))
            .setFooter({
              text: `Shipleyen: ${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ size: 256, forceStatic: false })
            })
            .setTimestamp();

          return message.reply({ embeds: [fallbackEmbed] });
        } catch (fallbackErr) {
          console.error("SHIP FALLBACK HATASI:", fallbackErr);
          return message.reply("Ship komutunda bir hata oldu 😭");
        }
      }
    }

    if (command === "spotify") {
      try {
        const member = message.mentions.members.first() || message.member;

        const spotifyActivity = member.presence?.activities?.find(
          (activity) =>
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
          .setColor(0x1db954)
          .setTimestamp();

        if (image) {
          embed.setThumbnail(image);
        }

        return message.reply({ embeds: [embed] });
      } catch (err) {
        console.error("SPOTIFY HATASI:", err);
        return message.reply("Spotify komutunda bir hata oldu 😭");
      }
    }
  } catch (err) {
    console.error("messageCreate GENEL HATA:", err);

    try {
      return message.reply("Komutta beklenmeyen bir hata oluştu.");
    } catch {
      return;
    }
  }
});

if (!process.env.TOKEN) {
  console.error("TOKEN bulunamadı. Render environment variables içine TOKEN ekle.");
  process.exit(1);
}

client.login(process.env.TOKEN).catch((err) => {
  console.error("LOGIN HATASI:", err);
});
