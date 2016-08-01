# squelch-client-state [![Build Status](https://travis-ci.org/squelch-irc/squelch-client-state.svg?branch=master)](https://travis-ci.org/squelch-irc/squelch-client-state) [![Coverage Status](https://coveralls.io/repos/github/squelch-irc/squelch-client-state/badge.svg?branch=master)](https://coveralls.io/github/squelch-irc/squelch-client-state?branch=master)
A Redux reducer + state for squelch-client. This keeps track of the data for the channels that squelch-client joins, including the topic, mode, and users.

A plugin for squelch-client is also available to automatically hook into the client and automatically dispatch actions for events as they happen.

## Installing
`npm install squelch-client-state`

## Example usage
```js
const { createStore } = require('redux')
const Client = require('squelch-client')
const { reducer, plugin, actions } = require('squelch-client-state');

// Create a squelch-client
const client = new Client({/* squelch-client config*/})

// Pass in a redux store using the reducer.
const store = createStore(reducer)
client.use(plugin(store))
```

It's likely that your store will not have squelch-client-state's reducer as the root reducer. In that case, you can tell the plugin where the subreducer's state is by passing the optional `getState` argument:

```js
const store = createStore(composeReducers({
    // The client reducer is now a subreducer
    client: reducer
}))
// Pass in a function that tells the plugin where to get the state from
const getState = (store) => store.getState().client
client.use(plugin(store, getState))
```

If you find the names `reducer`, `plugin`, `actions` too generic or conflicting with other variable names, use the ES6 object notation to rename them:

```js
const {
    reducer: StateReducer,
    plugin: StatePlugin,
    actions: StateActions
} = require('squelch-client-state');
```

### Actions

If you need to manually call the actions, you can access the action types and creators in `actions`. See [actions.js](/src/actions.js) for all available actions.

TODO: document actions

# Extended squelch-client functionality

This plugin adds a few things to squelch-client for convenience.

## Events

### `quit`
Event Properties: `{nick, reason, channels}`

A new **channels** property will be added to the quit event emitted by the client. It is an array of the channels that the user who quit was known to be in before they quit.

## Methods

### client.getChannel(chan)

Returns the store data for `chan`. The data will have a shape like this:

```js
{
    joined: true,
    topic: '',
    topicwho: /* Hostmask of topic setter */,
    topictime: /* Date of topic set time */,
    mode: [], // Array of mode characters set on the channel
    users: {
        nickname: '',
        oppedNick: '@',
        voicedNick: '+'
    }
}
```

### `client.getChannels()`

Returns an object with channel names for keys, and values from `getChannel(chan)` from above.

### `client.getJoinedChannels()`

Same as `getChannels()`, but filtered by channels that are currently joined.

### `client.isInChannel(chan)`

Returns true if the client is currently joined in the `chan`.

### `client.getTopic(chan)`

Returns the topic of the channel. Returns null if the channel doesn't exist in the store.

### `client.getMode(chan)`

Returns an array of mode characters set on the channel. Returns null if the channel doesn't exist in the store.

### `client.getUsers(chan)`

Returns an array of the nicknames who are currently joined in `chan`.

### `client.getUserStatus(chan, nick)`

Returns the status string of user `nick` in `chan`, like `@`, `+`, or the empty string if the user is a normal user. Returns null if the user isn't in the channel or the channel doesn't exist in the store.
