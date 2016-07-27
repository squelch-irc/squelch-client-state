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
} = require('./actions');

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
    if(!store) {
        throw new Error('Cannot create state plugin without a redux store.');
    }

    return (client) => {
        client._.internalEmitter.on('quit', e => {
            // Add channels the user was in to the event object
            const { channels } = getState(store);
            const leftChannels = Object.keys(channels).filter(ch => {
                return channels[ch].users[e.nick] !== undefined;
            });
            e.channels = leftChannels;
        });

        client.on('topic', e => store.dispatch(setTopic(e)));
        client.on('topicwho', e => store.dispatch(setTopicWho(e)));
        client.on('names', e => store.dispatch(updateNames(e)));
        client.on('join', e => store.dispatch(userJoin(e)));
        client.on('part', e => store.dispatch(userLeave(e)));
        client.on('kick', e => store.dispatch(userLeave(e)));
        client.on('quit', e => store.dispatch(userQuit(e)));
        client.on('+mode', e => store.dispatch(addChannelMode(getState(store), e)));
        client.on('-mode', e => store.dispatch(removeChannelMode(getState(store), e)));
        client.on('connecting', () => store.dispatch(setConnecting(true)));
        client.on('connect', () => {
            store.dispatch(setConnecting(false));
            store.dispatch(setConnected(true));
        });
        client.on('disconnect', () => {
            store.dispatch(disconnect());
        });
        client.on('raw', (e) => {
            if(e.command == '005') store.dispatch(setISupport(e));
        });
    };
};
