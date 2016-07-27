module.exports = {
    SET_TOPIC: 'SET_TOPIC',

    /**
     * Action creator for setting the topic
     */
    setTopic({ chan, topic }) {
        return {
            type: module.exports.SET_TOPIC,
            chan,
            topic
        };
    },

    SET_TOPIC_WHO: 'SET_TOPIC_WHO',

    /**
     * Action creator for setting the topic who and time
     */
    setTopicWho({ chan, hostmask, time }) {
        return {
            type: module.exports.SET_TOPIC_WHO,
            chan,
            hostmask,
            time
        };
    },

    UPDATE_NAMES: 'UPDATE_NAMES',

    /**
     * Action creator for updating channel users from NAMES reply.
     */
    updateNames({ chan, names }) {
        return {
            type: module.exports.UPDATE_NAMES,
            chan,
            names
        };
    },

    USER_JOIN: 'USER_JOIN',

    /**
     * Action creator for a user joining a channel.
     */
    userJoin({ chan, nick, me }) {
        return {
            type: module.exports.USER_JOIN,
            chan,
            nick,
            me
        };
    },

    USER_LEAVE: 'USER_LEAVE',

    /**
     * Action creator for a user leaving a channel.
     */
    userLeave({ chan, nick, me }) {
        return {
            type: module.exports.USER_LEAVE,
            chan,
            nick,
            me
        };
    },

    USER_QUIT: 'USER_QUIT',

    /**
     * Action creator for a user quitting a channel.
     */
    userQuit({ nick }) {
        return {
            type: module.exports.USER_QUIT,
            nick
        };
    },

    ADD_CHANNEL_MODE: 'ADD_CHANNEL_MODE',

    /**
     * Action creator for adding a mode to a channel.
     * @param {Object} state The current state
     * @param {Object} e The +mode event object from squelch-client
     */
    addChannelMode(state, { chan, mode, param }) {
        return {
            type: module.exports.ADD_CHANNEL_MODE,
            prefix: state.iSupport['PREFIX'][mode] || undefined,
            chan,
            mode,
            param
        };
    },

    REMOVE_CHANNEL_MODE: 'REMOVE_CHANNEL_MODE',

    /**
     * Action creator for removing a mode to a channel.
     * @param {Object} state The current state
     * @param {Object} e The -mode event object from squelch-client
     */
    removeChannelMode(state, { chan, mode, param }) {
        return {
            type: module.exports.REMOVE_CHANNEL_MODE,
            prefix: state.iSupport['PREFIX'][mode] || undefined,
            chan,
            mode,
            param
        };
    },

    REMOVE_CHANNEL: 'REMOVE_CHANNEL',

    /**
     * Action creator for removing the data for a channel.
     */
    removeChannel({ chan }) {
        return {
            type: module.exports.REMOVE_CHANNEL,
            chan
        };
    },

    SET_ISUPPORT: 'SET_ISUPPORT',

    /**
     * Action creator for a updating iSupport values.
     * Accepts parsed reply from squelch-client raw event
     */
    setISupport({ params }) {
        const iSupport = {};
        for(const item of params.slice(1)) {
            // Skip the last param, which is usually something like
            // ":is supported by this server"
            if(item.indexOf(' ') !== -1) break;

            const split = item.split('=');
            if(split.length === 1) {
                iSupport[item] = true;
            }
            else if(split[0] === 'PREFIX') {
                iSupport['PREFIX'] = {};
                const match = /\((.+)\)(.+)/.exec(split[1]);
                for(let i = 0; i < match[1].length; i++) {
                    iSupport['PREFIX'][match[1][i]] = match[2][i];
                }
            }
            else if(split[0] === 'CHANMODES') {
                iSupport['CHANMODES'] = split[1].split(',');
                // CHANMODES[0,1] always require param
                // CHANMODES[2] requires param on set
                // CHANMODES[3] never require param
            }
            else {
                iSupport[split[0]] = split[1];
            }
        }

        return {
            type: module.exports.SET_ISUPPORT,
            iSupport
        };
    },

    SET_CONNECTED: 'SET_CONNECTED',

    /**
     * Action creator for setting the connected status.
     */
    setConnected(connected) {
        return {
            type: module.exports.SET_CONNECTED,
            connected
        };
    },

    SET_CONNECTING: 'SET_CONNECTING',

    /**
     * Action creator for setting the connecting status.
     */
    setConnecting(connecting) {
        return {
            type: module.exports.SET_CONNECTING,
            connecting
        };
    },

    CHANGE_NICK: 'CHANGE_NICK',

    changeNick({ oldNick, newNick }) {
        return {
            type: module.exports.CHANGE_NICK,
            oldNick,
            newNick
        };
    },

    DISCONNECT: 'DISCONNECT',

    disconnect() {
        return {
            type: module.exports.DISCONNECT
        };
    }
};
