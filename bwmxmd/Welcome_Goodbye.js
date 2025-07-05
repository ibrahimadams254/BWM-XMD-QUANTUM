//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7


const { createContext } = require('../Ibrahim/helper');

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;
        const welcomeImage = 'https://files.catbox.moe/h2ydge.jpg';
        
        // Cache for group names
        const groupCache = new Map();
        setInterval(() => groupCache.clear(), 3600000);

        adams.ev.on('group-participants.update', async (update) => {
            try {
                const { id, participants, action } = update;

                // Get group metadata
                let groupName = groupCache.get(id);
                if (!groupName) {
                    const metadata = await adams.groupMetadata(id);
                    groupName = metadata.subject || "this group";
                    groupCache.set(id, groupName);
                }

                const contextOptions = {
                    title: "Group Notification",
                    body: `${action === 'add' ? 'New Member' : 'Departure'}`,
                    thumbnail: welcomeImage
                };

                for (const participant of participants) {
                    if (participant === botJid) continue;

                    if (action === 'add' && config.WELCOME_MESSAGE === 'yes') {
                        const welcomeMessages = [
                            `Welcome to ${groupName}, @${participant.split('@')[0]}. We're pleased to have you join us.`,
                            `@${participant.split('@')[0]} has joined ${groupName}. A warm welcome to you!`,
                            `We welcome @${participant.split('@')[0]} to ${groupName}. Feel free to introduce yourself.`,
                            `Greetings, @${participant.split('@')[0]}. Welcome to ${groupName}.`
                        ];
                        
                        await adams.sendMessage(id, {
                            image: { url: welcomeImage },
                            caption: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
                            mentions: [participant],
                            ...createContext(participant, contextOptions)
                        });
                    }
                    else if (action === 'remove' && config.GOODBYE_MESSAGE === 'yes') {
                        const farewellMessages = [
                            `@${participant.split('@')[0]} has left ${groupName}. We appreciate your participation.`,
                            `We note @${participant.split('@')[0]}'s departure from ${groupName}. Thank you for your contributions.`,
                            `@${participant.split('@')[0]} is no longer with us in ${groupName}. Wishing you all the best.`,
                            `Farewell to @${participant.split('@')[0]} from ${groupName}. It's been a pleasure.`
                        ];
                        
                        await adams.sendMessage(id, {
                            text: farewellMessages[Math.floor(Math.random() * farewellMessages.length)],
                            mentions: [participant],
                            ...createContext(participant, {
                                ...contextOptions,
                                thumbnail: 'https://files.catbox.moe/sd49da.jpg'
                            })
                        });
                    }
                }
            } catch (err) {
                logger.error('Greeting system error:', err);
            }
        });
    }
};
