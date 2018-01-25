# Task Env

A framework for writing tasks that execute commands and persist encrypted state aynchronously.

## Install

```bash
npm install --save task-env
```

Other dependencies:

* [git-crypt](https://github.com/AGWA/git-crypt) (`brew install git-crypt`)
* [GPG Suite](https://gpgtools.org) (manual download)

## Create task runner

```bash
touch run
chmod +x run
```

Edit the file you created:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  dir: __dirname,
})
```

## Create secrets

1. Open `GPG Keychain`, click "new"
2. Enter name and email, advanced options: "RSA and RSA" and "4096"

```bash
./run secrets -e "your.gpg@email.com"
```

## Add tasks

To add task packages (such as [`ops-tasks`](/invrs/ops-tasks)):

```bash
npm install --save ops-tasks
```

Then in your task runner:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  dir: __dirname,
  tasks: require("ops-tasks"),
})
```

## Extra options

* `alias` — CLI option aliases
* `setup` — Function to run before task
* `teardown` — Function to run after task

```js
#!/usr/bin/env node

require("task-env")({
  alias: { h: "help" },
  args: process.argv.slice(2),
  dir: __dirname,
  setup: ({ help }) => {
    if (help) console.log("help!")
  },
})
```

## Writing tasks

A task function receives the CLI options and two functions (`get` and `set`):

```js
export function myTask({ hello, get, set }) {
  let value = get("verbs.hello")

  if (!value && hello) {
    set("verbs.hello", hello)
  }
}
```

The `get` and `set` functions use [`structured-json`](https://github.com/invrs/structured-json) to parse JSON and [`camel-dot-prop-immutable`](https://github.com/invrs/camel-dot-prop-immutable) to change state.

Configuration JSON lives in `./secrets/config` and can be split into multiple files.
