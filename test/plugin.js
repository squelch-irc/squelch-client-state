const test = require('ava');
const EventEmitter = require('events');

const Plugin = require('../src/plugin');
const {
    setTopic,
    setTopicWho,
    updateNames,
    userJoin,
    userLeave,
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
    const client = new EventEmitter();
    client._ = {
        internalEmitter: new EventEmitter()
    };

    const oldEmit = client.emit;
    client.emit = function(...args) {
        if(args[0] !== 'error')
            this._.internalEmitter.emit(...args);
        oldEmit.apply(this, args);
    };

    return client;
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
    store.getState = () => {
        return {
            channels: {
                '#bdsmdungeon': {
                    joined: true,
                    topic: '',
                    topicwho: '',
                    topictime: null,
                    mode: [],
                    users: { PleasureKevin: '' }
                }
            }
        };
    };

    client.on('quit', ({ nick, channels }) => {
        t.is(nick, 'PleasureKevin');
        t.deepEqual(channels, ['#bdsmdungeon']);
    });
    const e = { nick: 'PleasureKevin' };
    client.emit('quit', e);
    t.deepEqual(e.channels, ['#bdsmdungeon']);
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

    const e2 = { ...e, command: '420' };
    client.emit('raw', e2);

    // Should not have emitted an action
    t.is(store.actions.length, 1);
});

test('getState for substate', t => {
    // Client is now a substate
    const store = makeStore();
    store.getState = () => { return { client: { iSupport: { PREFIX: { o: '@', v: '+' } } } }; };
    const getState = (store) => store.getState().client;
    const client = makeClient();
    // Test if overriding getState properly returns the correct substate for the plugin
    Plugin(store, getState)(client);

    let e = { chan: '#bdsmdungeon', sender: 'Hotpriest', mode: 'o', param: 'PleasureKevin' };
    client.emit('+mode', e);

    e = { chan: '#bdsmdungeon', sender: 'Hotpriest', mode: 'o', param: 'PleasureKevin' };
    client.emit('-mode', e);


    t.deepEqual(store.actions[0], addChannelMode(store.getState().client, e));
    t.deepEqual(store.actions[1], removeChannelMode(store.getState().client, e));
});

// Test convenience functions
const presetState = {
    channels: {
        '#bdsmdungeon': {
            joined: true,
            topic: 'AnalDawg Funeral this Sunday @ 9AM',
            topicwho: '~Hotpriest@irc.somethingawful.com',
            topictime: new Date(),
            mode: ['n', 'p', 't'],
            users: {
                Hotpriest: '@',
                Sex_King: '',
                misterarson_: '',
                PATRIOT1959: '',
                PleasureKevin: '+',
                malediapered: '',
                DISABLEDMAN: '',
                BaseballTrivia: ''
            }
        },
        '#furry': {
            joined: false,
            topic: '',
            topicwho: '',
            topictime: null,
            mode: [],
            users: {}
        }
    }
};

const getPresetState = () => {
    return presetState;
};

const setupPresetClient = () => {
    const client = makeClient();
    Plugin({}, getPresetState)(client);
    return client;
};

test('getChannel', t => {
    const client = setupPresetClient();

    t.is(client.getChannel('#bdsmdungeon'), presetState.channels['#bdsmdungeon']);
    t.is(client.getChannel('#furry'), presetState.channels['#furry']);
});

test('getChannels', t => {
    const client = setupPresetClient();

    t.is(client.getChannels(), presetState.channels);
});

test('getJoinedChannels', t => {
    const client = setupPresetClient();

    t.deepEqual(client.getJoinedChannels(), {
        '#bdsmdungeon': presetState.channels['#bdsmdungeon']
    });
});

test('isInChannel', t => {
    const client = setupPresetClient();

    t.true(client.isInChannel('#bdsmdungeon'));
    t.false(client.isInChannel('#furry'));
    t.false(client.isInChannel('#somenonexistentchannel'));
});

test('getTopic', t => {
    const client = setupPresetClient();

    t.is(client.getTopic('#bdsmdungeon'), 'AnalDawg Funeral this Sunday @ 9AM');
    t.is(client.getTopic('#furry'), '');
    t.is(client.getTopic('#somenonexistent'), null);
});

test('getMode', t => {
    const client = setupPresetClient();

    t.deepEqual(client.getMode('#bdsmdungeon'), ['n', 'p', 't']);
    t.deepEqual(client.getMode('#furry'), []);
    t.is(client.getMode('#somenonexistent'), null);
});

test('getUsers', t => {
    const client = setupPresetClient();

    t.deepEqual(client.getUsers('#bdsmdungeon'), [
        'Hotpriest',
        'Sex_King',
        'misterarson_',
        'PATRIOT1959',
        'PleasureKevin',
        'malediapered',
        'DISABLEDMAN',
        'BaseballTrivia'
    ]);
    t.deepEqual(client.getUsers('#furry'), []);
    t.deepEqual(client.getUsers('#nowhere'), null);
});

test('getUserStatus', t => {
    const client = setupPresetClient();

    t.is(client.getUserStatus('#bdsmdungeon', 'Hotpriest'), '@');
    t.is(client.getUserStatus('#bdsmdungeon', 'PleasureKevin'), '+');
    t.is(client.getUserStatus('#bdsmdungeon', 'DISABLEDMAN'), '');

    t.is(client.getUserStatus('#furry', 'nobody'), null);

    t.is(client.getUserStatus('#nowhere', 'nobody'), null);
});
