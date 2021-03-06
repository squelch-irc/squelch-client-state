module.exports = {
  SET_TOPIC: 'squelch-client-state/SET_TOPIC',

  /**
   * Action creator for setting the topic
   */
  setTopic ({ id, chan, topic }) {
    return {
      id,
      type: module.exports.SET_TOPIC,
      chan,
      topic
    }
  },

  SET_TOPIC_WHO: 'squelch-client-state/SET_TOPIC_WHO',

  /**
   * Action creator for setting the topic who and time
   */
  setTopicWho ({ id, chan, hostmask, time }) {
    return {
      id,
      type: module.exports.SET_TOPIC_WHO,
      chan,
      hostmask,
      time
    }
  },

  UPDATE_NAMES: 'squelch-client-state/UPDATE_NAMES',

  /**
   * Action creator for updating channel users from NAMES reply.
   */
  updateNames ({ id, chan, names }) {
    return {
      id,
      type: module.exports.UPDATE_NAMES,
      chan,
      names
    }
  },

  USER_JOIN: 'squelch-client-state/USER_JOIN',

  /**
   * Action creator for a user joining a channel.
   */
  userJoin ({ id, chan, nick, me }) {
    return {
      id,
      type: module.exports.USER_JOIN,
      chan,
      nick,
      me
    }
  },

  USER_LEAVE: 'squelch-client-state/USER_LEAVE',

  /**
   * Action creator for a user leaving a channel.
   */
  userLeave ({ id, chan, nick, me }) {
    return {
      id,
      type: module.exports.USER_LEAVE,
      chan,
      nick,
      me
    }
  },

  USER_QUIT: 'squelch-client-state/USER_QUIT',

  /**
   * Action creator for a user quitting a channel.
   */
  userQuit ({ id, nick, channels }) {
    return {
      id,
      type: module.exports.USER_QUIT,
      nick,
      channels
    }
  },

  ADD_CHANNEL_MODE: 'squelch-client-state/ADD_CHANNEL_MODE',

  /**
   * Action creator for adding a mode to a channel.
   * @param {Object} state The current state
   * @param {Object} e The +mode event object from squelch-client
   */
  addChannelMode (state, { id, chan, mode, param }) {
    return {
      id,
      type: module.exports.ADD_CHANNEL_MODE,
      prefix: state.iSupport['PREFIX'][mode] || undefined,
      chan,
      mode,
      param
    }
  },

  REMOVE_CHANNEL_MODE: 'squelch-client-state/REMOVE_CHANNEL_MODE',

  /**
   * Action creator for removing a mode to a channel.
   * @param {Object} state The current state
   * @param {Object} e The -mode event object from squelch-client
   */
  removeChannelMode (state, { id, chan, mode, param }) {
    return {
      id,
      type: module.exports.REMOVE_CHANNEL_MODE,
      prefix: state.iSupport['PREFIX'][mode] || undefined,
      chan,
      mode,
      param
    }
  },

  REMOVE_CHANNEL: 'squelch-client-state/REMOVE_CHANNEL',

  /**
   * Action creator for removing the data for a channel.
   */
  removeChannel ({ id, chan }) {
    return {
      id,
      type: module.exports.REMOVE_CHANNEL,
      chan
    }
  },

  SET_ISUPPORT: 'squelch-client-state/SET_ISUPPORT',

  /**
   * Action creator for a updating iSupport values.
   * Accepts parsed reply from squelch-client raw event
   */
  setISupport ({ id, params }) {
    const iSupport = {}
    for (const item of params.slice(1)) {
      // Skip the last param, which is usually something like
      // ":is supported by this server"
      if (item.indexOf(' ') !== -1) break

      const split = item.split('=')
      if (split.length === 1) {
        iSupport[item] = true
      } else if (split[0] === 'PREFIX') {
        iSupport['PREFIX'] = {}
        const match = /\((.+)\)(.+)/.exec(split[1])
        for (let i = 0; i < match[1].length; i++) {
          iSupport['PREFIX'][match[1][i]] = match[2][i]
        }
      } else if (split[0] === 'CHANMODES') {
        iSupport['CHANMODES'] = split[1].split(',')
        // CHANMODES[0,1] always require param
        // CHANMODES[2] requires param on set
        // CHANMODES[3] never require param
      } else {
        iSupport[split[0]] = split[1]
      }
    }

    return {
      id,
      type: module.exports.SET_ISUPPORT,
      iSupport
    }
  },

  SET_CONNECTED: 'squelch-client-state/SET_CONNECTED',

  /**
   * Action creator for setting the connected status.
   */
  setConnected ({ id, connected }) {
    return {
      id,
      type: module.exports.SET_CONNECTED,
      connected
    }
  },

  SET_CONNECTING: 'squelch-client-state/SET_CONNECTING',

  /**
   * Action creator for setting the connecting status.
   */
  setConnecting ({ id, connecting }) {
    return {
      id,
      type: module.exports.SET_CONNECTING,
      connecting
    }
  },

  CHANGE_NICK: 'squelch-client-state/CHANGE_NICK',

  changeNick ({ id, oldNick, newNick }) {
    return {
      id,
      type: module.exports.CHANGE_NICK,
      oldNick,
      newNick
    }
  },

  DISCONNECT: 'squelch-client-state/DISCONNECT',

  disconnect ({ id }) {
    return {
      id,
      type: module.exports.DISCONNECT
    }
  }
}
