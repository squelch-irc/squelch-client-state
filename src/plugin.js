const {
    setTopic,
    setTopicWho,
    updateNames,
    userJoin,
    userLeave,
    userQuit,
    addChannelMode,
    removeChannelMode,
    setISupport,
    setConnected,
    setConnecting,
    disconnect
} = require('./actions')

/**
 * Plugin for squelch-client-state.
 * @param  {Store} store        The redux store to send dispatches to
 * @param  {Function} getState  A function that returns the state corresponding
 *                              to the squelch-client-state reducer. This
 *                              defaults to returning the root state. If your
 *                              state object has the client reducer as a
 *                              subreducer, pass in a getState function that
 *                              returns the correct substate. The function will
 *                              be passed the store as its only argument.
 * @return {Function}           The plugin function to be used with client.use()
 */
module.exports = (store, getState = store => store.getState()) => {
  if (!store) {
    throw new Error('Cannot create state plugin without a redux store.')
  }

  return (client) => {
    // Modify quit event data
    client._.internalEmitter.on('quit', e => {
      // Add channels the user was in to the event object
      const { channels } = getState(store)
      const leftChannels = Object.keys(channels).filter(ch => {
        return channels[ch].users[e.nick] !== undefined
      })
      e.channels = leftChannels
    })

    // Register listeners
    client.on('topic', e => store.dispatch(setTopic(e)))
    client.on('topicwho', e => store.dispatch(setTopicWho(e)))
    client.on('names', e => store.dispatch(updateNames(e)))
    client.on('join', e => store.dispatch(userJoin(e)))
    client.on('part', e => store.dispatch(userLeave(e)))
    client.on('kick', e => store.dispatch(userLeave(e)))
    client.on('quit', e => store.dispatch(userQuit(e)))
    client.on('+mode', e => store.dispatch(addChannelMode(getState(store), e)))
    client.on('-mode', e => store.dispatch(removeChannelMode(getState(store), e)))
    client.on('connecting', e => store.dispatch(setConnecting({
      ...e,
      connecting: true
    })))
    client.on('connect', e => {
      store.dispatch(setConnecting({ ...e, connecting: false }))
      store.dispatch(setConnected({ ...e, connected: true }))
    })
    client.on('disconnect', e => store.dispatch(disconnect(e)))
    client.on('raw', (e) => {
      if (e.command === '005') store.dispatch(setISupport(e))
    })

    // Add convenience functions

    /**
     * Gets the data for a channel in the store.
     * @param  {String} chan The channel to return data for
     * @return {Object}      The channel data for chan. See README for what
     *                       data is available.
     */
    // TODO: put state shape in README
    client.getChannel = function (chan) {
      return this.getChannels()[chan]
    }

    /**
     * Gets the data for all channels in the store.
     * @return {Object} An object with channel names for keys, and
     *                  corresponding data object for values.
     */
    client.getChannels = function () {
      return getState(store).channels
    }

    /**
     * Gets the data for all channels the client is currently joined in.
     * @return {Object} An object with channel names for keys, and
     *                  corresponding data object for values.
     */
    client.getJoinedChannels = function () {
      const channels = getState(store).channels
      const joinedChannels = {}
      Object.keys(channels).filter(name => channels[name].joined)
            .forEach(name => { joinedChannels[name] = channels[name] })
      return joinedChannels
    }

    /**
     * Checks if the client is currently joined in a channel.
     * @param  {String} chan The channel name
     * @return {Boolean}     True if the client is currently joined in chan
     */
    client.isInChannel = function (chan) {
      const channel = this.getChannel(chan)
      return !!(channel && channel.joined)
    }

    /**
     * Returns the topic of a channel.
     * @param  {String} chan The channel name
     * @return {String|null}      The topic of the channel, or null if the
     *                       channel isn't in the store.
     */
    client.getTopic = function (chan) {
      const channel = this.getChannel(chan)
      if (!channel) return null
      return channel.topic
    }

    /**
     * Returns the modes set in a channel.
     * @param  {String} chan The channel name
     * @return {String|null} An array of mode characters set in the channel,
     *                       or null if the channel isn't in the store.
     */
    client.getMode = function (chan) {
      const channel = this.getChannel(chan)
      if (!channel) return null
      return channel.mode
    }

    /**
     * Returns an array of user nicknames currently joined in a channels
     * @param  {String} chan The channel name
     * @return {String[]}    An array of nicknames of users who are currently
     *                       joined in the channel
     */
    client.getUsers = function (chan) {
      const channel = this.getChannel(chan)
      if (!channel) return null
      return Object.keys(channel.users)
    }

    /**
     * Returns the status symbol of the user in the given channel.
     * @param  {String} chan The channel name
     * @param  {String} user The user's nicknames
     * @return {String|null} The status symbol of the user in the channel.
     *                       If the user is a normal user, then an empty
     *                       string is returned. If the user is not in the
     *                       channel or the channel doesn't exist, null is
     *                       returned.
     */
    client.getUserStatus = function (chan, user) {
      const channel = this.getChannel(chan)
      if (!channel) return null
      return channel.users[user] !== undefined ? channel.users[user] : null
    }
  }
}
