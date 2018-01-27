# Task Env

A framework for building reusable JS tasks.

* Run commands with precise stdin/stdout control ([commandland](../commandland))
* Human-readable JSON store ([Structured JSON](../structured-json) + [camel-dot-prop-immutable](../camel-dot-prop-immutable))

## Install

```bash
npm install --save-dev task-env
```

## Create an executable

```bash
touch run
chmod +x run
```

## Write some code

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  tasks: [
    {
      myTask: ({ hello }) => {
        console.log(hello)
      },
    },
  ],
})
```

## Run your task

```bash
./run my.task --hello=hi
```

## Package tasks

Export task functions:

```js
export function myTask({ hello }) {
  console.log(hello)
}
```

Add functions to `tasks` option `Array`:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  tasks: [require("./my-task")],
})
```

## JSON store

The `jsonDir` option specifies a directory of JSON files to use as a dynamic store.

Task functions receive a getter/setter:

```js
export function myTask({ hello, get, set }) {
  let value = get("verbs.hello")

  if (!value && hello) {
    set("verbs.hello", hello)
  }
}
```

The `get` function uses [`camel-dot-prop-immutable`](https://github.com/invrs/camel-dot-prop-immutable) to access the JSON parsed with [Structured JSON](https://github.com/invrs/structured-json).

The `set` function also uses [`camel-dot-prop-immutable`](https://github.com/invrs/camel-dot-prop-immutable) to immutably write to the unparsed store and the JSON file.

It is important to remember that `get` reads **parsed** [Structured JSON](https://github.com/invrs/structured-json) and `set` writes to the **unparsed** JSON structure.

## All options

* `alias` — `Object` with argument/aliases as key/value
* `conditions` — `Array` of [Structured JSON](../structured-json) condition `Strings`
* `jsonDir` — JSON store directory path `String`
* `setup` — `Array` of functions to run before task
* `teardown` — `Array` of functions to run after task
* `tasks` - `Array` of `Objects` with task name/function as key/value

```js
#!/usr/bin/env node

require("task-env")({
  alias: { h: "help" },
  args: process.argv.slice(2),
  jsonDir: `${__dirname}/config`,
  setup: [
    ({ help }) => {
      if (help) console.log("help!")
    },
  ],
})
```
