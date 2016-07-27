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

// Pass in a redux store using the reducer. You may pass in any store as long
// as it passes actions down to squelch-client-state's reducer as a subreducer.
client.use(plugin(createStore(reducer)))
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
