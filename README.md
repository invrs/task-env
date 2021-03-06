# Task Env

A framework for building reusable JS tasks.

| Feature                                     | Built With                                                     |
| ------------------------------------------- | -------------------------------------------------------------- |
| [Parse CLI arguments](#write-some-code)     | [mri](https://github.com/lukeed/mri#readme)                    |
| [Interact with the CLI](#interact)          | [Inquirer.js](https://github.com/SBoudrias/Inquirer.js#readme) |
| [Execute commands](#execute-commands)       | [commandland](https://github.com/winton/commandland#readme)    |
| [JSON and text store](#json-and-text-store) | [dot-store](https://github.com/invrs/dot-store#readme)         |

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
      sayHello: ({ hello }) => {
        console.log(">", hello)
      },
    },
  ],
})
```

## Run your task

```bash
./run sayHello --hello=hi
> hi
```

## Package tasks

Export task:

```js
export function sayHello({ hello }) {
  console.log(hello)
}
```

Require task:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  tasks: [require("./say-hello")],
})
```

## Interact

```js
export async function happy({ ask }) {
  let { happy } = await ask([
    {
      type: "confirm",
      name: "happy",
      message: "Are you happy?",
    },
  ])
}
```

See the [Inquirer.js `prompt` docs](https://github.com/SBoudrias/Inquirer.js#methods) for available options.

## Call other tasks

```js
export function sayHello({ tasks }) {
  tasks.say({ text: "hello" })
}

export function say({ text }) {
  console.log(">", text)
}
```

Calling through `tasks` binds the CLI arguments and helper functions, as if the task were called via CLI.

## Execute commands

```js
export async function ls({ run }) {
  await run("ls", ["/"])
}
```

See the [commandland docs](https://github.com/winton/commandland#execution-options) for available options.

## JSON and text store

Task env uses [dot-store](https://github.com/invrs/dot-store#readme) to provide an immutable store with atomic filesystem persistence.

Create a directory with some JSON files:

```json
{
  "users": {
    "bob": {
      "key": "~/.ssh/bob_rsa"
    }
  }
}
```

The `stores` option allows you to define multiple named stores:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  stores: {
    config: {
      pattern: "**/*",
      root: __dirname,
    },
  },
  tasks: [require("./tasks/user")],
})
```

Within your task, get and set JSON using dot-style property strings:

```js
export async function user({ config, name, key }) {
  if (key) {
    await config.set(`users.${name}.key`, key)
  }

  console.log(">", config.get(`users.${name}`))
}
```

Run via CLI:

```bash
./run user --name=bob --key=~/.ssh/id_rsa
> { key: "~/.ssh/id_rsa" }
```

## All options

| Option   | Example                                       | Purpose                                      |
| -------- | --------------------------------------------- | -------------------------------------------- |
| alias    | `{h: ["help"]}`                               | CLI arguments aliases                        |
| preSetup | `[config=>config]`                            | Pre-setup functions (before argv parsing)    |
| setup    | `[config=>config]`                            | Setup functions                              |
| stores   | `{store: {root: __dirname, pattern: "**/*"}}` | [Store configurations](#json-and-text-store) |
| teardown | `[args=>{}]`                                  | Teardown functions                           |
| tasks    | `[{ task: ({})=>{} }]`                        | Task functions                               |
