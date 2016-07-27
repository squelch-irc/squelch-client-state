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


module.exports = (store) => {
    if(!store) {
        throw new Error('Cannot create state plugin without a redux store.');
    }

    return (client) => {
        client.on('topic', e => store.dispatch(setTopic(e)));
        client.on('topicwho', e => store.dispatch(setTopicWho(e)));
        client.on('names', e => store.dispatch(updateNames(e)));
        client.on('join', e => store.dispatch(userJoin(e)));
        client.on('part', e => store.dispatch(userLeave(e)));
        client.on('kick', e => store.dispatch(userLeave(e)));
        client.on('quit', e => store.dispatch(userQuit(e)));
        client.on('+mode', e => store.dispatch(addChannelMode(store.getState(), e)));
        client.on('-mode', e => store.dispatch(removeChannelMode(store.getState(), e)));
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
