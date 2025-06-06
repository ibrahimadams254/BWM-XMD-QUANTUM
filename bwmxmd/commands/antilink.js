// File: plugins/antilink.js

const { GroupMetadata, MessageType } = require('@adiwajshing/baileys'); // or whichever library you're using
const config = require('../config');

const linkRegex = /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com)\/[A-Za-z0-9]{20,24}/gi;

module.exports = {
  name: 'antilink',
  description: 'Anti-link system for groups',
  type: 'group',

  async execute(client, message, args, userData, groupData) {
    try {
      const isGroup = message.key.remoteJid.endsWith('@g.us');
      if (!isGroup) return;

      const groupMetadata = await client.groupMetadata(message.key.remoteJid);
      const isAdmin = groupMetadata.participants.some(p => p.jid === message.key.participant && p.admin !== null);
      const botAdmin = groupMetadata.participants.some(p => p.jid === client.user.jid && p.admin !== null);

      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (linkRegex.test(text)) {
        if (!botAdmin) return client.sendMessage(message.key.remoteJid, { text: "I need to be an admin to manage links." });

        // Warn
        await client.sendMessage(message.key.remoteJid, {
          text: `⚠️ *Warning:* ${message.pushName}, posting group links is not allowed here!`,
          quoted: message,
        });

        // Delete message
        await client.sendMessage(message.key.remoteJid, {
          delete: {
            remoteJid: message.key.remoteJid,
            fromMe: false,
            id: message.key.id,
            participant: message.key.participant,
          }
        });

        // Remove user
        if (!isAdmin) {
          await client.groupParticipantsUpdate(
            message.key.remoteJid,
            [message.key.participant],
            'remove'
          );
        }
      }
    } catch (err) {
      console.error('[❌ Antilink Error]', err);
    }
  }
};
