# probot.db

## ProBot embed messages feature based database, lol

Store your data in ProBot database easily, using the embed messages feature, for free :).

## Installation

```sh
npm install probot.db
```

## Usage

Now all you need is the server id that has ProBot in, and your auth token from probot.io.

```js
const Database = require('probot.db');
const database = new Database('auth token', 'server id', { embedName: 'probot.db' });

await database.set('foo', 'bar');
await database.get('foo'); // bar
await database.delete('foo');
await database.clear();
```
