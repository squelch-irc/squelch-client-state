const test = require('ava');
const EventEmitter = require('events');

const Plugin = require('../src/plugin');
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
} = require('../src/actions');

const makeStore = () => {
    return {
        actions: [],
        dispatch(action) {
            this.actions.push(action);
        },
        getState() {
            // Fake state for prefix data
            return { iSupport: { PREFIX: { o: '@', v: '+' } } };
        }
    };

};

const makeClient = () => {
    return new EventEmitter();
};

const setup = () => {
    const store = makeStore();
    const client = makeClient();
    Plugin(store)(client);
    return { store, client };
};

test('throw without store', t => {
    t.throws(() => Plugin());
});

test('topic', t => {
    const { store, client } = setup();

    const e = { chan: '#bdsmdungeon', topic: 'RIP AnalDawg' };
    client.emit('topic', e);

    t.deepEqual(store.actions[0], setTopic(e));
});

test('topicwho', t => {
    const { store, client } = setup();

    const e = { chan: '#bdsmdungeon', hostmask: 'whatever', time: new Date() };
    client.emit('topicwho', e);

    t.deepEqual(store.actions[0], setTopicWho(e));
});

test('names', t => {
    const { store, client } = setup();

    const e = { chan: '#bdsmdungeon', names: { AnalDawg: '@', PleasureKevin: '' } };
    client.emit('names', e);

    t.deepEqual(store.actions[0], updateNames(e));
});

test('join', t => {
    const { store, client } = setup();

    const e = { chan: '#bdsmdungeon', nick: 'PleasureKevin', me: false };
    client.emit('join', e);

    t.deepEqual(store.actions[0], userJoin(e));
});

test('part', t => {
    const { store, client } = setup();

    const e = { chan: '#bdsmdungeon', nick: 'PleasureKevin', me: false };
    client.emit('part', e);

    t.deepEqual(store.actions[0], userLeave(e));
});

test('kick', t => {
    const { store, client } = setup();

    const e = { chan: '#bdsmdungeon', nick: 'PleasureKevin', kicker: 'Hotpriest', reason: '', me: false };
    client.emit('kick', e);

    t.deepEqual(store.actions[0], userLeave(e));
});

test('quit', t => {
    const { store, client } = setup();

    const e = { nick: 'PleasureKevin' };
    client.emit('quit', e);

    t.deepEqual(store.actions[0], userQuit(e));
});

test('+mode', t => {
    const { store, client } = setup();

    const e = { chan: '#bdsmdungeon', sender: 'Hotpriest', mode: 'o', param: 'PleasureKevin' };
    client.emit('+mode', e);

    t.deepEqual(store.actions[0], addChannelMode(store.getState(), e));
});

test('-mode', t => {
    const { store, client } = setup();

    const e = { chan: '#bdsmdungeon', sender: 'Hotpriest', mode: 'o', param: 'PleasureKevin' };
    client.emit('-mode', e);

    t.deepEqual(store.actions[0], removeChannelMode(store.getState(), e));
});

test('connecting', t => {
    const { store, client } = setup();

    const e = { server: 'irc.somethingawful.com', port: 6667 };
    client.emit('connecting', e);

    t.deepEqual(store.actions[0], setConnecting(true));
});

test('connect', t => {
    const { store, client } = setup();

    const e = { nick: 'Hotpriest', server: 'irc.somethingawful.com', port: 6667 };
    client.emit('connect', e);

    t.deepEqual(store.actions[0], setConnecting(false));
    t.deepEqual(store.actions[1], setConnected(true));
});

test('disconnect', t => {
    const { store, client } = setup();

    const e = { reason: 'No reason at all.' };
    client.emit('disconnect', e);

    t.deepEqual(store.actions[0], disconnect());
});

test('iSupport', t => {
    const { store, client } = setup();

    const e = {
        command: '005',
        params: [
            'Hotpriest',
            'CHANTYPES=#',
            'EXCEPTS',
            'INVEX',
            'CHANMODES=eIbq,k,flj,CFPcgimnpstz',
            'CHANLIMIT=#:50',
            'PREFIX=(ov)@+',
            'MAXLIST=bqeI:100',
            'MODES=4',
            'NETWORK=IRCNet',
            'KNOCK',
            'STATUSMSG=@+',
            'CALLERID=g',
            'are supported by this server'
        ]
    };
    client.emit('raw', e);

    t.deepEqual(store.actions[0], setISupport(e));
});
